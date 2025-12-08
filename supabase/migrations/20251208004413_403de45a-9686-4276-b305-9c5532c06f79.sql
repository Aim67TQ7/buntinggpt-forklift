-- Forklift checklist tables

-- Forklifts table
CREATE TABLE public.forklift_units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  unit_number TEXT NOT NULL UNIQUE,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Checklist questions table
CREATE TABLE public.forklift_checklist_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Checklist submissions table
CREATE TABLE public.forklift_checklist_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_number TEXT NOT NULL,
  forklift_id UUID NOT NULL REFERENCES public.forklift_units(id),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  has_failures BOOLEAN DEFAULT false
);

-- Individual item responses
CREATE TABLE public.forklift_checklist_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.forklift_checklist_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.forklift_checklist_questions(id),
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'na')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fail notifications for admin
CREATE TABLE public.forklift_fail_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.forklift_checklist_submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.forklift_checklist_questions(id),
  badge_number TEXT NOT NULL,
  forklift_name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forklift_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forklift_checklist_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forklift_checklist_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forklift_checklist_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forklift_fail_notifications ENABLE ROW LEVEL SECURITY;

-- Public access policies (since using passcode auth)
CREATE POLICY "Allow public read forklift_units" ON public.forklift_units FOR SELECT USING (true);
CREATE POLICY "Allow public insert forklift_units" ON public.forklift_units FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update forklift_units" ON public.forklift_units FOR UPDATE USING (true);
CREATE POLICY "Allow public delete forklift_units" ON public.forklift_units FOR DELETE USING (true);

CREATE POLICY "Allow public read questions" ON public.forklift_checklist_questions FOR SELECT USING (true);
CREATE POLICY "Allow public insert questions" ON public.forklift_checklist_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update questions" ON public.forklift_checklist_questions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete questions" ON public.forklift_checklist_questions FOR DELETE USING (true);

CREATE POLICY "Allow public read submissions" ON public.forklift_checklist_submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert submissions" ON public.forklift_checklist_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update submissions" ON public.forklift_checklist_submissions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete submissions" ON public.forklift_checklist_submissions FOR DELETE USING (true);

CREATE POLICY "Allow public read responses" ON public.forklift_checklist_responses FOR SELECT USING (true);
CREATE POLICY "Allow public insert responses" ON public.forklift_checklist_responses FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read notifications" ON public.forklift_fail_notifications FOR SELECT USING (true);
CREATE POLICY "Allow public update notifications" ON public.forklift_fail_notifications FOR UPDATE USING (true);
CREATE POLICY "Allow public insert notifications" ON public.forklift_fail_notifications FOR INSERT WITH CHECK (true);

-- Insert default checklist questions
INSERT INTO public.forklift_checklist_questions (question_text, category, sort_order) VALUES
('Horn working', 'Safety', 1),
('Lights working', 'Safety', 2),
('Backup alarm working', 'Safety', 3),
('Seat belt functional', 'Safety', 4),
('Fire extinguisher present', 'Safety', 5),
('Brakes working properly', 'Controls', 6),
('Steering responsive', 'Controls', 7),
('Hydraulic controls working', 'Controls', 8),
('No fluid leaks', 'Fluids', 9),
('Oil level adequate', 'Fluids', 10),
('Coolant level adequate', 'Fluids', 11),
('Tires in good condition', 'Tires/Forks', 12),
('Forks not bent/cracked', 'Tires/Forks', 13),
('Mast chains lubricated', 'Tires/Forks', 14),
('Load backrest secure', 'Structure', 15),
('Overhead guard secure', 'Structure', 16);

-- Insert a default forklift
INSERT INTO public.forklift_units (name, unit_number, is_default) VALUES
('Forklift 1', 'FL-001', true);