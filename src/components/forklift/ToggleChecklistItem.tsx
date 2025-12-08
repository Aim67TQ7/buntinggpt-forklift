import { useState, useEffect } from "react";

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
      return "bg-success text-success-foreground border-success";
    }
    if (status === "no") {
      return "bg-destructive text-destructive-foreground border-destructive";
    }
    return "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80";
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 border-2 text-left ${getButtonStyles()}`}
      >
        {label}
      </button>
      {showComment && (
        <textarea
          placeholder="Required: Describe the issue..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="w-full bg-input border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={2}
        />
      )}
    </div>
  );
}
