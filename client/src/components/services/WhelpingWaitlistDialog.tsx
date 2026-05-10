import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

type Props = {
  providerId: string;
  open: boolean;
  onClose: () => void;
};

export default function WhelpingWaitlistDialog({ providerId, open, onClose }: Props) {
  const { toast } = useToast();
  const [expectedLitterDate, setExpectedLitterDate] = useState("");
  const [puppyPreference, setPuppyPreference] = useState("");
  const [notes, setNotes] = useState("");
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setExpectedLitterDate("");
    setPuppyPreference("");
    setNotes("");
    setPolicyAcknowledged(false);
  };

  const handleClose = () => {
    if (!submitting) {
      reset();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyAcknowledged) {
      toast({
        title: "Policy acknowledgement required",
        description: "You must agree to safety and legal rules before joining the waitlist.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        puppyPreference: puppyPreference.trim() || undefined,
        notes: notes.trim() || undefined,
        policyAcknowledged: true,
      };
      if (expectedLitterDate) {
        payload.expectedLitterDate = new Date(`${expectedLitterDate}T12:00:00.000Z`).toISOString();
      }
      const res = await apiRequest(`/api/services/whelping/waitlist/${providerId}`, {
        method: "POST",
        body: payload,
      });
      const checkoutUrl = (res as any)?.data?.checkoutUrl as string | undefined;
      if (!checkoutUrl) {
        throw new Error("No checkout URL returned");
      }
      window.location.href = checkoutUrl;
    } catch (error: any) {
      toast({
        title: "Waitlist request failed",
        description: error?.message || "Please try again shortly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply to Whelping Waitlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            High-risk category: strict safety checks apply. Deposits help prevent fraud and unauthorized access.
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            Deposit terms: this is an intent-to-proceed hold for verified waitlist management. Abuse, identity mismatch,
            chargeback misuse, or policy violations can trigger removal and forfeiture review.
          </div>

          <div className="space-y-2">
            <Label htmlFor="expectedDate">Expected litter timing (optional)</Label>
            <Input
              id="expectedDate"
              type="date"
              value={expectedLitterDate}
              onChange={(e) => setExpectedLitterDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preference">Puppy preference (optional)</Label>
            <Input
              id="preference"
              value={puppyPreference}
              onChange={(e) => setPuppyPreference(e.target.value)}
              placeholder="Example: female, family companion, low-shedding"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes for provider (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Share your timeline and relevant care context."
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-start gap-2">
              <Checkbox
                id="whelping-policy"
                checked={policyAcknowledged}
                onCheckedChange={(checked) => setPolicyAcknowledged(Boolean(checked))}
              />
              <label htmlFor="whelping-policy" className="text-sm text-slate-700">
                I acknowledge strict anti-theft, legal compliance, and animal welfare rules. Deposit is required
                to secure waitlist intent and may be forfeited for policy abuse or fraudulent conduct.
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="min-h-11 flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="min-h-11 flex-1" disabled={submitting}>
              {submitting ? "Preparing deposit..." : "Continue to deposit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

