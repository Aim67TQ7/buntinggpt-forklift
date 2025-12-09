-- Create junction table for forklift-specific questions
CREATE TABLE public.forklift_question_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  forklift_id UUID NOT NULL REFERENCES public.forklift_units(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.forklift_checklist_questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(forklift_id, question_id)
);

-- Enable RLS
ALTER TABLE public.forklift_question_assignments ENABLE ROW LEVEL SECURITY;

-- Allow public read/write (matching other forklift tables)
CREATE POLICY "Allow public read assignments"
ON public.forklift_question_assignments
FOR SELECT USING (true);

CREATE POLICY "Allow public insert assignments"
ON public.forklift_question_assignments
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete assignments"
ON public.forklift_question_assignments
FOR DELETE USING (true);