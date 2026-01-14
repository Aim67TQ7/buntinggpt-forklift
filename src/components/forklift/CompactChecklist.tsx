import { useState, useEffect } from "react";
import { Settings, Send, AlertCircle, CheckCircle2, Loader2, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleChecklistItem } from "./ToggleChecklistItem";
import { ChecklistHelpDialog } from "./ChecklistHelpDialog";
import { useForklifts, useForkliftQuestions, useValidateBadge, useSubmitChecklist } from "@/hooks/useForkliftData";
import logo from "@/assets/logo.png";

type Status = "yes" | "no" | null;

interface ResponseItem {
  status: Status;
  comment: string;
}

export function CompactChecklist() {
  const navigate = useNavigate();
  const { data: forklifts, isLoading: forkliftsLoading } = useForklifts();
  const [selectedForklift, setSelectedForklift] = useState<string>("");
  const { data: questions, isLoading: questionsLoading } = useForkliftQuestions(selectedForklift);
  const validateBadge = useValidateBadge();
  const submitChecklist = useSubmitChecklist();

  const [badgeNumber, setBadgeNumber] = useState("");
  const [badgeValid, setBadgeValid] = useState<boolean | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, ResponseItem>>({});

  // User must select equipment from buttons - no auto-select

  // Reset responses when forklift changes
  useEffect(() => {
    setResponses({});
  }, [selectedForklift]);

  // Validate badge on change
  useEffect(() => {
    if (badgeNumber.length >= 2) {
      const timer = setTimeout(() => {
        validateBadge.mutate(badgeNumber, {
          onSuccess: (result) => {
            setBadgeValid(!!result);
            setEmployeeName(result?.displayName || null);
          },
        });
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setBadgeValid(null);
      setEmployeeName(null);
    }
  }, [badgeNumber]);

  const handleStatusChange = (questionId: string, status: Status) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        status,
        comment: status !== "no" ? "" : prev[questionId]?.comment || "",
      },
    }));
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        comment,
      },
    }));
  };

  // Check all questions answered and all "no" items have comments
  const allAnswered = questions?.every((q) => responses[q.id]?.status !== undefined && responses[q.id]?.status !== null) ?? false;
  const allCommentsProvided = questions?.every((q) => {
    const r = responses[q.id];
    if (r?.status === "no") {
      return r.comment?.trim().length > 0;
    }
    return true;
  }) ?? true;
  
  const canSubmit = badgeValid && selectedForklift && allAnswered && allCommentsProvided;

  const handleSubmit = async () => {
    if (!canSubmit || !questions) return;

    const responseData = questions.map((q) => ({
      questionId: q.id,
      status: responses[q.id].status === "yes" ? "pass" as const : responses[q.id].status === "no" ? "fail" as const : "na" as const,
      questionText: q.question_text,
    }));

    try {
      await submitChecklist.mutateAsync({
        badgeNumber,
        forkliftId: selectedForklift,
        responses: responseData,
      });

      const hasFailures = responseData.some((r) => r.status === "fail");
      if (hasFailures) {
        toast.warning("Checklist submitted with failures - admin notified");
      } else {
        toast.success("Checklist submitted successfully");
      }

      // Reset form
      setBadgeNumber("");
      setBadgeValid(null);
      setEmployeeName(null);
      setResponses({});
    } catch (error) {
      toast.error("Failed to submit checklist");
    }
  };

  if (forkliftsLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show forklift selection screen if no forklift selected
  if (!selectedForklift) {
    return (
      <div className="min-h-screen bg-background">
        {/* Compact Header */}
        <div className="bg-card border-b border-border px-2 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <img src={logo} alt="Logo" className="w-5 h-5 object-contain" />
            <span className="font-bold text-xs text-primary uppercase tracking-wide">Pre-Op Check</span>
          </div>
          <div className="flex items-center">
            <ChecklistHelpDialog />
            <button
              onClick={() => navigate("/admin")}
              className="hidden md:block text-muted-foreground hover:text-foreground p-1.5"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-3 py-4 space-y-4">
          <h2 className="text-sm font-semibold text-foreground text-center">Select Equipment</h2>
          
          <div className="grid grid-cols-2 gap-2">
            {forklifts?.map((f) => (
              <Button
                key={f.id}
                variant="outline"
                className="h-16 text-sm font-medium bg-muted border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedForklift(f.id)}
              >
                {f.name}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedForkliftName = forklifts?.find(f => f.id === selectedForklift)?.name || "Equipment";

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Compact Header */}
      <div className="bg-card border-b border-border px-2 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setSelectedForklift("")}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-xs text-primary uppercase tracking-wide">{selectedForkliftName}</span>
        </div>
        <div className="flex items-center">
          <ChecklistHelpDialog />
          <button
            onClick={() => navigate("/admin")}
            className="hidden md:block text-muted-foreground hover:text-foreground p-1.5"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-2 py-2 space-y-2">
        {/* Employee ID */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">
            Badge <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter Badge ID"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="bg-muted border-0 text-foreground placeholder:text-muted-foreground h-8 text-xs pr-7"
              maxLength={10}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {validateBadge.isPending && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
              {badgeValid === true && <CheckCircle2 className="w-3 h-3 text-success" />}
              {badgeValid === false && <AlertCircle className="w-3 h-3 text-destructive" />}
            </div>
          </div>
        </div>

        {/* Status messages */}
        {employeeName && (
          <p className="text-xs text-success -mt-1">{employeeName}</p>
        )}
        {badgeValid === false && badgeNumber.length >= 2 && (
          <p className="text-xs text-destructive -mt-1">Not authorized</p>
        )}

        {/* Checklist Items - 2 column grid */}
        {questions && questions.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5">
            {questions.map((q) => (
              <ToggleChecklistItem
                key={q.id}
                label={q.question_text}
                status={responses[q.id]?.status || null}
                comment={responses[q.id]?.comment || ""}
                onStatusChange={(status) => handleStatusChange(q.id, status)}
                onCommentChange={(comment) => handleCommentChange(q.id, comment)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No questions assigned. Contact admin.
          </div>
        )}

        {!allCommentsProvided && (
          <p className="text-xs text-destructive">Add comments for failed items</p>
        )}
      </div>

      {/* Fixed Bottom - Single Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 px-2 pb-3 pt-1.5 bg-background safe-bottom">
        <Button
          className="w-full h-10 text-xs font-semibold bg-success hover:bg-success/90 text-success-foreground"
          disabled={!canSubmit || submitChecklist.isPending}
          onClick={handleSubmit}
        >
          {submitChecklist.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
          ) : (
            <Send className="w-3 h-3 mr-1.5" />
          )}
          SUBMIT
        </Button>
      </div>
    </div>
  );
}
