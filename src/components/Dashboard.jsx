import { useDashboardData } from "../hooks/useDashboardData";
import Navbar from "./dashboard/Navbar";
import StatusCard from "./dashboard/StatusCard";
import ActionMenu from "./dashboard/ActionMenu";
import HistoryList from "./dashboard/HistoryList";

export default function Dashboard() {
  // ดึง Logic มาจาก Hook
  const { user, stats, history, loading, logout } = useDashboardData();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <Navbar user={user} onLogout={logout} />
      <div className="max-w-md md:max-w-4xl mx-auto p-4 space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6 md:items-start md:mt-6">
        {/* Left Column (Desktop) */}
        <div className="space-y-6">
          <StatusCard user={user} stats={stats} />
          <div className="hidden md:block">
            <ActionMenu user={user} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="md:hidden">
            <ActionMenu user={user} />
          </div>

          <HistoryList history={history} loading={loading} />
        </div>
      </div>
    </div>
  );
}
