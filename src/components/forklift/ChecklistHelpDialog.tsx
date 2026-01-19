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

export function ChecklistHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-12 w-12"
        >
          <HelpCircle className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">How to Use</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-4 pr-4">
            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">1. Enter Your Badge Number</h3>
              <p className="text-muted-foreground">
                Type your employee badge number in the field. A green checkmark means you're authorized to operate this equipment. A red alert means you're not authorized.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">2. Select Your Equipment</h3>
              <p className="text-muted-foreground">
                Choose the equipment you'll be operating from the selection screen.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">3. Complete the Checklist</h3>
              <p className="text-muted-foreground">
                Tap each item once to mark as <span className="text-success font-medium">PASS</span> (green). 
                Tap again to mark as <span className="text-destructive font-medium">FAIL</span> (red). 
                Tap a third time to clear.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">4. Add Comments for Failed Items</h3>
              <p className="text-muted-foreground">
                If you mark an item as FAIL, you must enter a comment explaining the issue. This is required before submitting.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-lg text-primary mb-2">5. Submit</h3>
              <p className="text-muted-foreground">
                Once all items are answered and any required comments are provided, tap Submit Checklist. Failed items will notify the admin.
              </p>
            </section>

            <section className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Need admin access? Tap the gear icon in the top right.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
