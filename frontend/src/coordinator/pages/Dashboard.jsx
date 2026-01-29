import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../../config/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0
  });
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const res = await fetch(`${API_URL}/api/bookings`, { headers });
        if (res.ok) {
          const data = await res.json();
          setAllBookings(data); // Save all bookings for chart

          const pending = data.filter(b => b.status === 'รอยืนยัน').length;
          const confirmed = data.filter(b => b.status === 'ยืนยันแล้ว').length;
          const processing = data.filter(b => b.status === 'กำลังดำเนินการ').length;

          setStats({
            total: data.length,
            pending,
            confirmed,
            processing
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate last 30 days data for chart
  const dailyChartData = useMemo(() => {
    const today = new Date();
    const last30Days = [];

    // Create array for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        total: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        completed: 0
      });
    }

    // Count bookings per day
    allBookings.forEach(booking => {
      const bookingDate = new Date(booking.booking_date).toISOString().split('T')[0];
      const dayData = last30Days.find(d => d.date === bookingDate);
      if (dayData) {
        dayData.total++;
        if (booking.status === 'รอยืนยัน') dayData.pending++;
        else if (booking.status === 'ยืนยันแล้ว') dayData.confirmed++;
        else if (booking.status === 'กำลังดำเนินการ') dayData.processing++;
        else if (booking.status === 'เสร็จสิ้น') dayData.completed++;
      }
    });

    return last30Days;
  }, [allBookings]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">แดชบอร์ดผู้ประสานงาน</h1>
          <p className="text-slate-500 text-sm">ภาพรวมงานที่ต้องตรวจสอบและดำเนินการ</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
          ข้อมูลล่าสุด: {new Date().toLocaleString('th-TH')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-yellow-400 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">รอยืนยัน</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.pending}</h3>
              <p className="text-xs text-slate-400 mt-1">รายการที่ต้องตรวจสอบ</p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">ยืนยันแล้ว</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.confirmed}</h3>
              <p className="text-xs text-slate-400 mt-1">รอการมอบหมายช่าง / เข้าหน้างาน</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-purple-500 transition-transform hover:scale-[1.02]">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">กำลังดำเนินการ</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.processing}</h3>
              <p className="text-xs text-slate-400 mt-1">งานที่อยู่ระหว่างการดำเนินงาน</p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 30 Days Trend Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">แนวโน้มงาน 30 วันล่าสุด</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={dailyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProcessing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A855F7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748B' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              formatter={(value, name) => {
                const names = { pending: 'รอยืนยัน', confirmed: 'ยืนยันแล้ว', processing: 'กำลังดำเนินการ', completed: 'เสร็จสิ้น' };
                return [`${value} รายการ`, names[name] || name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="pending" name="รอยืนยัน" stackId="1" stroke="#FBBF24" fill="url(#colorPending)" strokeWidth={2} />
            <Area type="monotone" dataKey="confirmed" name="ยืนยันแล้ว" stackId="1" stroke="#3B82F6" fill="url(#colorConfirmed)" strokeWidth={2} />
            <Area type="monotone" dataKey="processing" name="กำลังดำเนินการ" stackId="1" stroke="#A855F7" fill="url(#colorProcessing)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center py-16">
        <p className="text-slate-400 mb-4">เลือกเมนู "จัดการคิวงาน" เพื่อเริ่มตรวจสอบและมอบหมายงาน</p>
        <a href="/coordinator/queues" className="inline-block px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
          ไปที่หน้าจัดการคิว
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
