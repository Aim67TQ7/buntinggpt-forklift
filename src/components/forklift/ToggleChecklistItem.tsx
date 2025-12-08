import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

type Status = "yes" | "no" | null;

interface ToggleChecklistItemProps {
  label: string;
  status: Status;
  comment: string;
  onStatusChange: (status: Status) => void;
  onCommentChange: (comment: string) => void;
}

export function ToggleChecklistItem({
  label,
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
      return <Check className="w-6 h-6 shrink-0" />;
    }
    if (status === "no") {
      return <X className="w-6 h-6 shrink-0" />;
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        className={`w-full py-4 px-4 rounded-xl font-semibold text-base transition-all duration-200 border-2 flex items-center justify-between gap-3 ${getButtonStyles()}`}
      >
        <span className="text-left">{label}</span>
        {getIcon()}
      </button>
      {showComment && (
        <textarea
          placeholder="Required: Describe the issue..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="w-full bg-input border border-border rounded-xl p-4 text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={2}
        />
      )}
    </div>
  );
}
