-- Add slug column for string identifiers
ALTER TABLE public.creators ADD COLUMN slug TEXT UNIQUE;