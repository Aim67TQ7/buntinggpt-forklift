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
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-lg font-bold text-primary-foreground">FORKLIFT CHECK</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 h-10 w-10"
            onClick={() => navigate("/admin")}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Employee ID */}
        <div className="space-y-2">
          <Label className="text-foreground text-lg">
            Employee ID <span className="text-primary">*</span>
          </Label>
          <div className="relative">
            <Input
              type="text"
              placeholder="Enter badge number"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 h-14 text-xl"
              maxLength={10}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {validateBadge.isPending && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
              {badgeValid === true && <CheckCircle2 className="w-6 h-6 text-success" />}
              {badgeValid === false && <AlertCircle className="w-6 h-6 text-destructive" />}
            </div>
          </div>
          {employeeName && (
            <p className="text-lg text-success font-medium">{employeeName}</p>
          )}
          {badgeValid === false && badgeNumber.length >= 2 && (
            <p className="text-lg text-destructive">Badge not authorized for forklift operation</p>
          )}
        </div>

        {/* Forklift Selection */}
        <div className="space-y-2">
          <Label className="text-foreground text-lg">Forklift</Label>
          <Select value={selectedForklift} onValueChange={setSelectedForklift}>
            <SelectTrigger className="bg-input border-border text-foreground h-14 text-xl">
              <SelectValue placeholder="Select forklift" />
            </SelectTrigger>
            <SelectContent>
              {forklifts?.map((f) => (
                <SelectItem key={f.id} value={f.id} className="text-lg py-3">
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
          <p className="text-lg text-destructive font-medium">Please provide comments for all failed items</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
        <Button
          className="w-full h-16 text-xl font-semibold"
          disabled={!canSubmit || submitChecklist.isPending}
          onClick={handleSubmit}
        >
          {submitChecklist.isPending ? (
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
          ) : (
            <Send className="w-6 h-6 mr-2" />
          )}
          Submit Checklist
        </Button>
      </div>
    </div>
  );
}
