import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useCreateActivity() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createdActivity, setCreatedActivity] = useState(null);

  // โหลดสถานที่
  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name")
        .order("name");
      if (!error) setLocations(data || []);
    };
    fetchLocations();
  }, []);

  // ฟังก์ชันสร้างกิจกรรม
  const createActivity = async (formData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("activities")
        .insert([
          {
            name: formData.name,
            location_id: formData.location_id,
            start_time: new Date(formData.start_time).toISOString(),
            end_time: new Date(formData.end_time).toISOString(),
            is_open: true,
            // ไม่ต้องใส่ secret_code เพราะ Database จะ gen ให้เองด้วย gen_random_uuid()
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setCreatedActivity(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => setCreatedActivity(null);

  return { locations, loading, createdActivity, createActivity, resetForm };
}
