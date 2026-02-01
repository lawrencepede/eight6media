-- Table to store Instagram account connections with OAuth tokens
CREATE TABLE public.instagram_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    creator_id UUID REFERENCES public.creators(id) ON DELETE CASCADE,
    instagram_user_id TEXT NOT NULL,
    instagram_username TEXT NOT NULL,
    access_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    page_id TEXT,
    page_name TEXT,
    connected_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(instagram_user_id)
);

-- Table to store Instagram analytics/insights data
CREATE TABLE public.instagram_insights (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    connection_id UUID REFERENCES public.instagram_connections(id) ON DELETE CASCADE NOT NULL,
    metric_date DATE NOT NULL,
    followers_count INTEGER,
    media_count INTEGER,
    impressions INTEGER,
    reach INTEGER,
    profile_views INTEGER,
    website_clicks INTEGER,
    engagement_rate DECIMAL(5,2),
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(connection_id, metric_date)
);

-- Enable RLS on both tables
ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for instagram_connections
CREATE POLICY "Team members can view all connections"
ON public.instagram_connections
FOR SELECT
USING (true);

CREATE POLICY "Team members can insert connections"
ON public.instagram_connections
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Team members can update connections"
ON public.instagram_connections
FOR UPDATE
USING (true);

CREATE POLICY "Team members can delete connections"
ON public.instagram_connections
FOR DELETE
USING (true);

-- RLS policies for instagram_insights
CREATE POLICY "Team members can view all insights"
ON public.instagram_insights
FOR SELECT
USING (true);

CREATE POLICY "Team members can insert insights"
ON public.instagram_insights
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Team members can delete insights"
ON public.instagram_insights
FOR DELETE
USING (true);

-- Add trigger for updated_at on instagram_connections
CREATE TRIGGER update_instagram_connections_updated_at
BEFORE UPDATE ON public.instagram_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();