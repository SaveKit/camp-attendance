import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Palmtree,
} from "lucide-react";

export default function HistoryList({ history, loading }) {
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

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
        <Clock size={16} />
        ประวัติล่าสุด
      </h3>

      <div className="space-y-3">
        {loading ? (
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
          history.map((log, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
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
                    {new Date(log.check_in_time).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
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
          <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
            ยังไม่มีประวัติการเข้าร่วม
          </div>
        )}
      </div>
    </div>
  );
}
