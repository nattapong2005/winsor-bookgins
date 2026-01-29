import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import "./App.css"; // Removed custom CSS
import BookingPage from "./components/BookingPage";
import CheckQueue from "./pages/CheckQueue";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MyBooking from "./pages/MyBooking";
import Home from "./pages/Home";
import AdminLayout from "./admin/layouts/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import UserManagement from "./admin/pages/UserManagement";
import QueueManagement from "./admin/pages/QueueManagement";
import CoordinatorLayout from "./coordinator/layouts/CoordinatorLayout";
import CoordinatorDashboard from "./coordinator/pages/Dashboard";
import CoordinatorQueueManagement from "./coordinator/pages/QueueManagement";
import TechnicianLayout from "./technician/layouts/TechnicianLayout";
import TechnicianDashboard from "./technician/pages/Dashboard";
import { Navigate } from "react-router-dom";
import { Outlet } from "react-router-dom";

// --- ปรับปรุงส่วนการดึง URL ให้รองรับ Vercel ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function UserLayout({ isLoggedIn, isUserLoggedIn, userData, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="fixed top-0 left-0 w-full h-20 bg-white/85 backdrop-blur-md flex justify-between items-center px-6 lg:px-12 z-[1000] border-b border-slate-100 transition-all">
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate("/")}>
          <div className="text-2xl font-bold text-slate-800 tracking-tight">VINYL<span className="text-blue-500">HOUSE</span></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex gap-8 items-center">
            <button onClick={() => navigate("/")} className={`text-[15px] font-medium transition-colors ${location.pathname === "/" ? "text-slate-900 border-b-2 border-blue-500 pb-0.5" : "text-slate-500 hover:text-slate-900"}`}>หน้าหลัก</button>
            <button onClick={() => navigate("/booking")} className={`text-[15px] font-medium transition-colors ${location.pathname === "/booking" ? "text-slate-900 border-b-2 border-blue-500 pb-0.5" : "text-slate-500 hover:text-slate-900"}`}>จองคิว</button>
            {(isUserLoggedIn) && (
              <button onClick={() => navigate("/my-booking")} className={`text-[15px] font-medium transition-colors ${location.pathname === "/my-booking" ? "text-slate-900 border-b-2 border-blue-500 pb-0.5" : "text-slate-500 hover:text-slate-900"}`}>การจองของฉัน</button>
            )}
          </div>

          {isUserLoggedIn ? (
            <div className="flex items-center gap-4">
              <span
                className="text-[15px] font-medium text-slate-700 cursor-pointer hover:underline hidden lg:block"
                onClick={() => navigate("/profile")}
              >
                สวัสดี, {userData?.full_name || userData?.name}
              </span>
              <button onClick={handleLogout} className="text-red-500 font-medium hover:text-red-600 text-sm">ออกจากระบบ</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/login")} className="bg-slate-800 hover:bg-blue-600 text-white px-5 py-2 rounded-full font-semibold text-sm transition-all shadow-sm">เข้าสู่ระบบ</button>
            </div>
          )}
        </div>
      </nav>
      <div className="flex-grow pt-20">
        <Outlet />
      </div>
    </div>
  );
}


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem("isAdminLoggedIn") === "true"); // สำหรับ Admin
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => localStorage.getItem("isUserLoggedIn") === "true"); // สำหรับ User
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("userData");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogout = () => {
    if (window.confirm("ยืนยันการออกจากระบบ?")) {
      localStorage.clear();
      setIsLoggedIn(false);
      setIsUserLoggedIn(false);
      setUserData(null);
      window.location.href = "/";
    }
  };

  const handleLoginSuccess = (user) => {
    if (user.role === 'ADMIN' || user.role === 'STAFF' || user.role === 'COORDINATOR' || user.role === 'TECHNICIAN') {
      setIsLoggedIn(true);
    } else {
      setIsUserLoggedIn(true);
      setUserData(user);
      // Note: LocalStorage is already set in Login.jsx for consistency and immediate checking
      localStorage.setItem("isUserLoggedIn", "true");
      localStorage.setItem("userData", JSON.stringify(user));
    }
  };

  return (
    <Router>
      <div className="w-full min-h-screen flex flex-col bg-white font-['Prompt']">
        <Routes>
          {/* Admin Routes - Completely separate layout */}
          <Route path="/admin" element={isLoggedIn ? <AdminLayout handleLogout={handleLogout} /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="queues" element={<QueueManagement />} />
          </Route>

          {/* Coordinator Routes */}
          <Route path="/coordinator" element={isLoggedIn ? <CoordinatorLayout handleLogout={handleLogout} /> : <Navigate to="/login" />}>
            <Route index element={<Navigate to="/coordinator/dashboard" replace />} />
            <Route path="dashboard" element={<CoordinatorDashboard />} />
            <Route path="queues" element={<CoordinatorQueueManagement />} />
          </Route>

          {/* Technician Routes */}
          <Route path="/technician" element={isLoggedIn ? <TechnicianLayout handleLogout={handleLogout} /> : <Navigate to="/login" />}>
             <Route index element={<Navigate to="/technician/dashboard" replace />} />
             <Route path="dashboard" element={<TechnicianDashboard />} />
          </Route>

          {/* User Routes - Wrapped in UserLayout */}
          <Route element={<UserLayout isLoggedIn={isLoggedIn} isUserLoggedIn={isUserLoggedIn} userData={userData} handleLogout={handleLogout} />}>
            <Route path="/" element={<Home apiUrl={API_URL} />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} apiUrl={API_URL} />} />
            <Route path="/register" element={<Register apiUrl={API_URL} />} />
            <Route path="/login-user" element={<Login onLoginSuccess={handleLoginSuccess} apiUrl={API_URL} />} />
            <Route path="/login-admin" element={<Login onLoginSuccess={handleLoginSuccess} apiUrl={API_URL} />} />

            <Route
              path="/booking"
              element={
                isUserLoggedIn ?
                  <BookingPage apiUrl={API_URL} /> :
                  <Login onLoginSuccess={handleLoginSuccess} apiUrl={API_URL} />
              }
            />
            <Route
              path="/check-queue"
              element={<CheckQueue apiUrl={API_URL} />}
            />
            <Route
              path="/profile"
              element={
                isUserLoggedIn ?
                  <Profile user={userData} onLogout={handleLogout} apiUrl={API_URL} /> :
                  <Login onLoginSuccess={handleLoginSuccess} apiUrl={API_URL} />
              }
            />
            <Route
              path="/my-booking"
              element={
                isUserLoggedIn ?
                  <MyBooking user={userData} onLogout={handleLogout} apiUrl={API_URL} /> :
                  <Login onLoginSuccess={handleLoginSuccess} apiUrl={API_URL} />
              }
            />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;