-- Create equipment maintenance table
CREATE TABLE public.equipment_maintenance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_id UUID NOT NULL REFERENCES public.forklift_units(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES public.forklift_checklist_submissions(id) ON DELETE SET NULL,
  response_id UUID REFERENCES public.forklift_checklist_responses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'deferred')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  issue_description TEXT NOT NULL,
  work_performed TEXT,
  parts_used TEXT,
  technician_name TEXT,
  reported_by TEXT,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  downtime_hours DECIMAL(6,2),
  is_from_checklist BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching existing forklift tables pattern)
CREATE POLICY "Allow public read access" ON public.equipment_maintenance FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.equipment_maintenance FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.equipment_maintenance FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.equipment_maintenance FOR DELETE USING (true);

-- Create indexes for common queries
CREATE INDEX idx_equipment_maintenance_equipment_id ON public.equipment_maintenance(equipment_id);
CREATE INDEX idx_equipment_maintenance_status ON public.equipment_maintenance(status);
CREATE INDEX idx_equipment_maintenance_submission_id ON public.equipment_maintenance(submission_id);
CREATE INDEX idx_equipment_maintenance_reported_at ON public.equipment_maintenance(reported_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_equipment_maintenance_updated_at
  BEFORE UPDATE ON public.equipment_maintenance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();