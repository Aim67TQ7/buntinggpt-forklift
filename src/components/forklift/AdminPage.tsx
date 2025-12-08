import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ClipboardList, Truck, Trash2, Eye, X, Check, Users } from "lucide-react";
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
import {
  useFailNotifications,
  useSubmissions,
  useChecklistQuestions,
  useForklifts,
  useMarkNotificationRead,
  useToggleQuestion,
  useDeleteSubmission,
  useSubmissionResponses,
} from "@/hooks/useForkliftData";
import { SettingsTab } from "./SettingsTab";
import { DriversTab } from "./DriversTab";

const ADMIN_PASSCODE = "4155";

export function AdminPage() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  const { data: notifications } = useFailNotifications();
  const { data: submissions } = useSubmissions();
  const { data: questions } = useChecklistQuestions();
  const { data: forklifts } = useForklifts();
  const { data: responses } = useSubmissionResponses(selectedSubmission);
  const markRead = useMarkNotificationRead();
  const toggleQuestion = useToggleQuestion();
  const deleteSubmission = useDeleteSubmission();

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

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-6">
              <div className="flex gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full ${
                      i < passcode.length ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "←"].map((digit, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-16 text-2xl font-medium"
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
              className="w-full mt-4 text-lg h-12"
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
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 h-12 w-12"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold flex-1">Admin Panel</h1>
          <AdminHelpDialog />
        </div>
      </div>

      {/* Notifications Banner */}
      {unreadCount > 0 && (
        <div className="bg-destructive text-destructive-foreground p-4">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            <span className="font-medium text-lg">{unreadCount} Failed Item{unreadCount > 1 ? "s" : ""} Reported</span>
          </div>
          <ScrollArea className="mt-3 max-h-40">
            {notifications?.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between py-2 border-b border-destructive-foreground/20 last:border-0"
              >
                <div className="text-base">
                  <span className="font-medium">{n.forklift_name}</span>
                  <span className="mx-2">•</span>
                  <span>{n.question_text}</span>
                  <span className="ml-2 opacity-70">Badge: {n.badge_number}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 hover:bg-destructive-foreground/10"
                  onClick={() => handleDismissNotification(n.id)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="submissions" className="p-4">
        <TabsList className="w-full grid grid-cols-4 h-12">
          <TabsTrigger value="submissions" className="text-sm">
            <ClipboardList className="w-4 h-4 mr-1" />
            History
          </TabsTrigger>
          <TabsTrigger value="questions" className="text-sm">
            <Check className="w-4 h-4 mr-1" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="drivers" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-sm">
            <Truck className="w-4 h-4 mr-1" />
            Forklifts
          </TabsTrigger>
        </TabsList>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="mt-4 space-y-3">
          {submissions?.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <div className="flex items-center p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-lg">{s.forklift_units?.name}</span>
                    {s.has_failures && (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                  <div className="text-base text-muted-foreground">
                    Badge: {s.badge_number} • {format(new Date(s.submitted_at), "MMM d, HH:mm")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setSelectedSubmission(s.id)}
                  >
                    <Eye className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-12 w-12"
                    onClick={() => {
                      deleteSubmission.mutate(s.id);
                      toast.success("Submission deleted");
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {submissions?.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-lg">No submissions yet</p>
          )}
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="mt-4 space-y-3">
          {questions?.map((q) => (
            <Card key={q.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-lg">{q.question_text}</p>
                  <Badge variant="outline" className="mt-1">{q.category}</Badge>
                </div>
                <Switch
                  checked={q.is_active}
                  onCheckedChange={(checked) => toggleQuestion.mutate({ id: q.id, isActive: checked })}
                  className="scale-125"
                />
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="mt-4">
          <DriversTab />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <SettingsTab forklifts={forklifts || []} />
        </TabsContent>
      </Tabs>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Checklist Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-3">
              {responses?.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="text-base">{r.forklift_checklist_questions?.question_text}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(r.timestamp), "HH:mm:ss")}
                    </p>
                  </div>
                  <Badge
                    variant={r.status === "pass" ? "default" : r.status === "fail" ? "destructive" : "secondary"}
                    className="text-base px-3 py-1"
                  >
                    {r.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
