import { useState, useEffect } from "react";
import { Settings, Send, AlertCircle, CheckCircle2, Loader2, History, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleChecklistItem } from "./ToggleChecklistItem";
import { ChecklistHelpDialog } from "./ChecklistHelpDialog";
import { useForklifts, useActiveQuestions, useValidateBadge, useSubmitChecklist } from "@/hooks/useForkliftData";
import logo from "@/assets/logo.png";

type Status = "yes" | "no" | null;

interface ResponseItem {
  status: Status;
  comment: string;
}

export function CompactChecklist() {
  const navigate = useNavigate();
  const { data: forklifts, isLoading: forkliftsLoading } = useForklifts();
  const { data: questions, isLoading: questionsLoading } = useActiveQuestions();
  const validateBadge = useValidateBadge();
  const submitChecklist = useSubmitChecklist();

  const [badgeNumber, setBadgeNumber] = useState("");
  const [badgeValid, setBadgeValid] = useState<boolean | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [selectedForklift, setSelectedForklift] = useState<string>("");
  const [responses, setResponses] = useState<Record<string, ResponseItem>>({});

  // Set default forklift on load
  useEffect(() => {
    if (forklifts && forklifts.length > 0 && !selectedForklift) {
      const defaultForklift = forklifts.find((f) => f.is_default) || forklifts[0];
      setSelectedForklift(defaultForklift.id);
    }
  }, [forklifts, selectedForklift]);

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

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Simple Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
          <span className="font-bold text-sm text-primary uppercase tracking-wide">Forklift Check</span>
        </div>
        <div className="flex items-center gap-1">
          <ChecklistHelpDialog />
          <button
            onClick={() => navigate("/admin")}
            className="text-muted-foreground hover:text-foreground p-2"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Employee ID */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Employee ID <span className="text-primary">*</span>
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder="2-4 digits"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="bg-muted border-0 text-foreground placeholder:text-muted-foreground h-10 text-sm pr-10"
              maxLength={10}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validateBadge.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              {badgeValid === true && <CheckCircle2 className="w-4 h-4 text-success" />}
              {badgeValid === false && <AlertCircle className="w-4 h-4 text-destructive" />}
            </div>
          </div>
          {employeeName && (
            <p className="text-xs text-success">{employeeName}</p>
          )}
          {badgeValid === false && badgeNumber.length >= 2 && (
            <p className="text-xs text-destructive">Badge not authorized</p>
          )}
        </div>

        {/* Forklift Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Forklift</label>
          <Select value={selectedForklift} onValueChange={setSelectedForklift}>
            <SelectTrigger className="bg-muted border-0 text-foreground h-10 text-sm">
              <SelectValue placeholder="Select forklift" />
            </SelectTrigger>
            <SelectContent>
              {forklifts?.map((f) => (
                <SelectItem key={f.id} value={f.id} className="text-sm">
                  {f.name} ({f.unit_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Checklist Items - 2 column grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {questions?.map((q) => (
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

        {!allCommentsProvided && (
          <p className="text-xs text-destructive">Please provide comments for all failed items</p>
        )}
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2 bg-background space-y-2 safe-bottom">
        <Button
          className="w-full h-11 text-sm font-semibold bg-success hover:bg-success/90 text-success-foreground"
          disabled={!canSubmit || submitChecklist.isPending}
          onClick={handleSubmit}
        >
          {submitChecklist.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          SUBMIT
        </Button>
        <Button
          variant="outline"
          className="w-full h-10 text-sm font-medium border-border"
          onClick={() => navigate("/admin")}
        >
          <History className="w-4 h-4 mr-2" />
          View History
        </Button>
      </div>
    </div>
  );
}
