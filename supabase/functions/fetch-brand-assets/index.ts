import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BRANDFETCH_CLIENT_ID = Deno.env.get("BRANDFETCH_CLIENT_ID");
    if (!BRANDFETCH_CLIENT_ID) {
      throw new Error("BRANDFETCH_CLIENT_ID is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { domain } = await req.json();
    if (!domain) {
      throw new Error("Domain is required");
    }

    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
    console.log(`Fetching logo for: ${cleanDomain}`);

    // Use Logo API CDN to fetch logo and icon
    const logoUrl = `https://cdn.brandfetch.io/${cleanDomain}/logo?c=${BRANDFETCH_CLIENT_ID}`;
    const iconUrl = `https://cdn.brandfetch.io/${cleanDomain}/icon?c=${BRANDFETCH_CLIENT_ID}`;

    let storedLogoUrl: string | null = null;
    let storedIconUrl: string | null = null;

    // Helper: validate response is an actual image (not a placeholder)
    const MIN_LOGO_SIZE = 3000; // 3KB minimum to reject Brandfetch placeholders
    const isValidImage = (res: Response) => {
      const ct = res.headers.get("content-type") || "";
      return res.ok && ct.startsWith("image/");
    };
    const isValidBlob = (blob: Blob) => blob.size >= MIN_LOGO_SIZE;

    // Download and store logo
    try {
      const logoRes = await fetch(logoUrl, { redirect: "follow" });
      if (isValidImage(logoRes)) {
        const logoBlob = await logoRes.blob();
        if (isValidBlob(logoBlob)) {
          const contentType = logoRes.headers.get("content-type") || "image/png";
          const ext = contentType.includes("svg") ? "svg" : contentType.includes("webp") ? "webp" : "png";
          const logoPath = `${cleanDomain}/logo.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("brand-logos")
            .upload(logoPath, logoBlob, { contentType, upsert: true });

          if (!uploadError) {
            storedLogoUrl = supabase.storage.from("brand-logos").getPublicUrl(logoPath).data.publicUrl;
          } else {
            console.error("Logo upload error:", uploadError);
          }
        } else {
          console.log(`Logo too small for ${cleanDomain} (${logoBlob.size} bytes) — likely a placeholder, skipping`);
        }
      } else {
        console.log(`Logo not found for ${cleanDomain} (status: ${logoRes.status}, content-type: ${logoRes.headers.get("content-type")})`);
      }
    } catch (e) {
      console.error("Logo download error:", e);
    }

    // Download and store icon
    try {
      const iconRes = await fetch(iconUrl, { redirect: "follow" });
      if (isValidImage(iconRes)) {
        const iconBlob = await iconRes.blob();
        if (isValidBlob(iconBlob)) {
          const contentType = iconRes.headers.get("content-type") || "image/png";
          const ext = contentType.includes("svg") ? "svg" : contentType.includes("webp") ? "webp" : "png";
          const iconPath = `${cleanDomain}/icon.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("brand-logos")
            .upload(iconPath, iconBlob, { contentType, upsert: true });

          if (!uploadError) {
            storedIconUrl = supabase.storage.from("brand-logos").getPublicUrl(iconPath).data.publicUrl;
          } else {
            console.error("Icon upload error:", uploadError);
          }
        } else {
          console.log(`Icon too small for ${cleanDomain} (${iconBlob.size} bytes) — likely a placeholder, skipping`);
        }
      } else {
        console.log(`Icon not found for ${cleanDomain} (status: ${iconRes.status}, content-type: ${iconRes.headers.get("content-type")})`);
      }
    } catch (e) {
      console.error("Icon download error:", e);
    }

    // Upsert brand_assets
    const { data: brandAsset, error: upsertError } = await supabase
      .from("brand_assets")
      .upsert(
        {
          name: cleanDomain.replace(/\.com$/, "").replace(/\./g, " ").toUpperCase(),
          domain: cleanDomain,
          logo_url: storedLogoUrl,
          icon_url: storedIconUrl,
        },
        { onConflict: "domain" }
      )
      .select()
      .single();

    if (upsertError) {
      throw new Error(`Database upsert error: ${upsertError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, brand: brandAsset }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error fetching brand assets:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
