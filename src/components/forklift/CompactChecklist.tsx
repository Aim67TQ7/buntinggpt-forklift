import { useState, useEffect } from "react";
import { Settings, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleChecklistItem } from "./ToggleChecklistItem";
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-lg font-bold text-primary">FORKLIFT CHECKLIST</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/admin")}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Employee ID */}
        <div className="space-y-2">
          <Label className="text-foreground">
            Employee ID <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="2-4 digits"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-10"
              maxLength={4}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validateBadge.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              {badgeValid === true && <CheckCircle2 className="w-4 h-4 text-success" />}
              {badgeValid === false && <AlertCircle className="w-4 h-4 text-destructive" />}
            </div>
          </div>
          {employeeName && (
            <p className="text-sm text-muted-foreground">{employeeName}</p>
          )}
          {badgeValid === false && badgeNumber.length >= 2 && (
            <p className="text-sm text-destructive">Invalid badge number</p>
          )}
        </div>

        {/* Forklift Selection */}
        <div className="space-y-2">
          <Label className="text-foreground">Forklift</Label>
          <Select value={selectedForklift} onValueChange={setSelectedForklift}>
            <SelectTrigger className="bg-input border-border text-foreground">
              <SelectValue placeholder="Select forklift" />
            </SelectTrigger>
            <SelectContent>
              {forklifts?.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name} ({f.unit_number})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3 pt-2">
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
          <p className="text-sm text-destructive">Please provide comments for all failed items</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
        <Button
          className="w-full h-12 text-lg font-semibold"
          disabled={!canSubmit || submitChecklist.isPending}
          onClick={handleSubmit}
        >
          {submitChecklist.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          Submit Checklist
        </Button>
      </div>
    </div>
  );
}
