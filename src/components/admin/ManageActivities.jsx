import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Layers } from "lucide-react";
import { useActivities } from "../../hooks/useActivities";
import ActivityCard from "./ActivityCard";
import QRCodeModal from "./QRCodeModal";

export default function ManageActivities() {
  const navigate = useNavigate();
  const { activities, loading, error } = useActivities();
  const [selectedActivity, setSelectedActivity] = useState(null); // สำหรับ Modal QR

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Layers size={20} className="text-camp-main" /> จัดการกิจกรรม
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* Create Button */}
        <button
          onClick={() => navigate("/admin/create-activity")}
          className="w-full py-4 bg-camp-main text-white rounded-2xl shadow-lg shadow-green-200 hover:bg-camp-dark transition flex items-center justify-center gap-2 font-bold active:scale-[0.98]"
        >
          <Plus size={24} /> สร้างกิจกรรมใหม่
        </button>

        {/* List Header */}
        <div className="flex justify-between items-end px-1 mt-6">
          <h2 className="text-sm font-bold text-gray-500">
            ประวัติกิจกรรมทั้งหมด
          </h2>
          <span className="text-xs text-gray-400">
            {activities.length} รายการ
          </span>
        </div>

        {/* Activity List */}
        <div className="space-y-3">
          {loading ? (
            // Skeleton Loading
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white h-24 rounded-xl animate-pulse"
              ></div>
            ))
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
              ยังไม่มีกิจกรรม
            </div>
          ) : (
            activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onShowQR={(act) => setSelectedActivity(act)} // เปิด Modal
              />
            ))
          )}
        </div>
      </div>

      {/* QR Modal */}
      <QRCodeModal
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        activity={selectedActivity}
      />
    </div>
  );
}
