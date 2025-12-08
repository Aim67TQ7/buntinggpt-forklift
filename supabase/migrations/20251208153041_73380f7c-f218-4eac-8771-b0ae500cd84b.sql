-- Add label column to forklift_checklist_questions for short labels like Q1, Q2, etc.
ALTER TABLE public.forklift_checklist_questions
ADD COLUMN label TEXT;

-- Set default labels based on sort_order
UPDATE public.forklift_checklist_questions
SET label = 'Q' || sort_order
WHERE label IS NULL;