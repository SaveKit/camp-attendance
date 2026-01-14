import { createClient } from '@supabase/supabase-js'

// 1. ไปที่ Supabase Dashboard -> Project Settings -> API
// 2. Copy "Project URL" และ "anon public key" มาใส่ตรงนี้

// ตรวจสอบว่ามี Key ครบไหม (กัน Error หน้างาน)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);