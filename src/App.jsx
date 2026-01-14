import { useState } from "react";
import "./App.css";

function App() {
  return (
    <div className="flex h-screen items-center justify-center bg-[var(--color-camp-light)]">
      <div className="p-8 rounded-2xl shadow-xl bg-white text-center border-t-4 border-[var(--color-camp-main)]">
        <h1 className="text-3xl font-bold text-[var(--color-camp-main)] mb-2">
          ทดสอบธีมสี
        </h1>

        <p className="text-[var(--color-camp-dark)] mb-6">
          สวัสดีครับ นี่คือสีเขียวแบบ Custom Theme ของค่ายต้นกล้า
        </p>

        <button className="px-6 py-2 rounded-lg bg-[var(--color-camp-main)] text-white hover:bg-[var(--color-camp-dark)] transition">
          ปุ่มสีธีมค่าย
        </button>

        <div className="mt-4 p-4 bg-[var(--color-camp-light)] rounded-lg text-[var(--color-camp-dark)]">
          กล่องข้อความสีอ่อน (camp-light)
        </div>
      </div>
    </div>
  );
}

export default App;
