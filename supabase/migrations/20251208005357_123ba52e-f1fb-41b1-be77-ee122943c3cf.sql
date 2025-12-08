-- Qualified forklift drivers table
CREATE TABLE public.forklift_qualified_drivers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_number TEXT NOT NULL UNIQUE,
  driver_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forklift_qualified_drivers ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Allow public read drivers" ON public.forklift_qualified_drivers FOR SELECT USING (true);
CREATE POLICY "Allow public insert drivers" ON public.forklift_qualified_drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update drivers" ON public.forklift_qualified_drivers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete drivers" ON public.forklift_qualified_drivers FOR DELETE USING (true);