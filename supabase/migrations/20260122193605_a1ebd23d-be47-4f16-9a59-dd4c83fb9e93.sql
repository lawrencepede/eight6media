-- Step 1: Drop existing RLS policies
DROP POLICY IF EXISTS "Team members can view all client updates" ON public.client_updates;
DROP POLICY IF EXISTS "Team members can insert client updates" ON public.client_updates;

-- Step 2: Drop existing constraint
ALTER TABLE public.client_updates DROP CONSTRAINT IF EXISTS client_updates_source_source_id_key;

-- Step 3: Rename the column first (before table rename)
ALTER TABLE public.client_updates RENAME COLUMN client_name TO talent_name;

-- Step 4: Rename the table
ALTER TABLE public.client_updates RENAME TO talent_updates;

-- Step 5: Recreate the unique constraint with new name
ALTER TABLE public.talent_updates ADD CONSTRAINT talent_updates_source_source_id_key UNIQUE (source, source_id);

-- Step 6: Recreate RLS policies with new names
CREATE POLICY "Team members can view all talent updates"
  ON public.talent_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team members can insert talent updates"
  ON public.talent_updates FOR INSERT
  TO authenticated
  WITH CHECK (true);