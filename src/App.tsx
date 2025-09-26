import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      await backupDatabase();
      await cleanupBackups(7);

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

      setTimeout(function midnightBackup() {
        backupDatabase();
        cleanupBackups(7);
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
      <ToastContainer position="top-right" autoClose={false} />
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
