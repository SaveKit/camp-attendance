import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, MapPin } from "lucide-react";
import { useCheckIn } from "../../hooks/useCheckIn";

export default function ScannerModal({ isOpen, onClose, userId, onRefresh }) {
  const [gps, setGps] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const { processCheckIn, processing } = useCheckIn();

  // 1. จัดการ GPS
  useEffect(() => {
    if (!isOpen) return;

    if (!navigator.geolocation) {
      setGpsError("เบราว์เซอร์ไม่รองรับ GPS");
      return;
    }

    // ขอพิกัด GPS แบบแม่นยำสูง
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(null);
      },
      (err) => setGpsError("ไม่สามารถจับสัญญาณ GPS ได้: " + err.message),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOpen]);

  // 2. จัดการกล้อง (Html5Qrcode)
  useEffect(() => {
    if (!isOpen) return;

    const html5QrCode = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    // เริ่มสแกน
    html5QrCode
      .start(
        { facingMode: "environment" }, // กล้องหลัง
        config,
        async (decodedText) => {
          // --- เมื่อสแกนเจอ QR ---
          await html5QrCode.pause(); // หยุดสแกนชั่วคราวกันเบิ้ล

          if (!gps) {
            alert("⚠️ กรุณารอสัญญาณ GPS ก่อนเช็คชื่อ");
            html5QrCode.resume();
            return;
          }

          // ส่งข้อมูลไปเช็คชื่อ
          const result = await processCheckIn(decodedText, gps, userId);

          if (result.success) {
            alert("🎉 " + result.message);
            onRefresh(); // สั่ง Dashboard ให้โหลดข้อมูลใหม่
            onClose(); // ปิดหน้าจอ
          } else {
            alert("❌ " + result.message);
            html5QrCode.resume(); // สแกนต่อ (ถ้าผิดพลาด)
          }
        },
        (errorMessage) => {
          // สแกนไม่เจอ (ไม่ต้องทำอะไร Log เยอะไปเดี๋ยวรก)
        }
      )
      .catch((err) => console.error("Camera Error", err));

    // Cleanup เมื่อปิด Modal
    return () => {
      html5QrCode
        .stop()
        .then(() => html5QrCode.clear())
        .catch(console.error);
    };
  }, [isOpen, gps, userId]); // Re-run ถ้า GPS มาแล้ว

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
        >
          <X size={24} />
        </button>

        <div className="p-6 text-center">
          <h3 className="font-bold text-xl mb-1 text-gray-800">สแกน QR Code</h3>
          <p className="text-sm text-gray-500 mb-4">
            ส่องไปที่ QR กิจกรรมเพื่อเช็คชื่อ
          </p>

          {/* พื้นที่กล้อง */}
          <div className="relative rounded-2xl overflow-hidden bg-black shadow-inner">
            <div id="reader" className="w-full h-75"></div>

            {/* Loading Overlay (ระหว่างประมวลผล) */}
            {processing && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20">
                <div className="text-camp-main font-bold animate-pulse">
                  ⏳ กำลังตรวจสอบข้อมูล...
                </div>
              </div>
            )}
          </div>

          {/* GPS Status Bar */}
          <div
            className={`mt-4 flex items-center justify-center gap-2 py-2 rounded-lg border text-xs font-medium ${
              gps
                ? "bg-green-50 border-green-200 text-green-700"
                : gpsError
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-gray-50 border-gray-100 text-gray-500 animate-pulse"
            }`}
          >
            <MapPin size={14} />
            {gps
              ? "จับพิกัด GPS ได้แล้ว พร้อมเช็คชื่อ"
              : gpsError
              ? gpsError
              : "กำลังค้นหาพิกัด GPS..."}
          </div>
        </div>
      </div>
    </div>
  );
}
