import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import CustomersPage from "./components/customers/page";
import { backupDatabase, cleanupBackups } from "./lib/backupManager";
import { Button } from "./components/ui/button";

import { runUpdater } from "./lib/updateManager";

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    runUpdater().catch(err => console.error("Updater error:", err));
  }, []);

  useEffect(() => {
    async function scheduleDailyBackup() {
      // Run immediately on startup
      await backupDatabase();
      await cleanupBackups(7);

      // Calculate milliseconds until next midnight
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0
      );
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();

      // First backup at next midnight
      setTimeout(function midnightBackup() {
        backupDatabase();
        cleanupBackups(7);
        // Schedule next backups every 24 hours
        setInterval(
          () => {
            backupDatabase();
            cleanupBackups(7);
          },
          24 * 60 * 60 * 1000
        );
      }, msUntilMidnight);
    }

    scheduleDailyBackup();
  }, []);

  return (
    <div className="p-4">
      {/* Button to go to backup/export page */}
      <Button onClick={() => navigate("/backup")}>Go to Backup / Export Database</Button>

      <Routes>
        <Route path="/" element={<CustomersPage />} />
        {/* <Route path="/customer/add" element={<AddCustomer />} /> */}
        {/* <Route path="/customer/:id" element={<EditCustomer />} /> */}
        {/* <Route path="/customer/:id/history" element={<CustomerHistory/>} /> */}
        {/* <Route path="/backup" element={<ExportDatabase/>} /> */}
      </Routes>
    </div>
  );
}
