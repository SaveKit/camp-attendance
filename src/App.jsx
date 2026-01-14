import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'

// เดี๋ยวเราค่อยสร้าง Dashboard กันต่อ
const DashboardPlaceholder = () => <div className="p-10 text-center">หน้า Dashboard (กำลังสร้าง...)</div>

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
        
        {/* Redirect หน้าแรกไป Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
