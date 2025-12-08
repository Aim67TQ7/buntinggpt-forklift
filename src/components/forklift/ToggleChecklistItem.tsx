import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

type Status = "yes" | "no" | null;

interface ToggleChecklistItemProps {
  label: string;
  questionLabel?: string;
  status: Status;
  comment: string;
  onStatusChange: (status: Status) => void;
  onCommentChange: (comment: string) => void;
}

export function ToggleChecklistItem({
  label,
  questionLabel,
  status,
  comment,
  onStatusChange,
  onCommentChange,
}: ToggleChecklistItemProps) {
  const [showComment, setShowComment] = useState(status === "no");

  useEffect(() => {
    setShowComment(status === "no");
  }, [status]);

  const handleClick = () => {
    if (status === null) {
      onStatusChange("yes");
    } else if (status === "yes") {
      onStatusChange("no");
    } else {
      onStatusChange(null);
      onCommentChange("");
    }
  };

  const getButtonStyles = () => {
    if (status === "yes") {
      return "bg-success text-success-foreground border-success shadow-lg shadow-success/40";
    }
    if (status === "no") {
      return "bg-destructive text-destructive-foreground border-destructive shadow-lg shadow-destructive/40";
    }
    return "bg-card text-foreground border-border hover:border-muted-foreground";
  };

  const getIcon = () => {
    if (status === "yes") {
      return <Check className="w-10 h-10 shrink-0" />;
    }
    if (status === "no") {
      return <X className="w-10 h-10 shrink-0" />;
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        className={`w-full py-5 px-5 rounded-xl font-semibold text-lg transition-all duration-200 border-2 flex items-center justify-between gap-4 ${getButtonStyles()}`}
      >
        <div className="flex items-center gap-3 text-left">
          {questionLabel && (
            <span className="font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg shrink-0">
              {questionLabel}
            </span>
          )}
          <span>{label}</span>
        </div>
        {getIcon()}
      </button>
      {showComment && (
        <textarea
          placeholder="Required: Describe the issue..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="w-full bg-input border border-border rounded-xl p-4 text-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={2}
        />
      )}
    </div>
  );
}
