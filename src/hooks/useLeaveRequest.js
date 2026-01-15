import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useLeaveRequest(userId) {
  const [activities, setActivities] = useState([]);
  const [history, setHistory] = useState([]); // ประวัติการลา
  const [loading, setLoading] = useState(true);

  // 1. ดึงกิจกรรมในอนาคตที่ยังไม่จบ และยังไม่ได้เช็คชื่อ
  const fetchInfo = async () => {
    try {
      // A. ดึงกิจกรรมที่ end_time ยังมาไม่ถึง
      const { data: actData, error: actError } = await supabase
        .from("activities")
        .select("id, name, start_time")
        .gt("end_time", new Date().toISOString()) // มากกว่าเวลาปัจจุบัน
        .order("start_time", { ascending: true });

      if (actError) throw actError;

      // B. ดึงประวัติการลาของ User คนนี้
      const { data: leaveData, error: leaveError } = await supabase
        .from("leave_requests")
        .select("*, activities(name)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (leaveError) throw leaveError;

      setActivities(actData || []);
      setHistory(leaveData || []);
    } catch (err) {
      console.error("Error loading leave data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchInfo();
  }, [userId]);

  // 2. ฟังก์ชันส่งใบลา
  const submitLeave = async (activityId, reason) => {
    try {
      const { error } = await supabase.from("leave_requests").insert({
        user_id: userId,
        activity_id: activityId,
        reason: reason,
      });

      if (error) {
        if (error.code === "23505")
          throw new Error("คุณได้ส่งคำขอลากิจกรรมนี้ไปแล้ว");
        throw error;
      }

      await fetchInfo(); // โหลดข้อมูลใหม่
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return { activities, history, loading, submitLeave };
}
