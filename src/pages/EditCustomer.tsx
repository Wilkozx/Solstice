"use client";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Customer } from "@/types";
import { getCustomers } from "@/lib/db";
import { CustomerInfoForm } from "@/components/customers/CustomerInfoForm";
import { CustomerMinutesForm } from "@/components/customers/CustomerMinutesForm";
import { CustomerPlanForm } from "@/components/customers/CustomerPlanForm";
import { CustomerMinutesAndPlanForm } from "@/components/customers/CustomersMinutesAndPlan";

export default function EditCustomer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      if (!id) return;
      const allCustomers = await getCustomers();
      const cust = allCustomers.find(c => c.id === parseInt(id));
      if (!cust) {
        setError("Customer not found");
        return;
      }
      setCustomer(cust);
    }
    loadCustomer();
  }, [id]);

  if (!customer) return <div>{error || "Loading..."}</div>;

  return (
    <div className="container mx-auto py-12 max-w-3xl space-y-8">
      <Button variant="outline" onClick={() => navigate("/")}>
        &larr; Back to Customers
      </Button>

      <h1 className="text-3xl font-bold">Customer Information</h1>

      {/* Display customer info form */}
      <CustomerInfoForm customer={customer} onUpdated={setCustomer} />
      {/* <CustomerMinutesForm
        customer={customer}
        onUpdated={function (updatedMinutes: number): void {
          throw new Error("Function not implemented.");
        }}
      ></CustomerMinutesForm>
      <CustomerPlanForm customer={customer} /> */}

      <CustomerMinutesAndPlanForm
        customer={customer}
        onUpdated={function (updatedMinutes: number): void {
          throw new Error("Function not implemented.");
        }}
      ></CustomerMinutesAndPlanForm>
    </div>
  );
}
