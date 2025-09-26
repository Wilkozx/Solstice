"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Customer } from "@/types";
import { getCustomerPlans, addCustomerPlan } from "@/lib/db";
import { toast } from "react-toastify";

export function CustomerPlanForm({ customer }: { customer: Customer }) {
  const [plans, setPlans] = useState<any[]>([]);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Load plans on mount
  useEffect(() => {
    async function loadPlans() {
      const data = await getCustomerPlans(customer.id);
      setPlans(data);
    }
    loadPlans();
  }, [customer.id]);

  // Find the active plan
  const activePlan = plans.find(plan => {
    const now = new Date();
    const start = new Date(plan.start_date);
    const end = new Date(plan.end_date);
    end.setHours(23, 59, 59, 999); // include entire end day
    return start <= now && now <= end;
  });

  // Compute remaining days
  const remainingDays = activePlan
    ? Math.max(
        0,
        Math.ceil(
          (new Date(activePlan.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const addPlan = async (type: "unlimited_week" | "unlimited_month" | "custom") => {
    let start = new Date();
    let end = new Date();

    if (type === "unlimited_week") end.setDate(start.getDate() + 7);
    if (type === "unlimited_month") end.setMonth(start.getMonth() + 1);
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

    const message = `Added plan: ${type.replace("_", " ")} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`;
    toast.success(message);
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm flex flex-col space-y-4">
      <h2 className="text-xl font-semibold">Customer Plans</h2>

      {/* Active Plan */}
      {activePlan && (
        <div className="p-2 bg-green-100 text-green-800 rounded flex justify-between items-center">
          <span>
            Active Plan: {activePlan.type.replace("_", " ")} (
            {new Date(activePlan.start_date).toLocaleDateString()} -{" "}
            {new Date(activePlan.end_date).toLocaleDateString()})
          </span>
          <span className="font-bold">{remainingDays} days left</span>
        </div>
      )}

      {/* Quick add buttons */}
      <div className="flex gap-2">
        <Button onClick={() => addPlan("unlimited_week")}>Unlimited Week</Button>
        <Button onClick={() => addPlan("unlimited_month")}>Unlimited Month</Button>
      </div>

      {/* Custom date range */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
        <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
        <Button onClick={() => addPlan("custom")}>Add Custom Plan</Button>
      </div>

      {/* Plan History */}
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Plan History</h3>
        {plans.length === 0 && <p className="text-sm text-gray-500">No plans yet.</p>}
        <ul className="space-y-1 text-sm">
          {plans.map(plan => (
            <li key={plan.id} className="flex justify-between border-b py-1">
              <span>{plan.type.replace("_", " ")}</span>
              <span>
                {new Date(plan.start_date).toLocaleDateString()} -{" "}
                {new Date(plan.end_date).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
