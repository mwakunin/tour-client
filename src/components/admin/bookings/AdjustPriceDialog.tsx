"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";

interface AdjustPriceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (pricePerPerson: number) => void;
  isSaving: boolean;
  currentPricePerPerson: number;
  currentTotal: number;
  groupSize: number;
  currency: string;
}

/**
 * Records a price agreed off-site. Only the per-person rate is sent — the API
 * recomputes the total from the stored group size — so the figure previewed
 * here is exactly what the server will store.
 */
export default function AdjustPriceDialog({
  open,
  onClose,
  onSave,
  isSaving,
  currentPricePerPerson,
  currentTotal,
  groupSize,
  currency,
}: AdjustPriceDialogProps) {
  const [rate, setRate] = useState("");

  // Re-seed each time it opens, so a cancelled edit doesn't linger
  useEffect(() => {
    if (open) setRate(String(currentPricePerPerson || ""));
  }, [open, currentPricePerPerson]);

  if (!open) return null;

  const parsed = Number(rate);
  const valid = rate.trim() !== "" && Number.isFinite(parsed) && parsed > 0;
  const newTotal = valid ? parsed * groupSize : 0;
  const unchanged = valid && parsed === currentPricePerPerson;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || unchanged) return;
    onSave(parsed);
  };

  return (
    <Dialog open onClose={onClose} title="Adjust price" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface-container-low space-y-1 rounded-lg p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Current rate</span>
            <span className="text-on-surface font-medium">
              {formatCurrency(currentPricePerPerson, currency)} × {groupSize}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Current total</span>
            <span className="text-on-surface font-medium">
              {formatCurrency(currentTotal, currency)}
            </span>
          </div>
        </div>

        <Input
          label={`New rate per person (${currency})`}
          type="number"
          min={0}
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          error={rate.trim() !== "" && !valid ? "Enter an amount above zero" : undefined}
          disabled={isSaving}
          autoFocus
          required
        />

        <div className="flex items-baseline justify-between text-sm">
          <span className="text-on-surface-variant">New total ({groupSize} people)</span>
          <span className="text-on-surface text-lg font-semibold">
            {valid ? formatCurrency(newTotal, currency) : "—"}
          </span>
        </div>

        <p className="text-on-surface-variant text-xs">
          The customer pays this amount at checkout. Paid bookings cannot be re-priced.
        </p>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSaving || !valid || unchanged}>
            {isSaving ? "Saving…" : "Save price"}
          </Button>
          <Button type="button" variant="secondary" disabled={isSaving} onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
