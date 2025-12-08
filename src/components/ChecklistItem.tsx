import { Check, X, Minus } from "lucide-react";

type Status = "pass" | "fail" | "na" | null;

interface ChecklistItemProps {
  label: string;
  status: Status;
  onStatusChange: (status: Status) => void;
}

export function ChecklistItem({ label, status, onStatusChange }: ChecklistItemProps) {
  const handleClick = (newStatus: Status) => {
    onStatusChange(status === newStatus ? null : newStatus);
  };

  return (
    <div className="checklist-card animate-slide-up">
      <p className="font-medium text-foreground mb-3">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleClick("pass")}
          className={`status-button ${status === "pass" ? "status-pass" : "status-unselected"}`}
          aria-pressed={status === "pass"}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" />
            Pass
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleClick("fail")}
          className={`status-button ${status === "fail" ? "status-fail" : "status-unselected"}`}
          aria-pressed={status === "fail"}
        >
          <span className="flex items-center justify-center gap-1.5">
            <X className="w-4 h-4" />
            Fail
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleClick("na")}
          className={`status-button ${status === "na" ? "status-na" : "status-unselected"}`}
          aria-pressed={status === "na"}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Minus className="w-4 h-4" />
            N/A
          </span>
        </button>
      </div>
    </div>
  );
}
