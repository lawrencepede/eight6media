-- Add unique constraint on source_id for upsert operations
ALTER TABLE public.talent_updates 
ADD CONSTRAINT talent_updates_source_id_key UNIQUE (source_id);