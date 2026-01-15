import { useState } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import Navbar from "./dashboard/Navbar";
import StatusCard from "./dashboard/StatusCard";
import ActionMenu from "./dashboard/ActionMenu";
import HistoryList from "./dashboard/HistoryList";
import ScannerModal from "./scanner/ScannerModal";

export default function Dashboard() {
  // ดึง Logic มาจาก Hook
  const { user, stats, history, loading, logout, fetchDashboardData } =
    useDashboardData();

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar user={user} onLogout={logout} />

      <div className="max-w-md md:max-w-4xl mx-auto p-4 space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 md:items-start md:mt-6">
        <div className="space-y-6">
          <StatusCard user={user} stats={stats} />
          <div className="hidden md:block">
            <ActionMenu user={user} onScan={() => setIsScannerOpen(true)} />{" "}
          </div>
        </div>

        <div className="space-y-6">
          <div className="md:hidden">
            <ActionMenu user={user} onScan={() => setIsScannerOpen(true)} />{" "}
          </div>

          <HistoryList history={history} loading={loading} />
        </div>
      </div>

      {/* --- Scanner Modal --- */}
      {/* ส่ง fetchDashboardData ไปให้ ScannerModal เรียกใช้เมื่อสแกนสำเร็จ */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        userId={user.id}
        onRefresh={fetchDashboardData}
      />
    </div>
  );
}
