import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddForklift, useSetDefaultForklift, useDeleteForklift, ForkliftUnit } from "@/hooks/useForkliftData";

interface SettingsTabProps {
  forklifts: ForkliftUnit[];
}

export function SettingsTab({ forklifts }: SettingsTabProps) {
  const [newName, setNewName] = useState("");
  const [newUnitNumber, setNewUnitNumber] = useState("");
  const addForklift = useAddForklift();
  const setDefault = useSetDefaultForklift();
  const deleteForklift = useDeleteForklift();

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
    </div>
  );
}
