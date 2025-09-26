"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Transaction } from "@/types";
import { getTransactionsForCustomer } from "@/lib/db";

export default function CustomerHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      if (!id) {
        setError("No customer id provided");
        setLoading(false);
        return;
      }

      try {
        const data = await getTransactionsForCustomer(parseInt(id));
        setTransactions(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load transaction history");
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [id]);

  if (loading) return <div>Loading history...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-12 max-w-3xl space-y-6">
      <Button variant="outline" onClick={() => navigate(`/`)}>
        &larr; Back
      </Button>

      <h1 className="text-2xl font-bold">Transaction History</h1>

      {transactions.length === 0 ? (
        <p>No transactions found for this customer.</p>
      ) : (
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
              <th className="border border-gray-300 px-4 py-2 text-right">Change (minutes)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
                <td
                  className={`border border-gray-300 px-4 py-2 text-right ${
                    tx.change < 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {tx.change > 0 ? "+" : ""}
                  {tx.change}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
