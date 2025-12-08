import { useState } from "react";
import { ChecklistSection } from "./ChecklistSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Truck,
  Gauge,
  Shield,
  Wrench,
  Calendar,
  User,
  Hash,
  Send,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type Status = "pass" | "fail" | "na" | null;

const checklistData = {
  "Visual Inspection": {
    icon: <Truck className="w-5 h-5" />,
    items: [
      "Forks - no cracks, bends, or wear",
      "Tires - proper inflation, no damage",
      "Mast - no visible damage or leaks",
      "Overhead guard - secure and intact",
      "Data plate - visible and legible",
      "Lights - all working properly",
    ],
  },
  "Fluid Levels": {
    icon: <Gauge className="w-5 h-5" />,
    items: [
      "Engine oil level",
      "Hydraulic fluid level",
      "Coolant level",
      "Brake fluid level",
      "Fuel/battery charge level",
    ],
  },
  "Safety Features": {
    icon: <Shield className="w-5 h-5" />,
    items: [
      "Horn - working properly",
      "Backup alarm - functioning",
      "Seat belt - operational",
      "Emergency brake - holds",
      "Warning decals - visible",
      "Fire extinguisher - present and charged",
    ],
  },
  "Operational Check": {
    icon: <Wrench className="w-5 h-5" />,
    items: [
      "Steering - smooth operation",
      "Brakes - responsive",
      "Lift/lower functions",
      "Tilt functions",
      "Side shift (if equipped)",
      "No unusual noises or vibrations",
    ],
  },
};

export function ForkliftChecklist() {
  const [operatorName, setOperatorName] = useState("");
  const [forkliftId, setForkliftId] = useState("");
  const [comments, setComments] = useState("");
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleStatusChange = (item: string, status: Status) => {
    setStatuses((prev) => ({ ...prev, [item]: status }));
  };

  const totalItems = Object.values(checklistData).reduce(
    (acc, section) => acc + section.items.length,
    0
  );
  
  const completedItems = Object.values(statuses).filter(
    (s) => s !== null && s !== undefined
  ).length;
  
  const failedItems = Object.values(statuses).filter((s) => s === "fail").length;
  
  const progress = Math.round((completedItems / totalItems) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operatorName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    
    if (!forkliftId.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the forklift ID",
        variant: "destructive",
      });
      return;
    }
    
    if (completedItems < totalItems) {
      toast({
        title: "Incomplete Checklist",
        description: `Please complete all ${totalItems} items before submitting`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: failedItems > 0 ? "Checklist Submitted with Issues" : "Checklist Submitted Successfully",
      description: failedItems > 0 
        ? `${failedItems} item(s) failed. Please report to supervisor.`
        : "All checks passed. Forklift is ready for operation.",
    });
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-background safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary-foreground/20 rounded-lg">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Forklift Pre-Op Checklist</h1>
            <p className="text-primary-foreground/80 text-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {today}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-primary-foreground/80">Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-foreground transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <main className="p-4 pb-32 max-w-2xl mx-auto">
        {/* Operator Info */}
        <div className="checklist-card mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Operator Information
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="operatorName" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Operator Name
              </label>
              <Input
                id="operatorName"
                placeholder="Enter your name"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                className="touch-target"
              />
            </div>
            <div>
              <label htmlFor="forkliftId" className="text-sm font-medium text-muted-foreground mb-1.5 block">
                Forklift ID / Unit Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="forkliftId"
                  placeholder="e.g., FL-001"
                  value={forkliftId}
                  onChange={(e) => setForkliftId(e.target.value)}
                  className="pl-10 touch-target"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Checklist Sections */}
        {Object.entries(checklistData).map(([title, { icon, items }]) => (
          <ChecklistSection
            key={title}
            title={title}
            icon={icon}
            items={items}
            statuses={statuses}
            onStatusChange={handleStatusChange}
          />
        ))}

        {/* Comments */}
        <div className="checklist-card mt-6">
          <label htmlFor="comments" className="font-semibold text-foreground mb-3 block">
            Additional Comments / Issues
          </label>
          <Textarea
            id="comments"
            placeholder="Note any issues, concerns, or maintenance needs..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>
      </main>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border safe-bottom">
        <div className="max-w-2xl mx-auto">
          {failedItems > 0 && (
            <div className="flex items-center gap-2 text-destructive text-sm mb-3 justify-center">
              <AlertTriangle className="w-4 h-4" />
              {failedItems} item(s) require attention
            </div>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {completedItems === totalItems ? (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Checklist
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {completedItems}/{totalItems} Complete
                  </>
                )}
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
