"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types";
import { updateCustomerMinutes, getCustomerPlans } from "@/lib/db";
import { toast } from "react-toastify";

export function CustomerMinutesForm({
  customer,
  onUpdated,
}: {
  customer: Customer;
  onUpdated: (updatedMinutes: number) => void;
}) {
  const [minutes, setMinutes] = useState(customer.minutes_remaining);
  const [initialMinutes, setInitialMinutes] = useState(customer.minutes_remaining);
  const [manualAdjust, setManualAdjust] = useState(0);
  const [hasUnlimitedPlan, setHasUnlimitedPlan] = useState(false);

  const decrementOptions = [-3, -6, -9, -12, -15];
  const incrementOptions = [3, 6, 9, 12, 15];

  // Check for unlimited plan
  useEffect(() => {
    async function loadPlans() {
      const plans = await getCustomerPlans(customer.id);
      const now = new Date();
      const activeUnlimited = plans.find(
        (plan: {
          start_date: string | number | Date;
          end_date: string | number | Date;
          type: string;
        }) => {
          const start = new Date(plan.start_date);
          const end = new Date(plan.end_date);
          end.setHours(23, 59, 59, 999);
          return (
            start <= now &&
            now <= end &&
            (plan.type === "unlimited_week" || plan.type === "unlimited_month")
          );
        }
      );
      setHasUnlimitedPlan(!!activeUnlimited);
    }
    loadPlans();
  }, [customer.id]);

  const adjustMinutes = (delta: number) => setMinutes(prev => Math.max(0, prev + delta));
  const hasChanges = minutes !== initialMinutes;

  const handleReset = () => setMinutes(initialMinutes);

  const handleSave = async () => {
    if (!hasChanges || hasUnlimitedPlan) return;
    try {
      await updateCustomerMinutes(customer.id, minutes);
      setInitialMinutes(minutes);
      onUpdated(minutes);
      toast.success(`Updated minutes: ${minutes}`);
    } catch (err) {
      console.error("Failed to update minutes:", err);
      toast.error("Failed to update minutes");
    }
  };

  const handleManualAdd = () => {
    if (manualAdjust <= 0 || hasUnlimitedPlan) return;
    adjustMinutes(manualAdjust);
    setManualAdjust(0);
  };

  const handleManualSubtract = () => {
    if (manualAdjust <= 0 || hasUnlimitedPlan) return;
    adjustMinutes(-manualAdjust);
    setManualAdjust(0);
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm flex flex-col items-center space-y-6">
      <h2 className="text-xl font-semibold">Minutes Remaining</h2>
      <div className="text-4xl font-bold">{hasUnlimitedPlan ? "∞" : minutes}</div>

      {/* Quick Adjust */}
      <div className="flex flex-wrap justify-center gap-2">
        {decrementOptions.map(d => (
          <Button
            key={`dec-${d}`}
            variant="destructive"
            size="sm"
            onClick={() => adjustMinutes(d)}
            disabled={hasUnlimitedPlan}
          >
            {d}
          </Button>
        ))}
        {incrementOptions.map(d => (
          <Button
            key={`inc-${d}`}
            variant="default"
            size="sm"
            onClick={() => adjustMinutes(d)}
            disabled={hasUnlimitedPlan}
          >
            +{d}
          </Button>
        ))}
      </div>

      {/* Manual Adjust */}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Input
          type="number"
          min={0}
          placeholder="Enter minutes"
          value={manualAdjust || ""}
          onChange={e => setManualAdjust(parseInt(e.target.value) || 0)}
          className="flex-1"
          disabled={hasUnlimitedPlan}
        />
        <Button
          onClick={handleManualAdd}
          variant="default"
          disabled={manualAdjust <= 0 || hasUnlimitedPlan}
        >
          Add
        </Button>
        <Button
          onClick={handleManualSubtract}
          variant="destructive"
          disabled={manualAdjust <= 0 || hasUnlimitedPlan}
        >
          Subtract
        </Button>
      </div>

      <div className="flex gap-2 w-full">
        <Button
          onClick={handleReset}
          variant="secondary"
          className="flex-1"
          disabled={!hasChanges || hasUnlimitedPlan}
        >
          Reset
        </Button>
        <Button onClick={handleSave} className="flex-1" disabled={!hasChanges || hasUnlimitedPlan}>
          Save
        </Button>
      </div>

      {hasUnlimitedPlan && (
        <div className="text-green-600 font-semibold mt-2">Unlimited plan active</div>
      )}
    </div>
  );
}
