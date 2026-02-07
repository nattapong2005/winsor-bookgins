import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert, showConfirm } from "../components/Alert";

function MyBooking({ user, apiUrl }) {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("bookings");

    // We can just keep the user prop for display in sidebar
    const [userData, setUserData] = useState({
        full_name: "",
        phone: ""
    });

    useEffect(() => {
        if (user) {
            setUserData({
                full_name: user.full_name || "",
                phone: user.phone || ""
            });
        }
        fetchMyBookings();
    }, [user]);

    const fetchMyBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${apiUrl}/api/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        const confirm = await showConfirm("ยืนยันการยกเลิก", "คุณแน่ใจหรือไม่ที่จะยกเลิกการจองนี้?");
        if (!confirm.isConfirmed) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'ยกเลิก' })
            });

            if (res.ok) {
                showAlert("success", "ยกเลิกการจองเรียบร้อยแล้ว");
                fetchMyBookings();
            } else {
                const err = await res.json();
                showAlert("error", err.message || "ไม่สามารถยกเลิกได้");
            }
        } catch (err) {
            showAlert("error", "Error connecting to server");
        }
    };



    const handleLogout = () => {
        showConfirm("ยืนยันการออกจากระบบ", "คุณต้องการออกจากระบบใช่หรือไม่?").then((result) => {
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
                                    {userData.full_name.charAt(0) || "U"}
                                </div>
                                <h2 className="text-xl font-bold text-slate-800">{userData.full_name || "User"}</h2>
                                <p className="text-slate-500 text-sm">{userData.phone}</p>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={() => navigate("/my-booking")}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all bg-blue-600 text-white shadow-lg shadow-blue-200`}
                                >
                                    📅 การจองของฉัน
                                </button>
                                <button
                                    onClick={() => navigate("/profile")}
                                    className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all hover:bg-slate-50 text-slate-600`}
                                >
                                    ⚙️ แก้ไขข้อมูลส่วนตัว
                                </button>
                            </div>

                            <button onClick={handleLogout} className="w-full mt-6 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-medium transition-colors text-left border-t border-slate-100 pt-4">
                                🚪 ออกจากระบบ
                            </button>
                        </div>
                    </div>

                    {/* Bookings Content */}
                    <div className="w-full md:w-2/3">
                        <div className="space-y-6 animate-fade-in-up">
                            {bookings.length > 0 ? (
                                bookings.map((booking) => (
                                    <div key={booking.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 px-4 py-1.5 text-xs font-bold rounded-bl-xl
                                            ${booking.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'ยกเลิก' ? 'bg-red-100 text-red-700' :
                                                    booking.status === 'ยืนยันแล้ว' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {booking.status}
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl flex-shrink-0">
                                                🛠️
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800">{booking.service_type}</h4>
                                                <p className="text-slate-500 text-sm">
                                                    {new Date(booking.booking_date).toLocaleDateString('th-TH', {
                                                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pl-0 sm:pl-16 space-y-2 text-sm text-slate-600 mb-4">
                                            <p><span className="font-semibold text-slate-900">📍 สถานที่:</span> {booking.address_detail} {booking.sub_district} {booking.district} {booking.province} {booking.postcode}</p>
                                            {booking.notes && <p><span className="font-semibold text-slate-900">📝 หมายเหตุ:</span> {booking.notes}</p>}
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
                                            {booking.status !== 'ยกเลิก' && booking.status !== 'เสร็จสิ้น' && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking.id)}
                                                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors border border-red-100"
                                                >
                                                    ยกเลิกการจอง
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white p-10 rounded-3xl text-center border border-slate-100 shadow-sm">
                                    <div className="text-4xl mb-4">📅</div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">ยังไม่มีประวัติการจอง</h3>
                                    <p className="text-slate-400 mb-6">คุณยังไม่ได้ทำรายการจองคิวบริการ</p>
                                    <button onClick={() => navigate("/booking")} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full transition-all">ไปหน้าจองคิว</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyBooking;
