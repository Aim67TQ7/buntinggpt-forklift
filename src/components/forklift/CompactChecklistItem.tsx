import { Check, X, Minus } from "lucide-react";
import { format } from "date-fns";

type Status = "pass" | "fail" | "na" | null;

interface CompactChecklistItemProps {
  label: string;
  status: Status;
  timestamp: Date | null;
  onStatusChange: (status: Status) => void;
}

export function CompactChecklistItem({ label, status, timestamp, onStatusChange }: CompactChecklistItemProps) {
  const handleClick = (newStatus: Status) => {
    onStatusChange(status === newStatus ? null : newStatus);
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 border-b border-border/50 last:border-b-0">
      <div className="flex-1 min-w-0 mr-2">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        {timestamp && (
          <p className="text-xs text-muted-foreground">{format(timestamp, "HH:mm:ss")}</p>
        )}
      </div>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => handleClick("pass")}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            status === "pass"
              ? "bg-green-600 text-white shadow-md"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
          aria-pressed={status === "pass"}
        >
          <Check className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleClick("fail")}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            status === "fail"
              ? "bg-red-600 text-white shadow-md"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
          aria-pressed={status === "fail"}
        >
          <X className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => handleClick("na")}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
            status === "na"
              ? "bg-gray-500 text-white shadow-md"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
          aria-pressed={status === "na"}
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
