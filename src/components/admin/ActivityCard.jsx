import { QrCode, MapPin, Calendar, Clock } from "lucide-react";

export default function ActivityCard({ activity, onShowQR }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOpen = activity.is_open; // หรือจะเช็คเวลา end_time ก็ได้ตาม logic ที่คุยกัน

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition">
      <div className="flex-1 min-w-0">
        {" "}
        {/* min-w-0 ช่วยให้ text-truncate ทำงาน */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-800 truncate">{activity.name}</h3>
          {isOpen ? (
            <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-700 font-bold">
              Open
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-500 font-bold">
              Closed
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1">
            <MapPin size={12} /> {activity.locations?.name || "-"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} /> {formatDate(activity.start_time)}
            <span className="mx-1">|</span>
            <Clock size={12} /> {formatTime(activity.start_time)} -{" "}
            {formatTime(activity.end_time)}
          </div>
        </div>
      </div>

      {/* ปุ่มกดดู QR Code */}
      <button
        onClick={() => onShowQR(activity)}
        className="ml-4 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition active:scale-95 flex flex-col items-center gap-1"
      >
        <QrCode size={20} />
        <span className="text-[10px] font-bold">QR</span>
      </button>
    </div>
  );
}
