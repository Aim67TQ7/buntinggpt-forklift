import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ForkliftUnit {
  id: string;
  name: string;
  unit_number: string;
  is_default: boolean;
  is_active: boolean;
}

export interface ChecklistQuestion {
  id: string;
  question_text: string;
  category: string;
  sort_order: number;
  is_active: boolean;
  label?: string;
}

export interface ChecklistSubmission {
  id: string;
  badge_number: string;
  forklift_id: string;
  submitted_at: string;
  has_failures: boolean;
  forklift_units?: ForkliftUnit;
}

export interface ChecklistResponse {
  id: string;
  submission_id: string;
  question_id: string;
  status: "pass" | "fail" | "na";
  timestamp: string;
  admin_notes?: string | null;
  forklift_checklist_questions?: ChecklistQuestion;
}

export interface FailNotification {
  id: string;
  submission_id: string;
  question_id: string;
  badge_number: string;
  forklift_name: string;
  question_text: string;
  is_read: boolean;
  created_at: string;
}

export interface QualifiedDriver {
  id: string;
  badge_number: string;
  driver_name: string;
  is_active: boolean;
  created_at: string;
  certified_date: string | null;
  recertify_date: string | null;
  trainer: string | null;
}

export function useForklifts() {
  return useQuery({
    queryKey: ["forklifts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forklift_units")
        .select("*")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as ForkliftUnit[];
    },
  });
}

export function useChecklistQuestions() {
  return useQuery({
    queryKey: ["checklist-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forklift_checklist_questions")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as ChecklistQuestion[];
    },
  });
}

export function useActiveQuestions() {
  return useQuery({
    queryKey: ["active-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forklift_checklist_questions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as ChecklistQuestion[];
    },
  });
}

// Get questions assigned to a specific forklift
export function useForkliftQuestions(forkliftId: string | null) {
  return useQuery({
    queryKey: ["forklift-questions", forkliftId],
    queryFn: async () => {
      if (!forkliftId) return [];
      const { data, error } = await supabase
        .from("forklift_question_assignments")
        .select("question_id, forklift_checklist_questions(*)")
        .eq("forklift_id", forkliftId);
      if (error) throw error;
      return data.map(d => d.forklift_checklist_questions as ChecklistQuestion).filter(Boolean);
    },
    enabled: !!forkliftId,
  });
}

// Get all question assignments for a forklift
export function useQuestionAssignments(forkliftId: string | null) {
  return useQuery({
    queryKey: ["question-assignments", forkliftId],
    queryFn: async () => {
      if (!forkliftId) return [];
      const { data, error } = await supabase
        .from("forklift_question_assignments")
        .select("question_id")
        .eq("forklift_id", forkliftId);
      if (error) throw error;
      return data.map(d => d.question_id);
    },
    enabled: !!forkliftId,
  });
}

// Assign/unassign a question to a forklift
export function useToggleQuestionAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ forkliftId, questionId, assigned }: { forkliftId: string; questionId: string; assigned: boolean }) => {
      if (assigned) {
        const { error } = await supabase
          .from("forklift_question_assignments")
          .insert({ forklift_id: forkliftId, question_id: questionId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("forklift_question_assignments")
          .delete()
          .eq("forklift_id", forkliftId)
          .eq("question_id", questionId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { forkliftId }) => {
      queryClient.invalidateQueries({ queryKey: ["question-assignments", forkliftId] });
      queryClient.invalidateQueries({ queryKey: ["forklift-questions", forkliftId] });
    },
  });
}

export function useSubmissions() {
  return useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forklift_checklist_submissions")
        .select("*, forklift_units(*)")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as ChecklistSubmission[];
    },
  });
}

export function useSubmissionResponses(submissionId: string | null) {
  return useQuery({
    queryKey: ["submission-responses", submissionId],
    queryFn: async () => {
      if (!submissionId) return [];
      const { data, error } = await supabase
        .from("forklift_checklist_responses")
        .select("*, forklift_checklist_questions(*)")
        .eq("submission_id", submissionId);
      if (error) throw error;
      return data as ChecklistResponse[];
    },
    enabled: !!submissionId,
  });
}

export function useFailNotifications() {
  return useQuery({
    queryKey: ["fail-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forklift_fail_notifications")
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FailNotification[];
    },
  });
}

export function useQualifiedDrivers() {
  return useQuery({
    queryKey: ["qualified-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forklift_qualified_drivers")
        .select("*")
        .eq("is_active", true)
        .order("driver_name");
      if (error) throw error;
      return data as QualifiedDriver[];
    },
  });
}

export function useValidateBadge() {
  return useMutation({
    mutationFn: async (badgeNumber: string) => {
      const { data, error } = await supabase
        .from("forklift_qualified_drivers")
        .select("id, badge_number, driver_name")
        .eq("badge_number", badgeNumber)
        .eq("is_active", true)
        .limit(1);
      if (error) throw error;
      return data.length > 0 ? { badge_number: data[0].badge_number, displayName: data[0].driver_name } : null;
    },
  });
}

