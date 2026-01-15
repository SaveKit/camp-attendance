import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { getDistanceInMeters } from "../utils/location";

export function useCheckIn() {
  const [processing, setProcessing] = useState(false);

  const processCheckIn = useCallback(
    async (qrContent, userLocation, userId) => {
      setProcessing(true);
      try {
        // 1. ดึงข้อมูลกิจกรรมจาก Supabase (รวมถึงพิกัดสถานที่ location ด้วย)
        // ใช้ qrContent (ที่เป็น UUID string) ไปค้นหาโดยตรง
        // ค้นหากิจกรรมจาก secret_code แทน ID
        const { data: activity, error: actError } = await supabase
          .from("activities")
          .select(
            `
          *,
          locations ( lat, lng, radius_meters )
        `
          )
          .eq("secret_code", qrContent)
          .single();

        if (actError || !activity)
          throw new Error("QR Code ไม่ถูกต้อง หรือไม่พบกิจกรรมนี้");
        if (!activity.is_open) throw new Error("กิจกรรมนี้ปิดการเช็คชื่อแล้ว");

        // 2. ตรวจสอบ GPS (Geofencing)
        if (!activity.locations) throw new Error("กิจกรรมนี้ไม่ได้ระบุสถานที่");

        const distance = getDistanceInMeters(
          userLocation.lat,
          userLocation.lng,
          activity.locations.lat,
          activity.locations.lng
        );

        // ถ้าระยะห่าง มากกว่า รัศมีที่ตั้งไว้
        if (distance > activity.locations.radius_meters) {
          throw new Error(
            `คุณอยู่นอกพื้นที่กิจกรรม (${Math.round(
              distance
            )} ม.) กรุณาขยับเข้าไปใกล้จุดเช็คชื่อ`
          );
        }

        // 3. คำนวณสถานะ (มาทัน/สาย)
        const now = new Date();
        const startTime = new Date(activity.start_time);
        const diffMinutes = (now - startTime) / 1000 / 60;

        let status = "Present";
        let note = "ตรงเวลา";

        if (diffMinutes > 90) {
          status = "Late_Over_Limit";
          note = "สายเกิน 90 นาที";
        } else if (diffMinutes > 15) {
          status = "Late";
          note = "สายกว่า 15 นาที";
        }

        // 4. บันทึกลงตาราง attendance
        const { error: insertError } = await supabase
          .from("attendance")
          .insert({
            activity_id: activity.id,
            user_id: userId,
            status: status,
            gps_distance: distance,
            note: note,
            check_in_time: new Date().toISOString(), // บันทึกเวลาปัจจุบัน
          });

        if (insertError) {
          // เช็ค Error code 23505 คือ Unique violation (เช็คชื่อซ้ำ)
          if (insertError.code === "23505")
            throw new Error("คุณเช็คชื่อกิจกรรมนี้ไปแล้ว");
          throw insertError;
        }

        return {
          success: true,
          message: `เช็คชื่อสำเร็จ! สถานะ: ${status}`,
          status,
        };
      } catch (error) {
        return { success: false, message: error.message };
      } finally {
        setProcessing(false);
      }
    },
    []
  ); // dependency ว่าง [] เพราะ supabase และ getDistanceInMeters เป็น external/static

  return { processCheckIn, processing };
}
