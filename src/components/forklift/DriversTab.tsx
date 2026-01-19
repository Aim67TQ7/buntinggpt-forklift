import { useState } from "react";
import { Plus, Trash2, User, Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQualifiedDrivers, useAddDriver, useDeleteDriver } from "@/hooks/useForkliftData";

export function DriversTab() {
  const [newBadge, setNewBadge] = useState("");
  const [newName, setNewName] = useState("");
  const [newCertifiedDate, setNewCertifiedDate] = useState("");
  const [newRecertifyDate, setNewRecertifyDate] = useState("");
  const [newTrainer, setNewTrainer] = useState("");
  const { data: drivers } = useQualifiedDrivers();
  const addDriver = useAddDriver();
  const deleteDriver = useDeleteDriver();

  const handleAdd = async () => {
    if (!newBadge.trim() || !newName.trim()) {
      toast.error("Please fill in badge number and name");
      return;
    }
    try {
      await addDriver.mutateAsync({ 
        badgeNumber: newBadge, 
        driverName: newName,
        certifiedDate: newCertifiedDate || undefined,
        recertifyDate: newRecertifyDate || undefined,
        trainer: newTrainer || undefined
      });
      toast.success("Driver added");
      setNewBadge("");
      setNewName("");
      setNewCertifiedDate("");
      setNewRecertifyDate("");
      setNewTrainer("");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.error("Badge number already exists");
      } else {
        toast.error("Failed to add driver");
      }
    }
  };

  const isRecertifyDueSoon = (recertifyDate: string | null) => {
    if (!recertifyDate) return false;
    const date = new Date(recertifyDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return date <= thirtyDaysFromNow;
  };

  const isRecertifyOverdue = (recertifyDate: string | null) => {
    if (!recertifyDate) return false;
    return new Date(recertifyDate) < new Date();
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-base">Certified Date</Label>
            <Input
              type="date"
              value={newCertifiedDate}
              onChange={(e) => setNewCertifiedDate(e.target.value)}
              className="text-lg h-12"
            />
          </div>
          <div>
            <Label className="text-base">Recertify Date</Label>
            <Input
              type="date"
              value={newRecertifyDate}
              onChange={(e) => setNewRecertifyDate(e.target.value)}
              className="text-lg h-12"
            />
          </div>
        </div>
        <div>
          <Label className="text-base">Trainer</Label>
          <Input
            placeholder="Trainer name"
            value={newTrainer}
            onChange={(e) => setNewTrainer(e.target.value)}
            className="text-lg h-12"
          />
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
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-lg">{d.driver_name}</p>
                  <p className="text-base text-muted-foreground">Badge: {d.badge_number}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {d.certified_date && (
                      <Badge variant="secondary" className="text-sm">
                        <Calendar className="w-3 h-3 mr-1" />
                        Certified: {format(new Date(d.certified_date), "MMM d, yyyy")}
                      </Badge>
                    )}
                    {d.recertify_date && (
                      <Badge 
                        variant={isRecertifyOverdue(d.recertify_date) ? "destructive" : isRecertifyDueSoon(d.recertify_date) ? "outline" : "secondary"}
                        className="text-sm"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        Recertify: {format(new Date(d.recertify_date), "MMM d, yyyy")}
                      </Badge>
                    )}
                    {d.trainer && (
                      <Badge variant="outline" className="text-sm">
                        <Award className="w-3 h-3 mr-1" />
                        Trainer: {d.trainer}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-12 w-12 flex-shrink-0"
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
