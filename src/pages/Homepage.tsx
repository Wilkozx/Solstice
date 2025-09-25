import { useEffect, useState } from "react";
import { getCustomers, addCustomer, updateCustomerMinutes } from "../lib/db";

import { Customer } from "@/types";

export default function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    const data = await getCustomers();
    setCustomers(data);
  };

  const handleAdd = async () => {
    await addCustomer("New Customer", undefined, 60);
    loadCustomers();
  };

  const handleUpdate = async (id: number) => {
    await updateCustomerMinutes(id, 90);
    loadCustomers();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Customers</h1>
      <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        Add Customer
      </button>
      <ul>
        {customers.map(c => (
          <li key={c.id} className="mb-2 flex justify-between items-center">
            <span>
              {c.name} - {c.minutes_remaining} min
            </span>
            <button
              onClick={() => handleUpdate(c.id)}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Update Minutes
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
