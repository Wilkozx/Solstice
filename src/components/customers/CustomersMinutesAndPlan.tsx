"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types";
import {
  getCustomerPlans,
  addCustomerPlan,
  removeCustomerPlan,
  updateCustomerMinutes,
} from "@/lib/db";
import { toast } from "react-toastify";

export function CustomerMinutesAndPlanForm({
  customer,
}: {
  customer: Customer;
  onUpdated: (updatedMinutes: number) => void;
}) {
  const [minutes, setMinutes] = useState(customer.minutes_remaining);
  const [initialMinutes, setInitialMinutes] = useState(customer.minutes_remaining);
  const [manualAdjust, setManualAdjust] = useState(0);

  const [plans, setPlans] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const decrementOptions = [-3, -6, -9, -12, -15];
  const incrementOptions = [3, 6, 9, 12, 15];

  useEffect(() => {
    async function loadPlans() {
      const data = await getCustomerPlans(customer.id);
      setPlans(data);
      updateActivePlan(data);
    }
    loadPlans();
  }, [customer.id]);

  const updateActivePlan = (plansData: any[]) => {
    const now = new Date();
    const active = plansData.find(plan => {
      const start = new Date(plan.start_date);
      const end = new Date(plan.end_date);
      end.setHours(23, 59, 59, 999);
      return start <= now && now <= end;
    });
    setActivePlan(active || null);
  };

  const hasUnlimitedPlan =
    activePlan &&
    (activePlan.type === "unlimited_week" ||
      activePlan.type === "unlimited_month" ||
      activePlan.type === "custom");

  const adjustMinutes = (delta: number) => setMinutes(prev => Math.max(0, prev + delta));
  const hasChanges = minutes !== initialMinutes;

  const handleReset = () => setMinutes(initialMinutes);

  const handleSave = async () => {
    if (!hasChanges || hasUnlimitedPlan) return;

    try {
      const netChange = minutes - initialMinutes; // compute the delta
      await updateCustomerMinutes(customer.id, minutes);
      setInitialMinutes(minutes);
      //   onUpdated(minutes);

      toast.success(
        `Minutes ${netChange > 0 ? "added" : "removed"}: ${Math.abs(netChange)} (total: ${minutes})`
      );
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

  const addPlan = async (type: "unlimited_week" | "unlimited_month" | "custom") => {
    let start = new Date();
    let end = new Date();

    if (type === "unlimited_week") end.setDate(start.getDate() + 7);
    if (type === "unlimited_month") end.setDate(start.getDate() + 28);
    if (type === "custom") {
      if (!customStart || !customEnd) {
        toast.error("Please select a start and end date");
        return;
      }
      start = new Date(customStart);
      end = new Date(customEnd);
    }

    await addCustomerPlan(customer.id, type, start.toISOString(), end.toISOString());
    const updatedPlans = await getCustomerPlans(customer.id);
    setPlans(updatedPlans);
    updateActivePlan(updatedPlans);
    toast.success(
      `Plan added: ${type.replace("_", " ")} (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`
    );
  };

  const removePlan = async (planId: number) => {
    await removeCustomerPlan(planId);
    const updatedPlans = await getCustomerPlans(customer.id);
    setPlans(updatedPlans);
    updateActivePlan(updatedPlans);
    toast.info("Plan removed");
  };

  const daysLeft = activePlan
    ? Math.ceil(
        (new Date(activePlan.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm flex flex-col space-y-6">
      <h2 className="text-xl font-semibold text-center m-0">Minutes Remaining</h2>
      <div className="text-6xl sm:text-7xl font-extrabold text-center my-8">
        {hasUnlimitedPlan ? "∞" : minutes}
      </div>

      {activePlan && (
        <div className="p-2 bg-green-100 text-green-800 rounded">
          Active Plan: {activePlan.type.replace("_", " ")} ({daysLeft} day
          {daysLeft !== 1 ? "s" : ""} left)
        </div>
      )}

      {/* Quick Adjust */}
      <div className="flex w-full gap-2 justify-between">
        <div className="flex flex-1 gap-2">
          {[...decrementOptions].reverse().map(d => (
            <Button
              key={`dec-${d}`}
              variant="destructive"
              size="default"
              onClick={() => adjustMinutes(d)}
              disabled={hasUnlimitedPlan}
              className="flex-1"
            >
              {d}
            </Button>
          ))}
        </div>
        <div className="flex flex-1 gap-2 justify-end">
          {incrementOptions.map(d => (
            <Button
              key={`inc-${d}`}
              variant="default"
              size="default"
              onClick={() => adjustMinutes(d)}
              disabled={hasUnlimitedPlan}
              className="flex-1"
            >
              +{d}
            </Button>
          ))}
        </div>
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

      {/* Plan Add Buttons */}
      <div className="flex gap-2 w-full mt-4">
        <Button className="flex-1" onClick={() => addPlan("unlimited_week")}>
          Unlimited Week (starting today)
        </Button>
        <Button className="flex-1" onClick={() => addPlan("unlimited_month")}>
          Unlimited Month (starting today)
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
        <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
        <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
        <Button onClick={() => addPlan("custom")}>Add Custom Plan</Button>
      </div>

      {/* Plan History */}
      <div className="w-full mt-4">
        <h3 className="font-semibold">Plan History</h3>
        <ul className="divide-y divide-gray-200 rounded border">
          {plans.map((plan, idx) => {
            const start = new Date(plan.start_date).toLocaleDateString("en-GB");
            const end = new Date(plan.end_date).toLocaleDateString("en-GB");
            const isActive = activePlan?.id === plan.id;
            return (
              <li
                key={plan.id}
                className={`flex justify-between items-center px-4 py-2 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} ${isActive ? "font-bold text-green-800" : ""}`}
              >
                <span>
                  {plan.type.replace("_", " ")}: {start} - {end}
                </span>
                <Button variant="destructive" size="sm" onClick={() => removePlan(plan.id)}>
                  Remove
                </Button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
