import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  LogOut,
  ScanLine,
  FileText,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Palmtree,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ score: 0, lateLeaveCount: 0, quota: 3 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. โหลดข้อมูล Session และ User
  useEffect(() => {
    const fetchDashboardData = async () => {
      // ดึง Session จาก LocalStorage
      const sessionStr = localStorage.getItem("camp_session");
      if (!sessionStr) {
        navigate("/login");
        return;
      }

      const sessionUser = JSON.parse(sessionStr);
      // เช็ค Session หมดอายุ
      if (new Date().getTime() > sessionUser.expire) {
        localStorage.removeItem("camp_session");
        navigate("/login");
        return;
      }

      setUser(sessionUser);

      try {
        // --- ดึงข้อมูลล่าสุดจาก Supabase (Real-time Data) ---

        // 1. ดึง Score และ Status ล่าสุดจากตาราง Users
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("absence_score, status")
          .eq("id", sessionUser.id)
          .single();

        if (userError) throw userError;

        // 2. ดึงประวัติการเข้ากิจกรรม (5 รายการล่าสุด) พร้อมชื่อกิจกรรม
        const { data: logs, error: logError } = await supabase
          .from("attendance")
          .select(
            `
            status, 
            check_in_time, 
            note,
            activities ( name )
          `
          )
          .eq("user_id", sessionUser.id)
          .order("check_in_time", { ascending: false })
          .limit(5);

        if (logError) throw logError;

        // 3. นับจำนวนครั้งที่ ลา หรือ สาย (เพื่อโชว์ใน Card)
        // นับสถานะ Late, Late_Over_Limit, Leave
        const { count: lateLeaveCount, error: countError } = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true }) // count only
          .eq("user_id", sessionUser.id)
          .in("status", ["Late", "Late_Over_Limit", "Leave"]);

        if (countError) throw countError;

        // อัปเดต State
        setStats({
          score: userData.absence_score || 0,
          quota: 3 - (userData.absence_score || 0),
          lateLeaveCount: lateLeaveCount || 0,
          status: userData.status,
        });

        setHistory(logs || []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("camp_session");
    navigate("/login");
  };

  // --- Helper: เลือกสี Badge ตามสถานะ ---
  const getStatusBadge = (status) => {
    switch (status) {
      case "Present":
        return (
          <span className="px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle size={12} /> มาปกติ
          </span>
        );
      case "Late":
        return (
          <span className="px-2 py-1 rounded-md text-xs font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <Clock size={12} /> สาย
          </span>
        );
      case "Late_Over_Limit":
        return (
          <span className="px-2 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 flex items-center gap-1">
            <AlertTriangle size={12} /> สายเกิน
          </span>
        );
      case "Leave":
        return (
          <span className="px-2 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
            <Palmtree size={12} /> ลา
          </span>
        );
      case "Absent":
        return (
          <span className="px-2 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle size={12} /> ขาด
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600">
            {status}
          </span>
        );
    }
  };

  if (!user) return null; // หรือ Loading screen

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* 1. Navbar (ตามดีไซน์สีเขียว) */}
      <nav className="bg-camp-main text-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <span className="font-bold text-lg tracking-wide">Tonkla 19</span>

            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <div className="font-bold text-sm">
                  {user.nickname || user.name}
                </div>
                <div className="text-xs text-green-100 opacity-90">
                  {user.role || "Staff"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition border border-white/10"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* 2. Status Card (ไล่สี Gradient) */}
        <div
          className={`rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${
            stats.status === "Terminated"
              ? "from-red-600 to-red-800"
              : stats.score >= 2
              ? "from-orange-500 to-red-500"
              : "from-camp-main to-green-600"
          }`}
        >
          {/* Decorative Circles */}
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  สวัสดี, {user.nickname} 👋
                </h2>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm text-xs font-medium">
                  สถานะ: {stats.status}
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{stats.quota}</div>
                <div className="text-xs opacity-80">โควต้าเหลือ</div>
              </div>
            </div>

            {/* Progress Bar & Stats */}
            <div>
              <div className="flex justify-between text-xs mb-2 opacity-90">
                <span>ความเสี่ยงในการถูกปลด</span>
                <span>ขาด {stats.score}/3</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2.5 backdrop-blur-sm mb-3">
                <div
                  className={`h-2.5 rounded-full transition-all duration-1000 ${
                    stats.status === "Terminated" ? "bg-red-200" : "bg-white"
                  }`}
                  style={{
                    width: `${Math.min((stats.score / 3) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[10px] opacity-70">
                  * ลา/สายเกิน 2 ครั้ง = ขาด 1 ครั้ง
                </p>
                {/* เพิ่มส่วนแสดงจำนวนครั้งที่ลา/สาย ตามที่ขอ */}
                <p className="text-xs font-bold bg-white/20 px-2 py-1 rounded">
                  ลา/สาย: {stats.lateLeaveCount} ครั้ง
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Admin Panel (Conditional Rendering) */}
        {/* เช็คจาก is_admin (Boolean) หรือ role ก็ได้ */}
        {(user.is_admin ||
          user.role === "ประธานค่าย" ||
          user.role === "ทะเบียน") && (
          <div className="animate-fade-in">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-camp-main rounded-full"></span>
              เมนูผู้ดูแลระบบ
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-camp-main hover:shadow-md transition text-left group">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <FileText size={20} />
                </div>
                <div className="font-bold text-gray-800 text-sm">
                  สร้างกิจกรรม
                </div>
                <div className="text-[10px] text-gray-400">
                  สร้าง QR Code ใหม่
                </div>
              </button>
              <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-camp-main hover:shadow-md transition text-left group">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                  <BarChart3 size={20} />
                </div>
                <div className="font-bold text-gray-800 text-sm">รายงานผล</div>
                <div className="text-[10px] text-gray-400">ดูสถิติภาพรวม</div>
              </button>
            </div>
          </div>
        )}

        {/* 4. Main Menu (User Actions) */}
        <div>
          {/* Scan Button */}
          <button
            onClick={() => alert("ระบบสแกนจะอยู่ใน Step ถัดไปครับ!")}
            className="w-full bg-white p-4 rounded-2xl shadow-md border-l-4 border-blue-500 flex items-center justify-between hover:bg-blue-50 transition active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:rotate-12 transition duration-300">
                <ScanLine size={24} />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg text-gray-800">
                  สแกนเช็คชื่อ
                </div>
                <div className="text-xs text-gray-500">Check-in กิจกรรม</div>
              </div>
            </div>
          </button>
        </div>

        {/* 5. History List with Skeleton Loading */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Clock size={16} />
            ประวัติล่าสุด
          </h3>

          <div className="space-y-3">
            {loading ? (
              // --- Skeleton Loading State ---
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : history.length > 0 ? (
              // --- Real Data ---
              history.map((log, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {/* Icon based on status logic could go here, simplified for now */}
                      {log.status === "Present"
                        ? "✅"
                        : log.status === "Absent"
                        ? "❌"
                        : "⚠️"}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">
                        {log.activities?.name || "กิจกรรม"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.check_in_time).toLocaleTimeString(
                          "th-TH",
                          { hour: "2-digit", minute: "2-digit" }
                        )}{" "}
                        น.
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(log.status)}
                    {log.note && (
                      <div className="text-[10px] text-gray-400 mt-1">
                        {log.note}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              // --- Empty State ---
              <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                ยังไม่มีประวัติการเข้าร่วม
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
