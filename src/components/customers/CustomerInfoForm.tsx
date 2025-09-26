import { updateCustomerInfo } from "@/lib/db";
import { Customer } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerInfoForm({
  customer,
  onUpdated,
}: {
  customer: Customer;
  onUpdated: (updated: Customer) => void;
}) {
  const [name, setName] = useState(customer.name);
  const [lastname, setLastname] = useState(customer.lastname || "");
  const [initial, setInitial] = useState(customer);
  const [saving, setSaving] = useState(false);

  const hasChanges = name !== initial.name || lastname !== (initial.lastname || "");

  const handleReset = () => {
    setName(initial.name);
    setLastname(initial.lastname || "");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = { ...customer, name, lastname };
      await updateCustomerInfo(customer.id, name, lastname);
      setInitial(updated);
      onUpdated(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">Customer Info</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">First Name</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="lastname">Last Name</Label>
          <Input id="lastname" value={lastname} onChange={e => setLastname(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleReset} variant="secondary" disabled={!hasChanges}>
          Reset
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges || saving}>
          Save
        </Button>
      </div>
    </div>
  );
}
