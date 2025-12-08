import { ChecklistItem } from "./ChecklistItem";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

type Status = "pass" | "fail" | "na" | null;

interface ChecklistSectionProps {
  title: string;
  icon: React.ReactNode;
  items: string[];
  statuses: Record<string, Status>;
  onStatusChange: (item: string, status: Status) => void;
}

export function ChecklistSection({
  title,
  icon,
  items,
  statuses,
  onStatusChange,
}: ChecklistSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const completedCount = items.filter(item => statuses[item] !== null && statuses[item] !== undefined).length;
  const hasFailures = items.some(item => statuses[item] === "fail");

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm mb-2 touch-target"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasFailures ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{items.length} completed
              {hasFailures && <span className="text-destructive ml-2">• Has issues</span>}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      
      {isOpen && (
        <div className="space-y-3 pl-2">
          {items.map((item) => (
            <ChecklistItem
              key={item}
              label={item}
              status={statuses[item] || null}
              onStatusChange={(status) => onStatusChange(item, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
