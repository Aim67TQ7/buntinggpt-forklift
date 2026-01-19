-- Add certification fields to qualified drivers
ALTER TABLE public.forklift_qualified_drivers
ADD COLUMN certified_date DATE,
ADD COLUMN recertify_date DATE,
ADD COLUMN trainer TEXT;