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
  const [showAddForklift, setShowAddForklift] = useState(false);
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
      toast.success("Equipment added");
      setNewName("");
      setNewUnitNumber("");
      setShowAddForklift(false);
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Equipment unit number already exists");
      } else {
        toast.error("Failed to add equipment");
      }
    }
  };

  const handleCancel = () => {
    setShowAddForklift(false);
    setNewName("");
    setNewUnitNumber("");
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
      {/* Add Forklift Button/Form */}
      {showAddForklift ? (
        <Card className="p-5 border-primary border-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-base">Name</Label>
                <Input
                  placeholder="Hoist 1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-lg h-14"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-base">Unit #</Label>
                <Input
                  placeholder="FL-002"
                  value={newUnitNumber}
                  onChange={(e) => setNewUnitNumber(e.target.value)}
                  className="text-lg h-14"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="h-12" onClick={handleAdd} disabled={addForklift.isPending}>
                <Plus className="w-5 h-5 mr-2" />
                Add Equipment
              </Button>
              <Button variant="outline" onClick={handleCancel} className="h-12">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full h-14 text-lg border-dashed"
          onClick={() => setShowAddForklift(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Equipment
        </Button>
      )}

      {/* Equipment List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Manage Equipment ({forklifts.length})</h3>
        {forklifts.map((f) => (
          <Card key={f.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-lg">{f.name}</span>
                  {f.is_default && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-base text-muted-foreground">{f.unit_number}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setSelectedForkliftForQuestions(f.id)}
                  title="Assign Questions"
                >
                  <ClipboardList className="w-5 h-5" />
                </Button>
                {!f.is_default && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => {
                      setDefault.mutate(f.id);
                      toast.success("Default equipment updated");
                    }}
                  >
                    <Star className="w-5 h-5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive h-12 w-12"
                  onClick={() => {
                    deleteForklift.mutate(f.id);
                    toast.success("Equipment removed");
                  }}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {forklifts.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-lg">No equipment added yet</p>
        )}
      </div>

      {/* Question Assignment Dialog */}
      <Dialog open={!!selectedForkliftForQuestions} onOpenChange={() => setSelectedForkliftForQuestions(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">
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
                    className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                    onClick={() => handleToggleQuestion(q.id, isAssigned)}
                  >
                    <Checkbox
                      checked={isAssigned}
                      onCheckedChange={() => handleToggleQuestion(q.id, isAssigned)}
                    />
                    <span className="text-base flex-1">{q.question_text}</span>
                  </div>
                );
              })}
              {(!allQuestions || allQuestions.filter(q => q.is_active).length === 0) && (
                <p className="text-center text-muted-foreground py-4 text-base">
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
