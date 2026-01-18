-- Create creators table for roster management
CREATE TABLE public.creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  instagram_handle TEXT NOT NULL,
  location TEXT,
  followers TEXT,
  image TEXT,
  niche TEXT,
  expertise TEXT[],
  bio TEXT,
  tiktok_handle TEXT,
  metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.creators ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (roster is public)
CREATE POLICY "Creators are viewable by everyone" 
ON public.creators 
FOR SELECT 
USING (true);

-- Create policy for admin updates (using a simple approach for now)
-- In production, you'd want proper admin role management
CREATE POLICY "Anyone can insert creators" 
ON public.creators 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update creators" 
ON public.creators 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete creators" 
ON public.creators 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_creators_updated_at
BEFORE UPDATE ON public.creators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();