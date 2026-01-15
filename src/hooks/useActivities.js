import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      // ดึงกิจกรรมทั้งหมด เรียงจาก สร้างล่าสุด -> เก่าสุด
      // join กับ locations เพื่อเอาชื่อสถานที่มาโชว์ด้วย
      const { data, error } = await supabase
        .from("activities")
        .select(
          `
          *,
          locations ( name )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // โหลดข้อมูลครั้งแรกทันที
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, error, refreshActivities: fetchActivities };
}