export function useSubmitChecklist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      badgeNumber,
      forkliftId,
      responses,
    }: {
      badgeNumber: string;
      forkliftId: string;
      responses: { questionId: string; status: "pass" | "fail" | "na"; questionText: string }[];
    }) => {
      const hasFailures = responses.some((r) => r.status === "fail");
      
      // Get forklift name for notifications
      const { data: forklift } = await supabase
        .from("forklift_units")
        .select("name")
        .eq("id", forkliftId)
        .single();
      
      // Create submission
      const { data: submission, error: subError } = await supabase
        .from("forklift_checklist_submissions")
        .insert({ badge_number: badgeNumber, forklift_id: forkliftId, has_failures: hasFailures })
        .select()
        .single();
      if (subError) throw subError;

      // Create responses
      const responseInserts = responses.map((r) => ({
        submission_id: submission.id,
        question_id: r.questionId,
        status: r.status,
      }));
      
      const { error: respError } = await supabase
        .from("forklift_checklist_responses")
        .insert(responseInserts);
      if (respError) throw respError;

      // Create fail notifications
      const failedItems = responses.filter((r) => r.status === "fail");
      if (failedItems.length > 0) {
        const notifications = failedItems.map((r) => ({
          submission_id: submission.id,
          question_id: r.questionId,
          badge_number: badgeNumber,
          forklift_name: forklift?.name || "Unknown",
          question_text: r.questionText,
        }));
        
        await supabase.from("forklift_fail_notifications").insert(notifications);
      }

      return submission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
      queryClient.invalidateQueries({ queryKey: ["fail-notifications"] });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("forklift_fail_notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fail-notifications"] });
    },
  });
}

export function useAddForklift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, unitNumber }: { name: string; unitNumber: string }) => {
      const { error } = await supabase
        .from("forklift_units")
        .insert({ name, unit_number: unitNumber });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forklifts"] });
    },
  });
}

export function useSetDefaultForklift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Remove default from all
      await supabase.from("forklift_units").update({ is_default: false }).neq("id", "");
      // Set new default
      const { error } = await supabase
        .from("forklift_units")
        .update({ is_default: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forklifts"] });
    },
  });
}

export function useToggleQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("forklift_checklist_questions")
        .update({ is_active: isActive })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-questions"] });
      queryClient.invalidateQueries({ queryKey: ["active-questions"] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, questionText, label }: { id: string; questionText: string; label?: string }) => {
      const { error } = await supabase
        .from("forklift_checklist_questions")
        .update({ question_text: questionText, label })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-questions"] });
      queryClient.invalidateQueries({ queryKey: ["active-questions"] });
    },
  });
}

export function useAddQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ questionText, label, category }: { questionText: string; label?: string; category?: string }) => {
      // Get highest sort_order
      const { data: existing } = await supabase
        .from("forklift_checklist_questions")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);
      
      const nextOrder = (existing?.[0]?.sort_order || 0) + 1;
      
      const { error } = await supabase
        .from("forklift_checklist_questions")
        .insert({ 
          question_text: questionText, 
          label: label || `Q${nextOrder}`,
          category: category || "General",
          sort_order: nextOrder,
          is_active: true
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist-questions"] });
      queryClient.invalidateQueries({ queryKey: ["active-questions"] });
    },
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("forklift_checklist_submissions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions"] });
    },
  });
}

export function useDeleteForklift() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("forklift_units")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forklifts"] });
    },
  });
}

export function useAddDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      badgeNumber, 
      driverName, 
      certifiedDate, 
      recertifyDate, 
      trainer 
    }: { 
      badgeNumber: string; 
      driverName: string;
      certifiedDate?: string;
      recertifyDate?: string;
      trainer?: string;
    }) => {
      const { error } = await supabase
        .from("forklift_qualified_drivers")
        .insert({ 
          badge_number: badgeNumber, 
          driver_name: driverName,
          certified_date: certifiedDate || null,
          recertify_date: recertifyDate || null,
          trainer: trainer || null
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualified-drivers"] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id,
      badgeNumber, 
      driverName, 
      certifiedDate, 
      recertifyDate, 
      trainer 
    }: { 
      id: string;
      badgeNumber: string; 
      driverName: string;
      certifiedDate?: string;
      recertifyDate?: string;
      trainer?: string;
    }) => {
      const { error } = await supabase
        .from("forklift_qualified_drivers")
        .update({ 
          badge_number: badgeNumber, 
          driver_name: driverName,
          certified_date: certifiedDate || null,
          recertify_date: recertifyDate || null,
          trainer: trainer || null
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualified-drivers"] });
    },
  });
}

export function useDeleteDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("forklift_qualified_drivers")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qualified-drivers"] });
    },
  });
}

export function useUpdateAdminNotes() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ responseId, adminNotes }: { responseId: string; adminNotes: string }) => {
      const { error } = await supabase
        .from("forklift_checklist_responses")
        .update({ admin_notes: adminNotes })
        .eq("id", responseId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission-responses"] });
    },
  });
}
