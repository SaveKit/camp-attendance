export default function StatusCard({ user, stats }) {
  return (
    <div
      className={`rounded-2xl p-6 text-white shadow-xl relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${
        stats.status === "Terminated"
          ? "from-red-600 to-red-800"
          : stats.score >= 2
          ? "from-orange-500 to-red-500"
          : "from-camp-main to-green-600"
      }`}
    >
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              สวัสดี, {user.nickname} 👋
            </h2>
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm text-xs font-medium">
              สถานะ: {stats.status}
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{stats.quota}</div>
            <div className="text-xs opacity-80">โควต้าเหลือ</div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-2 opacity-90">
            <span>ความเสี่ยงในการถูกปลด</span>
            <span>ขาด {stats.score}/3</span>
          </div>
          <div className="w-full bg-black/20 rounded-full h-2.5 backdrop-blur-sm mb-3">
            <div
              className={`h-2.5 rounded-full transition-all duration-1000 ${
                stats.status === "Terminated" ? "bg-red-200" : "bg-white"
              }`}
              style={{ width: `${Math.min((stats.score / 3) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-[10px] opacity-70">
              * ลา/สายเกิน 2 ครั้ง = ขาด 1 ครั้ง
            </p>
            <p className="text-xs font-bold bg-white/20 px-2 py-1 rounded">
              ลา/สาย: {stats.lateLeaveCount} ครั้ง
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
