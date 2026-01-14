import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function useDashboardData() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    score: 0,
    lateLeaveCount: 0,
    quota: 3,
    status: "Active",
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Session Check
      const sessionStr = localStorage.getItem("camp_session");
      if (!sessionStr) {
        navigate("/login");
        return;
      }
      const sessionUser = JSON.parse(sessionStr);
      if (new Date().getTime() > sessionUser.expire) {
        localStorage.removeItem("camp_session");
        navigate("/login");
        return;
      }
      setUser(sessionUser);

      try {
        // 2. Fetch User Status & Score
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("absence_score, status")
          .eq("id", sessionUser.id)
          .single();
        if (userError) throw userError;

        // 3. Fetch History (Logs)
        const { data: logs, error: logError } = await supabase
          .from("attendance")
          .select(`status, check_in_time, note, activities ( name )`)
          .eq("user_id", sessionUser.id)
          .order("check_in_time", { ascending: false })
          .limit(5);
        if (logError) throw logError;

        // 4. Count Late/Leave
        const { count: lateLeaveCount, error: countError } = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("user_id", sessionUser.id)
          .in("status", ["Late", "Late_Over_Limit", "Leave"]);
        if (countError) throw countError;

        // Update State
        setStats({
          score: userData.absence_score || 0,
          quota: 3 - (userData.absence_score || 0),
          lateLeaveCount: lateLeaveCount || 0,
          status: userData.status,
        });
        setHistory(logs || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("camp_session");
    navigate("/login");
  };

  return { user, stats, history, loading, logout };
}
