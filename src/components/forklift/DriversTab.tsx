import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQualifiedDrivers, useAddDriver, useDeleteDriver, QualifiedDriver } from "@/hooks/useForkliftData";

export function DriversTab() {
  const [newBadge, setNewBadge] = useState("");
  const [newName, setNewName] = useState("");
  const { data: drivers } = useQualifiedDrivers();
  const addDriver = useAddDriver();
  const deleteDriver = useDeleteDriver();

  const handleAdd = async () => {
    if (!newBadge.trim() || !newName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await addDriver.mutateAsync({ badgeNumber: newBadge, driverName: newName });
      toast.success("Driver added");
      setNewBadge("");
      setNewName("");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Badge number already exists");
      } else {
        toast.error("Failed to add driver");
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Driver Form */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-lg">Add Qualified Driver</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-base">Badge #</Label>
            <Input
              placeholder="1234"
              value={newBadge}
              onChange={(e) => setNewBadge(e.target.value)}
              className="text-lg h-12"
              maxLength={10}
            />
          </div>
          <div>
            <Label className="text-base">Name</Label>
            <Input
              placeholder="John Doe"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-lg h-12"
            />
          </div>
        </div>
        <Button className="w-full h-12 text-lg" onClick={handleAdd} disabled={addDriver.isPending}>
          <Plus className="w-5 h-5 mr-2" />
          Add Driver
        </Button>
      </Card>

      {/* Driver List */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Qualified Drivers ({drivers?.length || 0})</h3>
        {drivers?.map((d) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-lg">{d.driver_name}</p>
                  <p className="text-base text-muted-foreground">Badge: {d.badge_number}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-12 w-12"
                onClick={() => {
                  deleteDriver.mutate(d.id);
                  toast.success("Driver removed");
                }}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        ))}
        {(!drivers || drivers.length === 0) && (
          <p className="text-center text-muted-foreground py-8 text-lg">No drivers added yet</p>
        )}
      </div>
    </div>
  );
}
