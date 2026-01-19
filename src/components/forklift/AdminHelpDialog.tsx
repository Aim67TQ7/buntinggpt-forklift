import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AdminHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/10 h-12 w-12"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Admin Guide</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 pr-4">
            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">Failed Items Banner</h3>
              <p className="text-muted-foreground">
                The red banner at the top shows unread failure notifications. Tap the X to dismiss each one after reviewing.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">History Tab</h3>
              <p className="text-muted-foreground">
                View all checklist submissions. Tap the eye icon to see full details. Use the trash icon to delete a submission.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">Maintenance Tab</h3>
              <p className="text-muted-foreground">
                Track equipment maintenance and repairs. Create records manually or view those auto-generated from failed checklist items. Update status, track costs, and record work performed.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">Questions Tab</h3>
              <p className="text-muted-foreground">
                Manage checklist questions. Toggle the switch to enable or disable questions. Disabled questions won't appear on the checklist.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">Drivers Tab</h3>
              <p className="text-muted-foreground">
                Manage authorized equipment operators. Add new drivers with their name and badge number. Remove drivers to revoke their access.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">Equipment Tab</h3>
              <p className="text-muted-foreground">
                Add, remove, or set the default equipment. The default equipment is pre-selected when operators start a new checklist.
              </p>
            </section>

            <section className="pt-2 border-t border-border">
              <h3 className="font-semibold text-lg text-primary mb-2">Tips</h3>
              <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                <li>Check failed items daily</li>
                <li>Keep driver list current</li>
                <li>Review and update questions periodically</li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
