
-- Storage bucket for brand logos
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-logos', 'brand-logos', true);

-- Allow public read access to brand logos
CREATE POLICY "Public read access for brand logos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'brand-logos');

-- Allow authenticated users to upload brand logos
CREATE POLICY "Authenticated users can upload brand logos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brand-logos');

-- Allow authenticated users to update brand logos
CREATE POLICY "Authenticated users can update brand logos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brand-logos');

-- Allow authenticated users to delete brand logos
CREATE POLICY "Authenticated users can delete brand logos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brand-logos');

-- Brand assets table
CREATE TABLE public.brand_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL UNIQUE,
  logo_url text,
  icon_url text,
  brand_colors jsonb DEFAULT '[]'::jsonb,
  industry text,
  description text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view brand assets" ON public.brand_assets FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert brand assets" ON public.brand_assets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update brand assets" ON public.brand_assets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete brand assets" ON public.brand_assets FOR DELETE TO authenticated USING (true);

-- Talent-brand relationships table
CREATE TABLE public.talent_brand_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES public.brand_assets(id) ON DELETE CASCADE,
  campaign_name text,
  deal_value text,
  status text DEFAULT 'completed',
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(creator_id, brand_id, campaign_name)
);

ALTER TABLE public.talent_brand_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view talent brand relationships" ON public.talent_brand_relationships FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert relationships" ON public.talent_brand_relationships FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update relationships" ON public.talent_brand_relationships FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete relationships" ON public.talent_brand_relationships FOR DELETE TO authenticated USING (true);

-- Updated_at triggers
CREATE TRIGGER update_brand_assets_updated_at BEFORE UPDATE ON public.brand_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_talent_brand_relationships_updated_at BEFORE UPDATE ON public.talent_brand_relationships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
