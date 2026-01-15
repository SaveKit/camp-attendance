import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, Save } from "lucide-react";
import { useCreateActivity } from "../../hooks/useCreateActivity"; // Import Hook

export default function CreateActivity() {
  const navigate = useNavigate();
  const { locations, loading, createdActivity, createActivity, resetForm } =
    useCreateActivity();

  const [formData, setFormData] = useState({
    name: "",
    location_id: "",
    start_time: "",
    end_time: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createActivity(formData);

    if (result.success) {
      alert("🎉 สร้างกิจกรรมเรียบร้อย!");
      navigate("/admin/manage-activities");
    } else {
      alert("เกิดข้อผิดพลาด: " + result.error);
    }
  };

  const handleReset = () => {
    resetForm();
    setFormData({ name: "", location_id: "", start_time: "", end_time: "" });
  };

  // --- UI Form สร้างกิจกรรม (ใช้ Logic จาก Hook) ---
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/admin/manage-activities")}
            className="p-2 -ml-2 hover:bg-white rounded-full transition text-gray-600"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2 text-gray-800">
            สร้างกิจกรรมใหม่
          </h1>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input ชื่อกิจกรรม */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                ชื่อกิจกรรม
              </label>
              <input
                type="text"
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-camp-main outline-none transition"
                placeholder="เช่น ประชุมรวมครั้งที่ 1"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Dropdown สถานที่ */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                <MapPin size={14} /> สถานที่
              </label>
              <select
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-camp-main outline-none transition appearance-none"
                value={formData.location_id}
                onChange={(e) =>
                  setFormData({ ...formData, location_id: e.target.value })
                }
              >
                <option value="">-- เลือกสถานที่ --</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1">
                * สถานที่จะกำหนดจุด GPS ที่เช็คชื่อได้
              </p>
            </div>

            {/* 3. เวลาเริ่ม-จบ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Calendar size={14} /> เริ่มเวลา
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-camp-main outline-none transition text-sm"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Clock size={14} /> สิ้นสุด
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-camp-main outline-none transition text-sm"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-camp-main hover:bg-camp-dark text-white font-bold rounded-xl shadow-lg shadow-green-200 transition active:scale-[0.98] mt-4 flex justify-center items-center gap-2"
            >
              {loading ? "⏳ กำลังบันทึก..." : "✅ สร้างกิจกรรม"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
