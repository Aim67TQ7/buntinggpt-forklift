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
      return "bg-success text-success-foreground";
    }
    if (status === "no") {
      return "bg-destructive text-destructive-foreground";
    }
    return "bg-muted text-foreground hover:bg-muted/80";
  };

  const getIcon = () => {
    if (status === "yes") {
      return <Check className="w-3 h-3 shrink-0" />;
    }
    if (status === "no") {
      return <X className="w-3 h-3 shrink-0" />;
    }
    return null;
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleClick}
        className={`w-full py-2 px-1.5 rounded text-[10px] font-medium transition-colors flex items-center justify-between gap-0.5 min-h-[40px] ${getButtonStyles()}`}
      >
        <span className="text-[10px] leading-tight text-left flex-1">{label}</span>
        {getIcon()}
      </button>
      {showComment && (
        <textarea
          placeholder="Describe issue..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="w-full bg-muted border-0 rounded p-1.5 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          rows={2}
        />
      )}
    </div>
  );
}
