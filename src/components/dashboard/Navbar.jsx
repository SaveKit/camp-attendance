import { LogOut } from "lucide-react";

export default function Navbar({ user, onLogout }) {
  if (!user) return null;
  return (
    <nav className="bg-camp-main text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {" "}
        {/* ปรับ max-w ให้กว้างขึ้น */}
        <div className="flex items-center justify-between h-16">
          <span className="font-bold text-lg tracking-wide">
            ค่ายเยาวชนต้นกล้า 18
          </span>

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="font-bold text-sm">
                {user.name || user.nickname}
              </div>
              <div className="text-xs text-green-100 opacity-90">
                {user.role || "Staff"}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition border border-white/10"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
