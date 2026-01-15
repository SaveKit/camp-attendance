import { Layers, BarChart3, ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ActionMenu({ user, onScan }) {
  const navigate = useNavigate();
  const isAdmin =
    user.is_admin || user.role === "ประธานค่าย" || user.role === "ทะเบียน";

  return (
    <div className="space-y-6">
      {/* Admin Section */}
      {isAdmin && (
        <div className="animate-fade-in">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-camp-main rounded-full"></span>
            เมนูผู้ดูแลระบบ
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* ปุ่มสร้างกิจกรรม */}
            <button
              onClick={() => navigate("/admin/manage-activities")}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-camp-main hover:shadow-md transition text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition">
                <Layers size={20} />
              </div>
              <div className="font-bold text-gray-800 text-sm">
                จัดการกิจกรรม
              </div>
              <div className="text-[10px] text-gray-400">
                สร้าง / ดูประวัติ / QR Code
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

      {/* User Section */}
      <div>
        <button
          onClick={onScan}
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
    </div>
  );
}
