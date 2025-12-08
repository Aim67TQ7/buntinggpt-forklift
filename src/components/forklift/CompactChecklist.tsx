import { useState, useEffect } from "react";
import { Settings, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompactChecklistItem } from "./CompactChecklistItem";
import { useForklifts, useActiveQuestions, useValidateBadge, useSubmitChecklist } from "@/hooks/useForkliftData";

type Status = "pass" | "fail" | "na" | null;

interface ResponseItem {
  questionId: string;
  status: Status;
  timestamp: Date | null;
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
    if (badgeNumber.length >= 3) {
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
        questionId,
        status,
        timestamp: status ? new Date() : null,
      },
    }));
  };

  const allAnswered = questions?.every((q) => responses[q.id]?.status) ?? false;
  const canSubmit = badgeValid && selectedForklift && allAnswered;

  const handleSubmit = async () => {
    if (!canSubmit || !questions) return;

    const responseData = questions.map((q) => ({
      questionId: q.id,
      status: responses[q.id].status!,
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground p-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Forklift Checklist</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => navigate("/admin")}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Badge & Forklift Selection */}
      <div className="p-3 space-y-3 bg-card border-b border-border">
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Badge Number"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              className="pr-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {validateBadge.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              {badgeValid === true && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              {badgeValid === false && <AlertCircle className="w-4 h-4 text-red-600" />}
            </div>
          </div>
          <Select value={selectedForklift} onValueChange={setSelectedForklift}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Forklift" />
            </SelectTrigger>
            <SelectContent>
              {forklifts?.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {employeeName && (
          <p className="text-sm text-muted-foreground">Operator: {employeeName}</p>
        )}
        {badgeValid === false && (
          <p className="text-sm text-destructive">Invalid badge number</p>
        )}
      </div>

      {/* Checklist Items */}
      <div className="bg-card">
        {questions?.map((q) => (
          <CompactChecklistItem
            key={q.id}
            label={q.question_text}
            status={responses[q.id]?.status || null}
            timestamp={responses[q.id]?.timestamp || null}
            onStatusChange={(status) => handleStatusChange(q.id, status)}
          />
        ))}
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t border-border">
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
