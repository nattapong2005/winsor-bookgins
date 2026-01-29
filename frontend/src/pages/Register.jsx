import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import "./Register.css"; // Removed

function Register({ apiUrl }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          role: "USER" // Default role
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("ลงทะเบียนสำเร็จ! กรุณาเข้าสู่ระบบ");
        navigate("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-['Prompt'] px-4 py-12">
      <div className="w-full max-w-lg bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 animate-fade-in-up">
        <button onClick={() => navigate("/")} className="text-slate-400 hover:text-slate-600 transition-colors mb-6 text-2xl leading-none">&times;</button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">สร้างบัญชีใหม่</h2>
          <p className="text-slate-500 text-sm">สมัครสมาชิกเพื่อเริ่มต้นใช้งาน</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="ชื่อ-นามสกุล"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="เบอร์โทรศัพท์"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="text"
            name="username"
            placeholder="ชื่อผู้ใช้งาน (Username)"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="รหัสผ่าน"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="ยืนยันรหัสผ่าน"
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 mt-2">
            ลงทะเบียน
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
          มีบัญชีอยู่แล้ว?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
