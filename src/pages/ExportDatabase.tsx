"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getCustomers, getAllTransactions } from "@/lib/db";
import { writeTextFile, create } from "@tauri-apps/plugin-fs";
import { appDataDir, join } from "@tauri-apps/api/path";
import { useNavigate } from "react-router-dom";

export default function ExportDatabase() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleExport = async () => {
    setExporting(true);
    setError("");
    setSuccess("");

    try {
      // Fetch all data
      const customers = await getCustomers();
      const transactions = await getAllTransactions();

      const data = {
        customers,
        transactions,
        exportedAt: new Date().toISOString(),
      };

      // Get AppData path
      const dbDir = await appDataDir();

      // Build file path directly in AppData
      const today = new Date().toISOString().slice(0, 10);
      const filePath = await join(dbDir, `db-export-${today}.json`);

      // Create empty file if not exists
      await create(filePath);

      // Write JSON
      await writeTextFile(filePath, JSON.stringify(data, null, 2));

      setSuccess(`Database exported successfully!`);
      console.log("Exported database to:", filePath);
    } catch (err) {
      console.error(err);
      setError("Failed to export database");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-md space-y-6">
      <Button variant="outline" onClick={() => navigate("/")}>
        &larr; Back to Customers
      </Button>

      <h1 className="text-2xl font-bold">Export Database</h1>

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <Button onClick={handleExport} disabled={exporting}>
        {exporting ? "Exporting..." : "Export Database to JSON"}
      </Button>
    </div>
  );
}
