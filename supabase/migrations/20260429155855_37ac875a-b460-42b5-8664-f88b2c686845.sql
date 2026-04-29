CREATE TABLE public.imported_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seamless_contact_id text UNIQUE,
  hubspot_contact_id text,
  email text,
  full_name text,
  company text,
  title text,
  imported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  raw_seamless_payload jsonb DEFAULT '{}'::jsonb,
  raw_hubspot_response jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'created'
);

CREATE INDEX idx_imported_contacts_email ON public.imported_contacts (lower(email));
CREATE INDEX idx_imported_contacts_imported_at ON public.imported_contacts (imported_at DESC);

ALTER TABLE public.imported_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view imported contacts"
  ON public.imported_contacts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert imported contacts"
  ON public.imported_contacts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update imported contacts"
  ON public.imported_contacts FOR UPDATE TO authenticated USING (true);