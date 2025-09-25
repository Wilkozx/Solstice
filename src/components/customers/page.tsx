"use client";

import { useEffect, useState } from "react";
import { CustomersTable } from "./data-table";
import { getCustomers } from "@/lib/db";
import { columns } from "./Columns";
import { Customer } from "@/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      const data = await getCustomers();
      setCustomers(data);
      setLoading(false);
    }
    fetchCustomers();
  }, []);

  if (loading) {
    return <div className="container mx-auto py-10">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-xl font-bold mb-4">Customers</h1>
      <CustomersTable columns={columns} data={customers} />
    </div>
  );
}
