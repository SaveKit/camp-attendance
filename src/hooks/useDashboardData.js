import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function useDashboardData() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ score: 0, lateLeaveCount: 0, quota: 3, status: 'Active' });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. สร้างฟังก์ชันดึงข้อมูล (ใช้ useCallback เพื่อไม่ให้สร้างฟังก์ชันใหม่พร่ำเพรื่อ)
  const fetchDashboardData = useCallback(async () => {
    const sessionStr = localStorage.getItem('camp_session');
    if (!sessionStr) {
      navigate('/login');
      return;
    }
    const sessionUser = JSON.parse(sessionStr);
    
    // เช็ค Session หมดอายุ
    if (new Date().getTime() > sessionUser.expire) {
      localStorage.removeItem('camp_session');
      navigate('/login');
      return;
    }

    // ถ้ายังไม่มี User ใน State ให้เซ็ตค่าก่อน
    // (เราใช้ functional update เพื่อเช็คค่าปัจจุบัน)
    setUser(prev => prev ? prev : sessionUser);

    try {
      // A. ดึง Score/Status ล่าสุด
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('absence_score, status')
        .eq('id', sessionUser.id)
        .single();
      if (userError) throw userError;

      // B. ดึงประวัติ 5 รายการล่าสุด
      const { data: logs, error: logError } = await supabase
        .from('attendance')
        .select(`status, check_in_time, note, activities ( name )`)
        .eq('user_id', sessionUser.id)
        .order('check_in_time', { ascending: false })
        .limit(5);
      if (logError) throw logError;

      // C. นับจำนวนครั้งที่สาย/ลา
      const { count: lateLeaveCount, error: countError } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', sessionUser.id)
        .in('status', ['Late', 'Late_Over_Limit', 'Leave']);
      if (countError) throw countError;

      // อัปเดต State
      setStats({
        score: userData.absence_score || 0,
        quota: 3 - (userData.absence_score || 0),
        lateLeaveCount: lateLeaveCount || 0,
        status: userData.status
      });
      setHistory(logs || []);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // 2. เรียกใช้ฟังก์ชันตอนโหลดหน้าครั้งแรก
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const logout = () => {
    localStorage.removeItem('camp_session');
    navigate('/login');
  };

  // ส่ง fetchDashboardData ออกไปให้คนอื่นใช้ด้วย
  return { user, stats, history, loading, logout, fetchDashboardData };
}