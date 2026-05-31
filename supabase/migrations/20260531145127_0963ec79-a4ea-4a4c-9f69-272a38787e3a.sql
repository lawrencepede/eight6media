
-- Creators: keep public SELECT (public roster site), restrict writes to authenticated
DROP POLICY IF EXISTS "Anyone can insert creators" ON public.creators;
DROP POLICY IF EXISTS "Anyone can update creators" ON public.creators;
DROP POLICY IF EXISTS "Anyone can delete creators" ON public.creators;

CREATE POLICY "Authenticated can insert creators" ON public.creators
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update creators" ON public.creators
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete creators" ON public.creators
  FOR DELETE TO authenticated USING (true);

-- Deals: fully internal, authenticated only
DROP POLICY IF EXISTS "Team members can view deals" ON public.deals;
DROP POLICY IF EXISTS "Team members can insert deals" ON public.deals;
DROP POLICY IF EXISTS "Team members can update deals" ON public.deals;
DROP POLICY IF EXISTS "Team members can delete deals" ON public.deals;

CREATE POLICY "Authenticated can view deals" ON public.deals
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert deals" ON public.deals
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update deals" ON public.deals
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete deals" ON public.deals
  FOR DELETE TO authenticated USING (true);

-- Instagram connections: authenticated only
DROP POLICY IF EXISTS "Team members can view all connections" ON public.instagram_connections;
DROP POLICY IF EXISTS "Team members can insert connections" ON public.instagram_connections;
DROP POLICY IF EXISTS "Team members can update connections" ON public.instagram_connections;
DROP POLICY IF EXISTS "Team members can delete connections" ON public.instagram_connections;

CREATE POLICY "Authenticated can view connections" ON public.instagram_connections
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert connections" ON public.instagram_connections
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update connections" ON public.instagram_connections
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated can delete connections" ON public.instagram_connections
  FOR DELETE TO authenticated USING (true);

-- Instagram insights: authenticated only
DROP POLICY IF EXISTS "Team members can view all insights" ON public.instagram_insights;
DROP POLICY IF EXISTS "Team members can insert insights" ON public.instagram_insights;
DROP POLICY IF EXISTS "Team members can delete insights" ON public.instagram_insights;

CREATE POLICY "Authenticated can view insights" ON public.instagram_insights
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert insights" ON public.instagram_insights
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can delete insights" ON public.instagram_insights
  FOR DELETE TO authenticated USING (true);

-- Imported contacts: scope to importer
DROP POLICY IF EXISTS "Authenticated can view imported contacts" ON public.imported_contacts;
DROP POLICY IF EXISTS "Authenticated can insert imported contacts" ON public.imported_contacts;
DROP POLICY IF EXISTS "Authenticated can update imported contacts" ON public.imported_contacts;

CREATE POLICY "Users can view their imported contacts" ON public.imported_contacts
  FOR SELECT TO authenticated USING (auth.uid() = imported_by);
CREATE POLICY "Users can insert their imported contacts" ON public.imported_contacts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = imported_by);
CREATE POLICY "Users can update their imported contacts" ON public.imported_contacts
  FOR UPDATE TO authenticated USING (auth.uid() = imported_by) WITH CHECK (auth.uid() = imported_by);
CREATE POLICY "Users can delete their imported contacts" ON public.imported_contacts
  FOR DELETE TO authenticated USING (auth.uid() = imported_by);
