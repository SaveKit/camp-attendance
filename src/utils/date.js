// แปลงวันที่เป็น "15 ม.ค."
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
};

// แปลงเวลาเป็น "09:30"
export const formatTime = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
