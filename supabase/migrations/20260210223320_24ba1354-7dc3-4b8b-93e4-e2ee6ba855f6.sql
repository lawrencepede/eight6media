
ALTER TABLE public.instagram_connections DROP COLUMN access_token;
ALTER TABLE public.instagram_connections DROP COLUMN token_expires_at;
ALTER TABLE public.instagram_connections ADD COLUMN ig_business_account_id text;
