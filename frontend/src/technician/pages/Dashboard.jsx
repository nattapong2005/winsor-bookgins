import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';

const Dashboard = () => {
    const [myJobs, setMyJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Fetch user info first to get ID
    useEffect(() => {
        const fetchMe = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const user = await res.json();
                    setCurrentUser(user);
                    fetchMyJobs(user.id);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };
        fetchMe();
    }, []);

    const fetchMyJobs = async (userId) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const allBookings = await res.json();
                // Filter where technician matches current user
                const jobs = allBookings.filter(b => 
                    (b.technician && b.technician.id === userId) || 
                    (b.technicianId === userId)
                );
                // Sort by date ascending
                jobs.sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));
                setMyJobs(jobs);
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const updateJobStatus = async (id, status, notes) => {
        try {
            const token = localStorage.getItem('token');
            const payload = { status };
            if (notes) payload.notes = notes;

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
                setMyJobs(myJobs.map(j => j.id === id ? { ...j, ...updated } : j));
                if (selectedJob?.id === id) setSelectedJob(null); // Close modal
                alert('อัปเดตสถานะเรียบร้อย');
            } else {
                alert('อัปเดตไม่สำเร็จ');
            }
        } catch (err) { alert('เกิดข้อผิดพลาด'); }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'รอยืนยัน': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'ยืนยันแล้ว': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'กำลังดำเนินการ': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'เสร็จสิ้น': return 'bg-green-100 text-green-800 border-green-200';
            case 'ยกเลิก': return 'bg-red-100 text-red-800 border-red-200';
            case 'ไม่พบลูกค้า': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">งานของฉัน (Technician)</h1>
                    <p className="text-slate-500 text-sm">รายการงานที่ได้รับมอบหมาย</p>
                </div>
                <button 
                    onClick={() => currentUser && fetchMyJobs(currentUser.id)}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    🔄 รีเฟรช
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">วันที่/เวลา</th>
                                <th className="px-6 py-4">ลูกค้า</th>
                                <th className="px-6 py-4">สถานที่</th>
                                <th className="px-6 py-4">สถานะ</th>
                                <th className="px-6 py-4 text-right">ดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-12 text-center text-slate-500">กำลังโหลด...</td></tr>
                            ) : myJobs.length === 0 ? (
                                <tr><td colSpan="5" className="p-12 text-center text-slate-500">คุณยังไม่มีงานที่ได้รับมอบหมาย</td></tr>
                            ) : myJobs.map(job => (
                                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-700">{new Date(job.booking_date).toLocaleDateString('th-TH')}</div>
                                        <div className="text-xs text-slate-400">{new Date(job.booking_date).toLocaleTimeString('th-TH', {hour: '2-digit', minute:'2-digit'})} น.</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{job.customer_name}</div>
                                        <div className="text-xs text-slate-500">{job.phone}</div>
                                        <div className="text-xs text-blue-600 mt-1">{job.service_type}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                                        {job.address_detail} {job.sub_district}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(job.status)}`}>
                                            {job.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => setSelectedJob(job)}
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm"
                                        >
                                            รายละเอียด / อัปเดต
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Job Detail & Update Modal */}
            {selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 max-h-[90vh]">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-yellow-50/50">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">จัดการงาน #{selectedJob.id}</h2>
                                <p className="text-xs text-slate-500">สถานะปัจจุบัน: <span className={`font-bold ${getStatusColor(selectedJob.status).split(' ')[1]}`}>{selectedJob.status}</span></p>
                            </div>
                            <button onClick={() => setSelectedJob(null)} className="text-2xl text-slate-400 hover:text-slate-600">&times;</button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Actions Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => updateJobStatus(selectedJob.id, 'กำลังดำเนินการ')}
                                    className="p-3 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold transition-colors flex flex-col items-center gap-1"
                                >
                                    <span>🏃</span> เริ่มงาน
                                </button>
                                <button 
                                    onClick={() => updateJobStatus(selectedJob.id, 'เสร็จสิ้น')}
                                    className="p-3 rounded-xl border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 font-semibold transition-colors flex flex-col items-center gap-1"
                                >
                                    <span>✅</span> เสร็จสิ้น
                                </button>
                                <button 
                                    onClick={() => {
                                        const note = prompt("ระบุสาเหตุ (เช่น ไม่พบลูกค้า):", selectedJob.notes || "");
                                        if (note !== null) updateJobStatus(selectedJob.id, 'ไม่พบลูกค้า', note);
                                    }}
                                    className="p-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold transition-colors flex flex-col items-center gap-1"
                                >
                                    <span>🚫</span> ไม่พบลูกค้า
                                </button>
                                <button 
                                    onClick={() => {
                                        const note = prompt("ระบุสาเหตุ/วันที่ต้องการเลื่อน:", selectedJob.notes || "");
                                        if (note !== null) updateJobStatus(selectedJob.id, 'ยืนยันแล้ว', note);
                                    }}
                                    className="p-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors flex flex-col items-center gap-1"
                                >
                                    <span>📅</span> เลื่อนนัด
                                </button>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="space-y-2 text-sm">
                                    <h3 className="font-bold text-slate-700">ข้อมูลลูกค้า</h3>
                                    <p><strong>ชื่อ:</strong> {selectedJob.customer_name}</p>
                                    <p><strong>โทร:</strong> <a href={`tel:${selectedJob.phone}`} className="text-blue-600 hover:underline">{selectedJob.phone}</a></p>
                                    <p><strong>บริการ:</strong> {selectedJob.service_type}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <h3 className="font-bold text-slate-700">สถานที่</h3>
                                    <p className="text-slate-600 whitespace-pre-line">
                                        {selectedJob.address_detail} {selectedJob.sub_district} {selectedJob.district} {selectedJob.province} {selectedJob.postcode}
                                    </p>
                                    <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedJob.address_detail} ${selectedJob.sub_district} ${selectedJob.district} ${selectedJob.province}`)}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="inline-block mt-2 text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100"
                                    >
                                        📍 เปิดแผนที่ Google Maps
                                    </a>
                                </div>
                                {selectedJob.notes && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                        <strong>หมายเหตุ:</strong> <span className="text-slate-600 italic">{selectedJob.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
