-- Allow public update on forklift_checklist_responses for admin notes
CREATE POLICY "Allow public update responses"
ON public.forklift_checklist_responses
FOR UPDATE
USING (true)
WITH CHECK (true);