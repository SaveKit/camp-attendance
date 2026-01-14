import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { hashPin } from "../utils/security";

export default function Login() {
  const [studentId, setStudentId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. ค้นหา User
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("student_id", studentId)
        .eq("status", "Active")
        .single();

      if (error || !user) {
        alert("ไม่พบรหัสนักศึกษา หรือคุณไม่มีสิทธิ์ใช้งาน");
        setLoading(false);
        return;
      }

      // 2. ตรวจสอบ PIN (เรียกใช้ฟังก์ชันจาก utils)
      const inputHash = await hashPin(pin);

      if (inputHash === user.pin_hash) {
        // Login สำเร็จ - เก็บ Session
        const session = {
          ...user,
          expire: new Date().getTime() + 3600000, // 1 ชั่วโมง
        };
        localStorage.setItem("camp_session", JSON.stringify(session));

        navigate("/dashboard");
      } else {
        alert("รหัส PIN ไม่ถูกต้อง");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute -top-12.5 -left-12.5 w-32 h-32 bg-camp-light rounded-full blur-xl opacity-70"></div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border-t-4 border-camp-main z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-camp-main mb-2">
            ค่ายเยาวชนต้นกล้า 19
          </h1>
          <p className="text-gray-500 text-sm">ระบบเช็คชื่อและจัดการทีมงาน</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
              รหัสนักศึกษา
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-camp-main focus:ring-2 focus:ring-camp-light transition"
              placeholder="6XXXXXXX"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
              PIN
            </label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-camp-main focus:ring-2 focus:ring-camp-light transition text-center tracking-[0.5em]"
              placeholder="••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-camp-main hover:bg-camp-dark text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-green-500/30 disabled:opacity-50"
          >
            {loading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
