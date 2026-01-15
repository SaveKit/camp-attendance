import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Send, FileText, History } from "lucide-react";
import { useLeaveRequest } from "../../hooks/useLeaveRequest";
import { formatDate } from "../../utils/date";

export default function LeaveRequest() {
  const navigate = useNavigate();
  // ดึง userId จาก session
  const sessionUser = JSON.parse(localStorage.getItem("camp_session") || "{}");
  const { activities, history, loading, submitLeave } = useLeaveRequest(
    sessionUser.id
  );

  const [formData, setFormData] = useState({ activity_id: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.activity_id) return alert("กรุณาเลือกกิจกรรม");

    setSubmitting(true);
    const result = await submitLeave(formData.activity_id, formData.reason);
    setSubmitting(false);

    if (result.success) {
      alert("บันทึกการลาเรียบร้อย");
      setFormData({ activity_id: "", reason: "" });
    } else {
      alert("เกิดข้อผิดพลาด: " + result.error);
    }
  };

  //   if (loading && activities.length === 0 && history.length === 0) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //         <div className="text-camp-main animate-pulse font-bold">
  //           กำลังโหลดข้อมูล...
  //         </div>
  //       </div>
  //     );
  //   }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">
            แจ้งลาเข้าร่วมกิจกรรม
          </h1>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Form Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-12 bg-gray-200 rounded-xl w-full"></div>

              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 mt-4"></div>
              <div className="h-24 bg-gray-200 rounded-xl w-full"></div>

              <div className="h-12 bg-gray-200 rounded-xl w-full mt-6"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  เลือกกิจกรรมที่ต้องการลา
                </label>
                <select
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-camp-main transition"
                  value={formData.activity_id}
                  onChange={(e) =>
                    setFormData({ ...formData, activity_id: e.target.value })
                  }
                >
                  <option value="">-- เลือกกิจกรรม --</option>
                  {activities.map((act) => (
                    <option key={act.id} value={act.id}>
                      {act.name} ({formatDate(act.start_time)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  เหตุผลการลา (บังคับระบุ)
                </label>
                <textarea
                  required
                  rows="3"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-camp-main transition"
                  placeholder="เช่น ติดเรียน, ป่วย, ธุระทางบ้าน..."
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={submitting || activities.length === 0}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <Send size={18} /> ส่งใบลา
              </button>
            </form>
          )}
        </div>

        {/* History Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
            <History size={16} /> ประวัติการลาของคุณ
          </h3>
          <div className="space-y-3">
            {loading ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse space-y-2"
                >
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))
            ) : history.length === 0 ? (
              <div className="text-center py-6 text-gray-400 bg-white rounded-xl border border-dashed text-sm">
                ยังไม่มีประวัติการลา
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-gray-800 text-sm">
                      {item.activities?.name}
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                      บันทึกแล้ว
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    เหตุผล: {item.reason}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
