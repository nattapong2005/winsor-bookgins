import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../components/Alert";
// import "./CheckQueue.css"; // Removed

function CheckQueue({ apiUrl }) {
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch queues from backend
  const fetchQueues = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      const mappedData = Array.isArray(data) ? data.map(item => ({
        id: item.id,
        name: item.customer_name,
        service: item.service_type,
        date: item.booking_date, // Keep as ISO string for sorting
        status: item.status,
        phone: item.phone,
        address: item.address_detail, // basic address info
        bookingTime: new Date(item.booking_date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      })) : [];

      // Sort by date (newest first)
      mappedData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setQueues(mappedData);
    } catch (err) {
      console.error("Error fetching queues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/api/bookings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Update local state to reflect change immediately
        setQueues(queues.map(q => q.id === id ? { ...q, status: newStatus } : q));
      } else {
        showAlert("error", "อัปเดตสถานะไม่สำเร็จ");
      }
    } catch (err) {
      showAlert("error", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("fullName");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Prompt'] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">จัดการคิวงาน</h1>
            <p className="text-slate-500 mt-1">Dashboard สำหรับเจ้าหน้าที่</p>
          </div>
          <button onClick={handleLogout} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-slate-800 hover:text-white transition-all shadow-sm font-medium text-sm">
            ← ออกจากระบบ / กลับหน้าหลัก
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400 mr-3"></div>
            กำลังโหลดข้อมูล...
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-left">
                    <th className="py-4 px-6 font-semibold text-slate-700 w-[100px]">ID</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">ลูกค้า</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">บริการ</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">วัน-เวลานัด</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">อัปเดตสถานะ</th>
                    <th className="py-4 px-6 font-semibold text-slate-700 text-right">สถานะปัจจุบัน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queues.length > 0 ? queues.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-slate-500 font-mono text-sm">#{q.id}</td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{q.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{q.phone}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">{q.service}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 text-sm">
                        <div className="font-medium">{new Date(q.date).toLocaleDateString('th-TH')}</div>
                        <div className="text-slate-400">{q.bookingTime} น.</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          {q.status !== "ยืนยันแล้ว" && q.status !== "เสร็จสิ้น" && (
                            <button
                              onClick={() => updateStatus(q.id, "ยืนยันแล้ว")}
                              disabled={updatingId === q.id}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            >
                              ยืนยัน
                            </button>
                          )}
                          {q.status !== "เสร็จสิ้น" && (
                            <button
                              onClick={() => updateStatus(q.id, "เสร็จสิ้น")}
                              disabled={updatingId === q.id}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            >
                              เสร็จสิ้น
                            </button>
                          )}
                          {q.status !== "ยกเลิก" && q.status !== "เสร็จสิ้น" && (
                            <button
                              onClick={() => updateStatus(q.id, "ยกเลิก")}
                              disabled={updatingId === q.id}
                              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs rounded-lg transition-colors disabled:opacity-50"
                            >
                              ยกเลิก
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide
                          ${q.status === 'เสร็จสิ้น' ? 'bg-green-100 text-green-700' :
                            q.status === 'ยืนยันแล้ว' ? 'bg-blue-100 text-blue-700' :
                              q.status === 'ยกเลิก' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {q.status === 'เสร็จสิ้น' && <span className="mr-1">✓</span>}
                          {q.status || 'รอรับคิว'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-400">ไม่มีข้อมูลคิวงานในขณะนี้</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-sm text-slate-500 flex justify-between items-center">
              <div>ทั้งหมด {queues.length} รายการ</div>
              <div>อัปเดตล่าสุด: {new Date().toLocaleTimeString('th-TH')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckQueue;