import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: (returnTo?: string) => Promise<{ error: Error | null }>;
  connectGmail: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Store Gmail tokens if available from Google OAuth
        if (event === 'SIGNED_IN' && session?.provider_token && session?.provider_refresh_token) {
          // Use setTimeout to avoid blocking the auth flow
          setTimeout(async () => {
            try {
              const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour from now
              
              await supabase.from('gmail_tokens').upsert({
                user_id: session.user.id,
                access_token: session.provider_token,
                refresh_token: session.provider_refresh_token,
                token_expires_at: expiresAt,
              }, {
                onConflict: 'user_id',
              });
              console.log('Gmail tokens stored successfully');
            } catch (error) {
              console.error('Failed to store Gmail tokens:', error);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (returnTo?: string) => {
    // Use provided returnTo, or default to /console for authenticated areas
    const redirectUrl = `${window.location.origin}${returnTo || '/console'}`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        scopes: "openid email profile",
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    
    return { error: error ? new Error(error.message) : null };
  };

  const connectGmail = async () => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
        scopes: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
      },
    });
    
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error ? new Error(error.message) : null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    // Optimistically clear local auth state so UI updates immediately
    // (prevents brief redirects caused by stale `user` state)
    setSession(null);
    setUser(null);
    setIsLoading(false);

    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signInWithGoogle,
        connectGmail,
        signInWithEmail,
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
