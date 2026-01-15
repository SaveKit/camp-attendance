import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Phone,
} from "lucide-react";
import { useReportStats } from "../../hooks/useReportStats";

export default function ReportDashboard() {
  const navigate = useNavigate();
  const { loading, stats, chartData, riskList, activities, allAttendance } =
    useReportStats();
  const [selectedActivityId, setSelectedActivityId] = useState("");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-camp-main animate-pulse font-bold">
        กำลังประมวลผลข้อมูล...
      </div>
    );
  }

  // --- 4. Logic สำหรับ Activity Drill-down ---
  // กรองเฉพาะคนที่มีปัญหา (Absent/Late) ในกิจกรรมที่เลือก
  const drillDownList = selectedActivityId
    ? allAttendance.filter(
        (a) =>
          String(a.activity_id) === String(selectedActivityId) &&
          ["Absent", "Late", "Late_Over_Limit"].includes(a.status)
      )
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">รายงานผลภาพรวม</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-8">
        {/* 1. ส่วนภาพรวม (Overview Cards) */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="text-blue-500" />}
            label="สตาฟทั้งหมด"
            value={stats.totalStaff}
            sub="คน"
          />
          <StatCard
            icon={<UserCheck className="text-green-500" />}
            label="พร้อมใช้งาน"
            value={stats.activeCount}
            sub={`Terminated: ${stats.terminatedCount}`}
          />
          <StatCard
            icon={<AlertTriangle className="text-orange-500" />}
            label="กลุ่มเสี่ยง"
            value={stats.dangerZoneCount}
            sub="เหลือโควตา ≤ 1"
            isDanger={stats.dangerZoneCount > 0}
          />
          <StatCard
            icon={<div className="font-bold text-purple-500">%</div>}
            label="การเข้าร่วม"
            value={`${stats.avgAttendance}%`}
            sub="เฉลี่ยทั้งค่าย"
          />
        </section>

        {/* 2. ส่วนกราฟสถิติ (Charts) */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            สถิติการเข้าร่วมรายกิจกรรม
          </h2>
          <div className="h-[300px] w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />
                <Bar
                  dataKey="Present"
                  stackId="a"
                  fill="#22c55e"
                  name="มาปกติ"
                  radius={[0, 0, 4, 4]}
                />
                <Bar dataKey="Late" stackId="a" fill="#eab308" name="สาย" />
                <Bar dataKey="Leave" stackId="a" fill="#3b82f6" name="ลา" />
                <Bar
                  dataKey="Absent"
                  stackId="a"
                  fill="#ef4444"
                  name="ขาด"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. ส่วน "บัญชีหนังหมา" (Risk Table) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              🚨 บัญชีเฝ้าระวัง (Risk List)
            </h2>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
              {riskList.length} คน
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">ชื่อ - สกุล</th>
                  <th className="px-6 py-3">สถานะ</th>
                  <th className="px-6 py-3 text-center">ขาดสะสม</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {riskList.map((user) => (
                  <tr
                    key={user.id}
                    className={user.absence_score >= 2 ? "bg-red-50/50" : ""}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {user.nickname}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.name} ({user.role})
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.status === "Terminated"
                            ? "bg-black text-white"
                            : user.absence_score >= 2
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="font-bold text-lg text-gray-800">
                        {user.absence_score}/3
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-gray-400 hover:text-blue-500"
                        title="ดูเบอร์โทร"
                      >
                        <Phone size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {riskList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-400">
                      ยังไม่มีใครอยู่ในกลุ่มเสี่ยง 🎉
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. ส่วนเจาะลึกรายกิจกรรม (Activity Drill-down) */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            🔍 เจาะลึกรายกิจกรรม
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              เลือกกิจกรรมเพื่อตรวจสอบคนขาด/สาย
            </label>
            <select
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-camp-main"
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
            >
              <option value="">-- เลือกกิจกรรม --</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.name}
                </option>
              ))}
            </select>
          </div>

          {selectedActivityId && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-500">
                พบ {drillDownList.length} คน ที่มีปัญหาในกิจกรรมนี้
              </h3>
              {drillDownList.length === 0 ? (
                <div className="text-center py-6 bg-green-50 text-green-600 rounded-xl border border-green-100">
                  เยี่ยมมาก! ไม่มีใครขาดหรือสายในกิจกรรมนี้
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {drillDownList.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-bold text-gray-800">
                          {att.user?.nickname || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {att.user?.name}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          att.status === "Absent"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {att.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Internal Component: StatCard
function StatCard({ icon, label, value, sub, isDanger }) {
  return (
    <div
      className={`p-4 rounded-2xl border shadow-sm flex flex-col justify-between ${
        isDanger ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
        {sub && (
          <div
            className={`text-[10px] mt-1 ${
              isDanger ? "text-red-500 font-bold" : "text-gray-400"
            }`}
          >
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
