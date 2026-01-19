import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Wrench, AlertTriangle, Clock, CheckCircle2, Pause, Pencil, Trash2, Save, X, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  useMaintenanceRecords,
  useAddMaintenance,
  useUpdateMaintenance,
  useDeleteMaintenance,
  useForklifts,
  MaintenanceRecord,
} from "@/hooks/useForkliftData";

type StatusFilter = "all" | "open" | "in_progress" | "completed" | "deferred";

const statusConfig = {
  open: { label: "Open", icon: AlertTriangle, color: "bg-destructive text-destructive-foreground" },
  in_progress: { label: "In Progress", icon: Clock, color: "bg-yellow-500 text-white" },
  completed: { label: "Completed", icon: CheckCircle2, color: "bg-success text-success-foreground" },
  deferred: { label: "Deferred", icon: Pause, color: "bg-muted text-muted-foreground" },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", color: "bg-blue-500 text-white" },
  high: { label: "High", color: "bg-orange-500 text-white" },
  critical: { label: "Critical", color: "bg-destructive text-destructive-foreground" },
};

export function MaintenanceTab() {
  const { data: records } = useMaintenanceRecords();
  const { data: forklifts } = useForklifts();
  const addMaintenance = useAddMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const deleteMaintenance = useDeleteMaintenance();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Add form state
  const [newEquipmentId, setNewEquipmentId] = useState("");
  const [newIssue, setNewIssue] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [newReportedBy, setNewReportedBy] = useState("");
  const [newEstimatedCost, setNewEstimatedCost] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Edit form state
  const [editStatus, setEditStatus] = useState<"open" | "in_progress" | "completed" | "deferred">("open");
  const [editPriority, setEditPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [editWorkPerformed, setEditWorkPerformed] = useState("");
  const [editPartsUsed, setEditPartsUsed] = useState("");
  const [editTechnician, setEditTechnician] = useState("");
  const [editActualCost, setEditActualCost] = useState("");
  const [editDowntime, setEditDowntime] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const filteredRecords = records?.filter((r) => 
    statusFilter === "all" ? true : r.status === statusFilter
  );

  const handleAdd = () => {
    if (!newEquipmentId || !newIssue.trim()) {
      toast.error("Equipment and issue description are required");
      return;
    }
    addMaintenance.mutate({
      equipmentId: newEquipmentId,
      issueDescription: newIssue.trim(),
      priority: newPriority,
      reportedBy: newReportedBy.trim() || undefined,
      estimatedCost: newEstimatedCost ? parseFloat(newEstimatedCost) : undefined,
      notes: newNotes.trim() || undefined,
    });
    resetAddForm();
    toast.success("Maintenance record created");
  };

  const resetAddForm = () => {
    setShowAddForm(false);
    setNewEquipmentId("");
    setNewIssue("");
    setNewPriority("medium");
    setNewReportedBy("");
    setNewEstimatedCost("");
    setNewNotes("");
  };

  const handleStartEdit = (record: MaintenanceRecord) => {
    setEditingId(record.id);
    setEditStatus(record.status);
    setEditPriority(record.priority);
    setEditWorkPerformed(record.work_performed || "");
    setEditPartsUsed(record.parts_used || "");
    setEditTechnician(record.technician_name || "");
    setEditActualCost(record.actual_cost?.toString() || "");
    setEditDowntime(record.downtime_hours?.toString() || "");
    setEditNotes(record.notes || "");
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    updateMaintenance.mutate({
      id: editingId,
      status: editStatus,
      priority: editPriority,
      workPerformed: editWorkPerformed || undefined,
      partsUsed: editPartsUsed || undefined,
      technicianName: editTechnician || undefined,
      actualCost: editActualCost ? parseFloat(editActualCost) : undefined,
      downtimeHours: editDowntime ? parseFloat(editDowntime) : undefined,
      notes: editNotes || undefined,
      startedAt: editStatus === "in_progress" ? new Date().toISOString() : undefined,
      completedAt: editStatus === "completed" ? new Date().toISOString() : undefined,
    });
    setEditingId(null);
    toast.success("Maintenance record updated");
  };

  const handleDelete = (id: string) => {
    deleteMaintenance.mutate(id);
    toast.success("Maintenance record deleted");
  };

  return (
    <div className="space-y-4">
      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "in_progress", "completed", "deferred"] as StatusFilter[]).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="h-10 text-sm"
          >
            {status === "all" ? "All" : statusConfig[status].label}
            {status !== "all" && records && (
              <span className="ml-2 bg-background/20 px-2 py-0.5 rounded">
                {records.filter((r) => r.status === status).length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Add Maintenance Form */}
      <Collapsible open={showAddForm} onOpenChange={setShowAddForm}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-14 text-lg border-dashed"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Maintenance Record
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="p-5 mt-4 border-primary border-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Equipment *</label>
                <Select value={newEquipmentId} onValueChange={setNewEquipmentId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select equipment..." />
                  </SelectTrigger>
                  <SelectContent>
                    {forklifts?.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Issue Description *</label>
                <Textarea
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  placeholder="Describe the issue..."
                  className="min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as typeof newPriority)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Reported By</label>
                <Input
                  value={newReportedBy}
                  onChange={(e) => setNewReportedBy(e.target.value)}
                  placeholder="Badge or name"
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Estimated Cost</label>
                <Input
                  type="number"
                  value={newEstimatedCost}
                  onChange={(e) => setNewEstimatedCost(e.target.value)}
                  placeholder="0.00"
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <Input
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="h-12"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAdd} className="h-12" disabled={!newEquipmentId || !newIssue.trim()}>
                <Plus className="w-5 h-5 mr-2" />
                Create Record
              </Button>
              <Button variant="outline" onClick={resetAddForm} className="h-12">
                Cancel
              </Button>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Maintenance Records List */}
      {filteredRecords?.map((record) => (
        <Card key={record.id} className="p-5">
          {editingId === record.id ? (
            // Edit Mode
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select value={editStatus} onValueChange={(v) => setEditStatus(v as typeof editStatus)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="deferred">Deferred</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Priority</label>
                  <Select value={editPriority} onValueChange={(v) => setEditPriority(v as typeof editPriority)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Work Performed</label>
                  <Textarea
                    value={editWorkPerformed}
                    onChange={(e) => setEditWorkPerformed(e.target.value)}
                    placeholder="Describe work done..."
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Parts Used</label>
                  <Input
                    value={editPartsUsed}
                    onChange={(e) => setEditPartsUsed(e.target.value)}
                    placeholder="Parts/materials"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Technician</label>
                  <Input
                    value={editTechnician}
                    onChange={(e) => setEditTechnician(e.target.value)}
                    placeholder="Who performed the work"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Actual Cost</label>
                  <Input
                    type="number"
                    value={editActualCost}
                    onChange={(e) => setEditActualCost(e.target.value)}
                    placeholder="0.00"
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Downtime (hours)</label>
                  <Input
                    type="number"
                    value={editDowntime}
                    onChange={(e) => setEditDowntime(e.target.value)}
                    placeholder="0"
                    className="h-12"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">Notes</label>
                  <Input
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Additional notes..."
                    className="h-12"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSaveEdit} className="h-12">
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingId(null)} className="h-12">
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // View Mode
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <span className="font-medium text-lg">{record.forklift_units?.name || "Unknown Equipment"}</span>
                  <Badge className={statusConfig[record.status].color}>
                    {statusConfig[record.status].label}
                  </Badge>
                  <Badge className={priorityConfig[record.priority].color}>
                    {priorityConfig[record.priority].label}
                  </Badge>
                  {record.is_from_checklist && (
                    <Badge variant="outline" className="gap-1">
                      <Link className="w-3 h-3" />
                      From Checklist
                    </Badge>
                  )}
                </div>
                <p className="text-base mb-2">{record.issue_description}</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Reported: {format(new Date(record.reported_at), "MMM d, yyyy HH:mm")}</p>
                  {record.reported_by && <p>By: {record.reported_by}</p>}
                  {record.technician_name && <p>Technician: {record.technician_name}</p>}
                  {record.work_performed && <p>Work: {record.work_performed}</p>}
                  {record.actual_cost && <p>Cost: ${record.actual_cost.toFixed(2)}</p>}
                  {record.downtime_hours && <p>Downtime: {record.downtime_hours}h</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => handleStartEdit(record)}
                >
                  <Pencil className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 text-destructive"
                  onClick={() => handleDelete(record.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}

      {filteredRecords?.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No maintenance records found</p>
        </div>
      )}
    </div>
  );
}