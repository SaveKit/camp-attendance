import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useReportStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeCount: 0,
    terminatedCount: 0,
    dangerZoneCount: 0,
    avgAttendance: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [riskList, setRiskList] = useState([]);
  const [activities, setActivities] = useState([]);
  const [allAttendance, setAllAttendance] = useState([]); // สำหรับ Drill-down

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. ดึงข้อมูล Users (เพื่อนับจำนวนและหาคนเสี่ยง)
        const { data: users } = await supabase
          .from("users")
          .select("*")
          .order("absence_score", { ascending: false }); // เรียงคนขาดเยอะขึ้นก่อน

        // 2. ดึงข้อมูล Activities (เพื่อทำแกน X ของกราฟ)
        const { data: acts } = await supabase
          .from("activities")
          .select("*")
          .order("start_time", { ascending: true });

        // 3. ดึงข้อมูล Attendance ทั้งหมด (เพื่อคำนวณกราฟ)
        const { data: atts } = await supabase.from("attendance").select("*");

        if (users && acts && atts) {
          processStats(users, acts, atts);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ฟังก์ชันคำนวณตัวเลขต่างๆ (แยก Logic ออกมา)
  const processStats = (users, acts, atts) => {
    // --- A. Overview Cards ---
    const activeUsers = users.filter((u) => u.status === "Active");
    const terminatedUsers = users.filter((u) => u.status === "Terminated");
    // Danger Zone: Active และ ขาดไปแล้ว >= 2 คะแนน (เหลือโควตา <= 1)
    const dangerUsers = activeUsers.filter((u) => u.absence_score >= 2);

    // คำนวณ % การเข้าร่วมเฉลี่ย
    // สูตร: (จำนวนคนมา / (จำนวนกิจกรรม * จำนวนคน)) * 100
    // หรือคิดง่ายๆ: (จำนวน record ที่ไม่ใช่ Absent / record ทั้งหมดที่ควรมี)
    const totalPossibleCheckins = acts.length * activeUsers.length;
    const presentCount = atts.filter(
      (a) => a.status === "Present" || a.status === "Late"
    ).length;
    const avgRate =
      totalPossibleCheckins > 0
        ? Math.round((presentCount / totalPossibleCheckins) * 100)
        : 0;

    setStats({
      totalStaff: users.length,
      activeCount: activeUsers.length,
      terminatedCount: terminatedUsers.length,
      dangerZoneCount: dangerUsers.length,
      avgAttendance: avgRate,
    });

    // --- B. Chart Data ---
    // แปลงข้อมูลกิจกรรม ให้เป็น format ของ Recharts
    const chart = acts.map((act) => {
      // นับจำนวนแต่ละสถานะในกิจกรรมนี้
      const logs = atts.filter((a) => a.activity_id === act.id);
      return {
        name: act.name,
        date: new Date(act.start_time).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        Present: logs.filter((a) => a.status === "Present").length,
        Late: logs.filter(
          (a) => a.status === "Late" || a.status === "Late_Over_Limit"
        ).length,
        Absent: logs.filter((a) => a.status === "Absent").length,
        Leave: logs.filter((a) => a.status === "Leave").length,
      };
    });
    setChartData(chart);

    // --- C. Risk List (บัญชีหนังหมา) ---
    // เอาเฉพาะคนที่มีคะแนนการขาด > 0
    setRiskList(users.filter((u) => u.absence_score > 0));

    // --- D. For Drill-down ---
    setActivities(acts);
    // Join ข้อมูล User เข้าไปใน Attendance เพื่อให้แสดงชื่อได้
    const enrichedAttendance = atts.map((a) => {
      const u = users.find((user) => user.id === a.user_id);
      return { ...a, user: u };
    });
    setAllAttendance(enrichedAttendance);
  };

  return { loading, stats, chartData, riskList, activities, allAttendance };
}
