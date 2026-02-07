import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { showAlert } from '../../components/Alert';

const QueueManagement = () => {
    const [bookings, setBookings] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setBookings(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchTechnicians = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/users?role=TECHNICIAN`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setTechnicians(await res.json());
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchBookings();
        fetchTechnicians();
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
                const updated = await res.json();
                setBookings(bookings.map(b => b.id === id ? { ...b, ...updated } : b));
                if (selectedBooking?.id === id) setSelectedBooking({ ...selectedBooking, ...updated });
            } else {
                showAlert('error', 'อัพเดทไม่สำเร็จ');
            }
        } catch (err) { showAlert('error', 'เกิดข้อผิดพลาด'); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'รอยืนยัน': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ยืนยันแล้ว': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'กำลังดำเนินการ': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'เสร็จสิ้น': return 'bg-green-100 text-green-800 border-green-200';
            case 'ยกเลิก': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filtered = bookings.filter(b => {
        const matchesStatus = filterStatus === 'ทั้งหมด' || b.status === filterStatus;
        const matchesSearch = b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.phone.includes(searchTerm) ||
            b.service_type.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800">จัดการคิวและมอบหมายงาน</h1>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-grow md:flex-grow-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="ค้นหา..."
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-64"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="ทั้งหมด">ทุกสถานะ</option>
                        <option value="รอยืนยัน">รอยืนยัน</option>
                        <option value="ยืนยันแล้ว">ยืนยันแล้ว</option>
                        <option value="กำลังดำเนินการ">กำลังดำเนินการ</option>
                        <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">วันที่/เวลา</th>
                                <th className="px-6 py-4">ลูกค้า</th>
                                <th className="px-6 py-4">ประเภทบริการ</th>
                                <th className="px-6 py-4">ช่างผู้รับผิดชอบ</th>
                                <th className="px-6 py-4">สถานะ</th>
                                <th className="px-6 py-4 text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-12 text-center text-slate-500">กำลังโหลด...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="p-12 text-center text-slate-500">ไม่พบข้อมูล</td></tr>
                            ) : filtered.map(booking => (
                                <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-700">{new Date(booking.booking_date).toLocaleDateString('th-TH')}</div>
                                        <div className="text-xs text-slate-400">{new Date(booking.booking_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{booking.customer_name}</div>
                                        <div className="text-xs text-slate-500">{booking.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {booking.service_type}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {booking.technician ? (
                                            <span className="flex items-center gap-1 text-slate-700">
                                                👷 {booking.technician.full_name}
                                                {booking.technician.expertise && <span className="text-[10px] text-slate-500 ml-1">[{booking.technician.expertise}]</span>}
                                            </span>
                                        ) : <span className="text-slate-400 italic">ยังไม่ระบุ</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedBooking(booking)}
                                            className="bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm"
                                        >
                                            จัดการ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">รายละเอียดงาน</h2>
                                <p className="text-xs text-slate-500 uppercase mt-1">Booking ID: {selectedBooking.id}</p>
                            </div>
                            <button onClick={() => setSelectedBooking(null)} className="text-2xl text-slate-400 hover:text-slate-600">&times;</button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 space-y-8">
                            <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100 space-y-4">
                                <h3 className="text-sm font-bold text-orange-800 uppercase tracking-widest flex items-center gap-2">
                                    ⚙️ ส่วนจัดการ (Coordinator)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">อัปเดตสถานะ</label>
                                        <select
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium shadow-sm"
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
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none bg-white font-medium shadow-sm"
                                            value={selectedBooking.technicianId || ''}
                                            onChange={(e) => updateBooking(selectedBooking.id, { technicianId: e.target.value || null })}
                                        >
                                            <option value="">-- เลือกช่าง --</option>
                                            {technicians.map(t => (
                                                <option key={t.id} value={t.id}>{t.full_name || t.username} {t.expertise ? `[${t.expertise}]` : ''} ({t.phone})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">ข้อมูลลูกค้า</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-slate-500 block text-xs mb-0.5">ชื่อลูกค้า</span> <span className="font-medium text-slate-800 text-base">{selectedBooking.customer_name}</span></p>
                                        <p><span className="text-slate-500 block text-xs mb-0.5">เบอร์โทรศัพท์</span> <span className="font-medium text-slate-800">{selectedBooking.phone}</span></p>
                                        <p><span className="text-slate-500 block text-xs mb-0.5">ประเภทบริการ</span> <span className="font-medium text-blue-600">{selectedBooking.service_type}</span></p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">นัดหมาย</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-slate-500 block text-xs mb-0.5">วันที่</span> <span className="font-medium text-slate-800">{new Date(selectedBooking.booking_date).toLocaleDateString('th-TH', { dateStyle: 'long' })}</span></p>
                                        <p><span className="text-slate-500 block text-xs mb-0.5">เวลา</span> <span className="font-medium text-slate-800">{new Date(selectedBooking.booking_date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">ที่อยู่ / รายละเอียด</h3>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700">
                                    <p className="leading-relaxed whitespace-pre-line">
                                        {selectedBooking.address_detail || '-'}
                                        <br />
                                        {`${selectedBooking.sub_district || ''} ${selectedBooking.district || ''} ${selectedBooking.province || ''} ${selectedBooking.postcode || ''}`}
                                    </p>
                                    {selectedBooking.notes && (
                                        <div className="mt-4 pt-4 border-t border-slate-200">
                                            <span className="text-xs font-bold text-slate-400 uppercase block mb-1">หมายเหตุ</span>
                                            <p className="italic text-slate-600">"{selectedBooking.notes}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedBooking.image_url && (
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">รูปภาพหน้างาน</h3>
                                    <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-100">
                                        <img
                                            src={selectedBooking.image_url}
                                            alt="หลักฐาน"
                                            className="w-full object-contain max-h-[300px]"
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Error+Loading+Image'; }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="px-6 py-2.5 bg-slate-800 text-white font-semibold text-sm rounded-lg hover:bg-slate-700 transition-all shadow-md"
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
