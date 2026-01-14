/**
 * ฟังก์ชันสำหรับ Hash PIN ด้วย SHA-256
 * @param {string} pin - PIN ที่ผู้ใช้กรอก
 * @returns {Promise<string>} - PIN ที่ถูก Hash แล้ว (Hex string)
 */
export const hashPin = async (pin) => {
    if (!pin) return '';
    
    // แปลงข้อความให้เป็น Buffer
    const encoder = new TextEncoder();
    const data = encoder.encode(pin);
    
    // Hash ด้วย SHA-256 (มาตรฐาน Web Crypto API)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // แปลง Buffer เป็น Hex String
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};