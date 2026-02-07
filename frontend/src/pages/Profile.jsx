import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert, showConfirm } from "../components/Alert";

function Profile({ user, apiUrl }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        email: "",
        address: ""
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || "",
                phone: user.phone || "",
                email: user.email || "",
                address: user.address || ""
            });
        }
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${apiUrl}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    full_name: data.full_name || "",
                    phone: data.phone || "",
                    email: data.email || "",
                    address: data.address || ""
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                showAlert('success', 'บันทึกข้อมูลเรียบร้อยแล้ว');
                fetchProfile();
            } else {
                const err = await res.json();
                showAlert('error', err.message || 'บันทึกไม่สำเร็จ');
            }
        } catch (err) {
            showAlert('error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        }
    };

    const handleLogout = () => {
        showConfirm("ยืนยันการออกจากระบบ", "ยืนยันการออกจากระบบ?").then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                window.location.href = "/";
            }
        });
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-slate-50 font-['Prompt'] px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-6 items-start">

                    {/* Sidebar */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 font-bold">
                                    {formData.full_name.charAt(0) || "U"}
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">{formData.full_name || "User"}</h2>
                                {/* <p className="text-slate-500 text-sm">{formData.phone}</p> */}
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate("/my-booking")}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all hover:bg-slate-50 text-slate-600`}
                                >
                                    📅 การจองของฉัน
                                </button>
                                <button
                                    onClick={() => navigate("/profile")}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all bg-blue-600 text-white shadow-lg shadow-blue-200`}
                                >
                                    ⚙️ แก้ไขข้อมูลส่วนตัว
                                </button>
                            </div>

                            <button onClick={handleLogout} className="w-full mt-6 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-medium transition-colors text-left border-t border-slate-100 pt-4">
                                🚪 ออกจากระบบ
                            </button>
                        </div>
                    </div>

                    {/* Profile Content */}
                    <div className="w-full md:w-2/3">
                        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-slate-800 mb-6">แก้ไขข้อมูลส่วนตัว</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">ชื่อ-นามสกุล</label>
                                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">เบอร์โทรศัพท์</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">อีเมล</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700 ml-1">ที่อยู่</label>
                                    <textarea name="address" value={formData.address} onChange={handleChange} className="w-full px-5 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[100px]" />
                                </div>
                                <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all mt-4">บันทึกการเปลี่ยนแปลง</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
