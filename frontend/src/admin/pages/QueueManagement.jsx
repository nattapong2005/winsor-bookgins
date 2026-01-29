import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';

const QueueManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [technicians, setTechnicians] = useState([]); // State for technicians
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const token = localStorage.getItem('token');
            // Fetch users with role TECHNICIAN
            // Note: The controller expects role query param. Adjust case if needed.
            const res = await fetch(`${API_URL}/api/users?role=TECHNICIAN`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTechnicians(data);
            }
        } catch (err) {
            console.error("Error fetching technicians:", err);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchTechnicians(); // Fetch technicians on load
    }, []);

    const updateBooking = async (id, payload) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/bookings/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const updatedBooking = await res.json();
                // Update local state
                setBookings(bookings.map(b => b.id === id ? { ...b, ...updatedBooking } : b));
                if (selectedBooking && selectedBooking.id === id) {
                    setSelectedBooking({ ...selectedBooking, ...updatedBooking });
                }
            } else {
                alert('อัพเดทข้อมูลไม่สำเร็จ');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาด');
        }
    };

    const deleteBooking = async (id) => {
        if (!window.confirm('ยืนยันการลบข้อมูลการจองนี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/bookings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setBookings(bookings.filter(b => b.id !== id));
                setSelectedBooking(null);
            } else {
                alert('ลบไม่สำเร็จ');
            }
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการลบ');
        }
    };

    // ... helpers ...
    const getStatusColor = (status) => {
        // ... same ...
        switch (status) {
            case 'รอยืนยัน': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ยืนยันแล้ว': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'กำลังดำเนินการ': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'เสร็จสิ้น': return 'bg-green-100 text-green-800 border-green-200';
            case 'ยกเลิก': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredBookings = bookings.filter(b => {
        // ... same ...
        const matchesStatus = filterStatus === 'ทั้งหมด' || b.status === filterStatus;
        const matchesSearch = b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.phone.includes(searchTerm) ||
            b.service_type.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* ... Header and Search Bars same as before ... */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800">จัดการคิวและงานซ่อม</h1>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="ค้นหาชื่อ, เบอร์โทร, บริการ..."
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="ทั้งหมด">ทุกสถานะ</option>
                        <option value="รอยืนยัน">รอยืนยัน</option>
                        <option value="ยืนยันแล้ว">ยืนยันแล้ว</option>
                        <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                        <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                        <option value="ยกเลิก">ยกเลิก</option>
                    </select>
                    <button
                        onClick={() => { fetchBookings(); fetchTechnicians(); }}
                        className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        title="รีเฟรช"
                    >
                        🔄
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">วันที่/เวลา</th>
                                <th className="px-6 py-4">ลูกค้า</th>
                                <th className="px-6 py-4">ประเภทงาน</th>
                                <th className="px-6 py-4">ช่างผู้รับผิดชอบ</th>
                                <th className="px-6 py-4">สถานะ</th>
                                <th className="px-6 py-4 text-right">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span>กำลังโหลดข้อมูล...</span>
                                    </div>
                                </td></tr>
                            ) : filteredBookings.length === 0 ? (
                                <tr><td colSpan="6" className="p-12 text-center text-slate-500 italic">
                                    {searchTerm || filterStatus !== 'ทั้งหมด' ? 'ไม่พบข้อมูลที่ตรงกับการค้นหา' : 'ยังไม่มีข้อมูลการจอง'}
                                </td></tr>
                            ) : filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="text-sm font-medium">{new Date(booking.booking_date).toLocaleDateString('th-TH')}</div>
                                        <div className="text-xs text-slate-400">
                                            {new Date(booking.booking_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{booking.customer_name}</div>
                                        <div className="text-xs text-slate-500">{booking.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">{booking.service_type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">
                                            {booking.technician ? (
                                                <div className="flex items-center gap-1">
                                                    <span>👷</span> {booking.technician.full_name || booking.technician.username}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic text-xs">ยังไม่ระบุ</span>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setSelectedBooking(booking)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                title="ดูรายละเอียด"
                                            >
                                                👁️
                                            </button>
                                            <button
                                                onClick={() => deleteBooking(booking.id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                title="ลบ"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleUp">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">รายละเอียดและจัดการงาน</h2>
                                <p className="text-xs text-slate-500 uppercase font-semibold mt-1">ID: {selectedBooking.id}</p>
                            </div>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="text-2xl text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 space-y-8">
                            {/* Management Section (Assign & Status) */}
                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4">
                                <h3 className="text-sm font-bold text-blue-800 uppercase tracking-widest flex items-center gap-2">
                                    ⚙️ จัดการงาน
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">สถานะงาน</label>
                                        <select
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium shadow-sm"
                                            value={selectedBooking.status}
                                            onChange={(e) => updateBooking(selectedBooking.id, { status: e.target.value })}
                                        >
                                            <option value="รอยืนยัน">รอยืนยัน</option>
                                            <option value="ยืนยันแล้ว">ยืนยันแล้ว</option>
                                            <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                                            <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                                            <option value="ยกเลิก">ยกเลิก</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">มอบหมายช่าง</label>
                                        <select
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium shadow-sm"
                                            value={selectedBooking.technicianId || ""}
                                            onChange={(e) => updateBooking(selectedBooking.id, { technicianId: e.target.value || null })}
                                        >
                                            <option value="">-- เลือกช่าง --</option>
                                            {technicians.map(tech => (
                                                <option key={tech.id} value={tech.id}>
                                                    {tech.full_name || tech.username} {tech.phone ? `(${tech.phone})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Customer Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">ข้อมูลลูกค้า</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold uppercase">ชื่อลูกค้า</label>
                                            <p className="text-slate-800 font-medium">{selectedBooking.customer_name}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold uppercase">เบอร์โทรศัพท์</label>
                                            <p className="text-slate-800 font-medium">{selectedBooking.phone}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold uppercase">ประเภทบริการ</label>
                                            <p className="text-blue-600 font-bold">{selectedBooking.service_type}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Booking Details */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">นัดหมาย</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold uppercase">วันที่นัดหมาย</label>
                                            <p className="text-slate-800 font-medium">
                                                {new Date(selectedBooking.booking_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold uppercase">เวลา</label>
                                            <p className="text-slate-800 font-medium">
                                                {new Date(selectedBooking.booking_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Detail */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">ที่อยู่ / รายละเอียดเพิ่มเติม</h3>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                                        {selectedBooking.address_detail || 'ไม่ได้ระบุที่อยู่ละเอียด'}
                                        <br />
                                        {`${selectedBooking.sub_district || ''} ${selectedBooking.district || ''} ${selectedBooking.province || ''} ${selectedBooking.postcode || ''}`.trim()}
                                    </p>
                                    {selectedBooking.notes && (
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <label className="text-[10px] text-slate-400 font-bold uppercase">หมายเหตุ</label>
                                            <p className="text-slate-600 text-sm italic">"{selectedBooking.notes}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Image */}
                            {selectedBooking.image_url && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">รูปภาพประกอบ</h3>
                                    <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                        <img
                                            src={selectedBooking.image_url}
                                            alt="หลักฐานหรือหน้างาน"
                                            className="w-full object-cover max-h-64"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image'; }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between gap-4">
                            <button
                                onClick={() => deleteBooking(selectedBooking.id)}
                                className="px-4 py-2 text-red-600 font-semibold text-sm hover:bg-red-50 rounded-lg transition-colors"
                            >
                                ลบการจองนี้
                            </button>
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-6 py-2 bg-slate-800 text-white font-semibold text-sm rounded-lg hover:bg-slate-700 transition-all shadow-md"
                            >
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QueueManagement;
