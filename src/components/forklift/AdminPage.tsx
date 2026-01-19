import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ClipboardList, Truck, Trash2, Eye, X, Check, Users, Save, Edit2, Plus } from "lucide-react";
import { AdminHelpDialog } from "./AdminHelpDialog";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  useFailNotifications,
  useSubmissions,
  useChecklistQuestions,
  useForklifts,
  useMarkNotificationRead,
  useToggleQuestion,
  useUpdateQuestion,
  useDeleteSubmission,
  useSubmissionResponses,
  useUpdateAdminNotes,
  useAddQuestion,
} from "@/hooks/useForkliftData";
import { SettingsTab } from "./SettingsTab";
import { DriversTab } from "./DriversTab";

const ADMIN_PASSCODE = "4155";

export function AdminPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState("");
  const [editQuestionLabel, setEditQuestionLabel] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newQuestionLabel, setNewQuestionLabel] = useState("");

  const { data: notifications } = useFailNotifications();
  const { data: submissions } = useSubmissions();
  const { data: questions } = useChecklistQuestions();
  const { data: forklifts } = useForklifts();
  const { data: responses } = useSubmissionResponses(selectedSubmission);
  const markRead = useMarkNotificationRead();
  const toggleQuestion = useToggleQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteSubmission = useDeleteSubmission();
  const updateAdminNotes = useUpdateAdminNotes();
  const addQuestion = useAddQuestion();

  const handlePasscode = (digit: string) => {
    const newPasscode = passcode + digit;
    setPasscode(newPasscode);
    if (newPasscode.length === 4) {
      if (newPasscode === ADMIN_PASSCODE) {
        setAuthenticated(true);
      } else {
        toast.error("Invalid passcode");
        setPasscode("");
      }
    }
  };

  const handleDismissNotification = (id: string) => {
    markRead.mutate(id);
  };

  const handleEditQuestion = (q: any) => {
    setEditingQuestion(q.id);
    setEditQuestionText(q.question_text);
    setEditQuestionLabel(q.label || `Q${q.sort_order}`);
  };

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      updateQuestion.mutate({
        id: editingQuestion,
        questionText: editQuestionText,
        label: editQuestionLabel,
      });
      setEditingQuestion(null);
      toast.success("Question updated");
    }
  };

  const handleAddQuestion = () => {
    if (newQuestionText.trim()) {
      addQuestion.mutate({
        questionText: newQuestionText.trim(),
        label: newQuestionLabel.trim() || undefined,
      });
      setNewQuestionText("");
      setNewQuestionLabel("");
      setShowAddQuestion(false);
      toast.success("Question added");
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-3">
        <Card className="w-full max-w-xs">
          <CardHeader className="py-3">
            <CardTitle className="text-center text-lg">Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex justify-center mb-4">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i < passcode.length ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "←"].map((digit, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-12 text-lg font-medium"
                  disabled={digit === ""}
                  onClick={() => {
                    if (digit === "←") {
                      setPasscode((p) => p.slice(0, -1));
                    } else if (digit !== "") {
                      handlePasscode(String(digit));
                    }
                  }}
                >
                  {digit}
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-3 text-base h-10"
              onClick={() => navigate("/")}
            >
              Back to Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unreadCount = notifications?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground p-5 shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 h-14 w-14"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-8 h-8" />
          </Button>
          <h1 className="text-xl font-bold flex-1">Admin Panel</h1>
          <AdminHelpDialog />
        </div>
      </div>

      {/* Notifications Banner */}
      {unreadCount > 0 && (
        <div className="bg-destructive text-destructive-foreground p-5">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" />
            <span className="font-medium text-lg">{unreadCount} Failed Item{unreadCount > 1 ? "s" : ""} Reported</span>
          </div>
          <ScrollArea className="mt-4 max-h-48">
            {notifications?.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between py-3 border-b border-destructive-foreground/20 last:border-0"
              >
                <div className="text-base">
                  <span className="font-medium">{n.forklift_name}</span>
                  <span className="mx-2">•</span>
                  <span>{n.question_text}</span>
                  <span className="ml-3 opacity-70">Badge: {n.badge_number}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 hover:bg-destructive-foreground/10"
                  onClick={() => handleDismissNotification(n.id)}
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="submissions" className="p-5">
        <TabsList className="w-full grid grid-cols-4 h-14">
          <TabsTrigger value="submissions" className="text-base">
            <ClipboardList className="w-5 h-5 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-base">
            <Check className="w-5 h-5 mr-2" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="drivers" className="text-base">
            <Users className="w-5 h-5 mr-2" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-base">
            <Truck className="w-5 h-5 mr-2" />
            Forklifts
          </TabsTrigger>
        </TabsList>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="mt-5 space-y-4">
          {submissions?.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="flex items-center p-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-lg">{s.forklift_units?.name}</span>
                    {s.has_failures && (
                      <Badge variant="destructive" className="text-base px-3 py-1">Failed</Badge>
                    )}
                  </div>
                  <div className="text-base text-muted-foreground mt-1">
                    Badge: {s.badge_number} • {format(new Date(s.submitted_at), "MMM d, HH:mm")}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14"
                    onClick={() => setSelectedSubmission(s.id)}
                  >
                    <Eye className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-14 w-14"
                    onClick={() => {
                      deleteSubmission.mutate(s.id);
                      toast.success("Submission deleted");
                    }}
                  >
                    <Trash2 className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {submissions?.length === 0 && (
            <p className="text-center text-muted-foreground py-10 text-lg">No submissions yet</p>
          )}
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="mt-5 space-y-4">
          {/* Add Question Button/Form */}
          {showAddQuestion ? (
            <Card className="p-5 border-primary border-2">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={newQuestionLabel}
                    onChange={(e) => setNewQuestionLabel(e.target.value)}
                    placeholder="Label (e.g., Q1)"
                    className="w-24 h-14 text-lg"
                  />
                  <Input
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Enter question text..."
                    className="flex-1 h-14 text-lg"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAddQuestion} className="h-12" disabled={!newQuestionText.trim()}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Question
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowAddQuestion(false);
                    setNewQuestionText("");
                    setNewQuestionLabel("");
                  }} className="h-12">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button
              variant="outline"
              className="w-full h-14 text-lg border-dashed"
              onClick={() => setShowAddQuestion(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Question
            </Button>
          )}

          {questions?.map((q, index) => (
            <Card key={q.id} className="p-5">
              {editingQuestion === q.id ? (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      value={editQuestionLabel}
                      onChange={(e) => setEditQuestionLabel(e.target.value)}
                      placeholder="Label"
                      className="w-24 h-14 text-lg"
                    />
                    <Input
                      value={editQuestionText}
                      onChange={(e) => setEditQuestionText(e.target.value)}
                      placeholder="Question text"
                      className="flex-1 h-14 text-lg"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleSaveQuestion} className="h-12">
                      <Save className="w-5 h-5 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingQuestion(null)} className="h-12">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-base px-3 py-1">
                        {(q as any).label || `Q${index + 1}`}
                      </Badge>
                      <p className="font-medium text-lg">{q.question_text}</p>
                    </div>
                    <Badge variant="secondary" className="mt-2 text-sm">{q.category}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => handleEditQuestion(q)}
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                    <Switch
                      checked={q.is_active}
                      onCheckedChange={(checked) => toggleQuestion.mutate({ id: q.id, isActive: checked })}
                      className="scale-150"
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="mt-5">
          <DriversTab />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-5">
          <SettingsTab forklifts={forklifts || []} />
        </TabsContent>
      </Tabs>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Checklist Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-5 pr-3">
              {responses?.map((r) => (
                <div key={r.id} className="py-4 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-base">{r.forklift_checklist_questions?.question_text}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(r.timestamp), "HH:mm:ss")}
                      </p>
                    </div>
                    <Badge
                      variant={r.status === "fail" ? "destructive" : "secondary"}
                      className={`text-base px-4 py-2 ${r.status === "pass" ? "bg-success text-success-foreground" : ""}`}
                    >
                      {r.status.toUpperCase()}
                    </Badge>
                  </div>
                  {r.status === "fail" && (
                    <div className="mt-4 space-y-3">
                      <Textarea
                        placeholder="Add repair notes..."
                        value={adminNotes[r.id] ?? r.admin_notes ?? ""}
                        onChange={(e) => setAdminNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                        className="min-h-[80px] text-base"
                      />
                      <Button
                        onClick={() => {
                          const notes = adminNotes[r.id] ?? r.admin_notes ?? "";
                          updateAdminNotes.mutate({ responseId: r.id, adminNotes: notes });
                          toast.success("Notes saved");
                        }}
                        disabled={updateAdminNotes.isPending}
                        className="h-12"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save Notes
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
