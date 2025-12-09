import { useState } from "react";
import { Plus, Star, Trash2, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  useAddForklift, 
  useSetDefaultForklift, 
  useDeleteForklift, 
  useChecklistQuestions,
  useQuestionAssignments,
  useToggleQuestionAssignment,
  ForkliftUnit 
} from "@/hooks/useForkliftData";

interface SettingsTabProps {
  forklifts: ForkliftUnit[];
}

export function SettingsTab({ forklifts }: SettingsTabProps) {
  const [newName, setNewName] = useState("");
  const [newUnitNumber, setNewUnitNumber] = useState("");
  const [selectedForkliftForQuestions, setSelectedForkliftForQuestions] = useState<string | null>(null);
  
  const addForklift = useAddForklift();
  const setDefault = useSetDefaultForklift();
  const deleteForklift = useDeleteForklift();
  const { data: allQuestions } = useChecklistQuestions();
  const { data: assignedQuestionIds } = useQuestionAssignments(selectedForkliftForQuestions);
  const toggleAssignment = useToggleQuestionAssignment();

  const handleAdd = async () => {
    if (!newName.trim() || !newUnitNumber.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await addForklift.mutateAsync({ name: newName, unitNumber: newUnitNumber });
      toast.success("Forklift added");
      setNewName("");
      setNewUnitNumber("");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Unit number already exists");
      } else {
        toast.error("Failed to add forklift");
      }
    }
  };

  const handleToggleQuestion = (questionId: string, currentlyAssigned: boolean) => {
    if (!selectedForkliftForQuestions) return;
    toggleAssignment.mutate({
      forkliftId: selectedForkliftForQuestions,
      questionId,
      assigned: !currentlyAssigned,
    });
  };

  const selectedForklift = forklifts.find(f => f.id === selectedForkliftForQuestions);

  return (
    <div className="space-y-4">
      {/* Add Forklift Form */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold">Add Forklift</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              placeholder="Forklift 2"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Unit #</Label>
            <Input
              placeholder="FL-002"
              value={newUnitNumber}
              onChange={(e) => setNewUnitNumber(e.target.value)}
            />
          </div>
        </div>
        <Button className="w-full" onClick={handleAdd} disabled={addForklift.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          Add Forklift
        </Button>
      </Card>

      {/* Forklift List */}
      <div className="space-y-2">
        <h3 className="font-semibold">Manage Forklifts</h3>
        {forklifts.map((f) => (
          <Card key={f.id} className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{f.name}</span>
                  {f.is_default && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{f.unit_number}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedForkliftForQuestions(f.id)}
                  title="Assign Questions"
                >
                  <ClipboardList className="w-4 h-4" />
                </Button>
                {!f.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDefault.mutate(f.id);
                      toast.success("Default forklift updated");
                    }}
                  >
                    <Star className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => {
                    deleteForklift.mutate(f.id);
                    toast.success("Forklift removed");
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Question Assignment Dialog */}
      <Dialog open={!!selectedForkliftForQuestions} onOpenChange={() => setSelectedForkliftForQuestions(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Assign Questions to {selectedForklift?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2 pr-2">
              {allQuestions?.filter(q => q.is_active).map((q) => {
                const isAssigned = assignedQuestionIds?.includes(q.id) ?? false;
                return (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                    onClick={() => handleToggleQuestion(q.id, isAssigned)}
                  >
                    <Checkbox
                      checked={isAssigned}
                      onCheckedChange={() => handleToggleQuestion(q.id, isAssigned)}
                    />
                    <span className="text-sm flex-1">{q.question_text}</span>
                  </div>
                );
              })}
              {(!allQuestions || allQuestions.filter(q => q.is_active).length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  No active questions available. Enable questions in the Questions tab.
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}