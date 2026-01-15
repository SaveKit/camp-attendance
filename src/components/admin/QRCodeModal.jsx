import { X, Download } from "lucide-react";
import QRCode from "react-qr-code";

export default function QRCodeModal({ isOpen, onClose, activity }) {
  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {activity.name}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {activity.locations?.name || "ไม่ระบุสถานที่"}
        </p>

        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 inline-block mb-4">
          <QRCode value={activity.secret_code} size={200} level="H" />
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Secret Code: {activity.secret_code.slice(0, 8)}...
        </p>

        <button
          onClick={onClose}
          className="w-full py-2 bg-camp-main text-white rounded-xl font-bold hover:bg-camp-dark transition"
        >
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  );
}
