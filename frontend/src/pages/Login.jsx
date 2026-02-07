import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showAlert } from "../components/Alert";
// import "./Auth.css"; // Removed

function Login({ onLoginSuccess, apiUrl }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: identifier, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);

        // Logic แยก Role ตามที่ขอ
        if (data.user.role === "ADMIN" || data.user.role === "TECHNICIAN" || data.user.role === "COORDINATOR") {
          // Admin/Staff Logic
          localStorage.setItem("isAdminLoggedIn", "true");
          localStorage.setItem("userRole", data.user.role);
          localStorage.setItem("fullName", data.user.full_name || data.user.name);

          onLoginSuccess(data.user); // Pass user data back to App

          if (data.user.role === "COORDINATOR") {
            navigate("/coordinator/dashboard");
          } else if (data.user.role === "TECHNICIAN") {
            navigate("/technician/dashboard");
          } else {
            navigate("/admin/dashboard");
          }

          showAlert("success", `ยินดีต้อนรับ ${data.user.full_name || data.user.name} (${data.user.role})`);
        } else if (data.user.role === "USER" || data.user.role === "CUSTOMER") {
          // User Logic
          localStorage.setItem("userData", JSON.stringify(data.user)); // Ensure userData is stored if needed by logic

          onLoginSuccess(data.user);
          navigate("/");
        } else {
          // Fallback
          showAlert("error", "Role ไม่ถูกต้อง หรือไม่มีสิทธิ์เข้าใช้งาน");
        }
      } else {
        showAlert("error", data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }
    } catch (err) {
      showAlert("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-['Prompt'] px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 animate-fade-in-up">
        {/* Close Button defaults to Home */}
        <button onClick={() => navigate("/")} className="text-slate-400 hover:text-slate-600 transition-colors mb-6 text-2xl leading-none">&times;</button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">เข้าสู่ระบบ</h2>
          <p className="text-slate-500 text-sm">ยินดีต้อนรับกลับมา, กรุณาล็อกอินเพื่อดำเนินการต่อ</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="เบอร์โทรศัพท์"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 mt-2">
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
          ยังไม่มีบัญชี?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
            ลงทะเบียน (สำหรับลูกค้า)
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;