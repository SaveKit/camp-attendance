export const checkIsAdmin = (user) => {
  if (!user) return false;
  // แก้ไขเงื่อนไข Admin ที่นี่ที่เดียว มีผลทั้งแอป
  return user.is_admin || user.role === "ประธานค่าย" || user.role === "ทะเบียน";
};
