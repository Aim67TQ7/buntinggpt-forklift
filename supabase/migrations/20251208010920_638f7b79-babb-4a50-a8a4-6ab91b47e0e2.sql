-- Add admin_notes column to forklift_checklist_responses for repair comments
ALTER TABLE public.forklift_checklist_responses 
ADD COLUMN admin_notes text;