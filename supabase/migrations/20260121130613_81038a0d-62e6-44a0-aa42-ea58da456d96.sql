-- Add unique constraint for upsert on client_updates
ALTER TABLE public.client_updates ADD CONSTRAINT client_updates_source_source_id_key UNIQUE (source, source_id);