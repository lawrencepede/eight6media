-- Create deals table for tracking deal statuses from Google Sheets
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_name TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pipeline',
  notes TEXT,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(talent_name, brand_name)
);

-- Enable Row Level Security
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Create policies for team members
CREATE POLICY "Team members can view deals" 
ON public.deals 
FOR SELECT 
USING (true);

CREATE POLICY "Team members can insert deals" 
ON public.deals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Team members can update deals" 
ON public.deals 
FOR UPDATE 
USING (true);

CREATE POLICY "Team members can delete deals" 
ON public.deals 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();