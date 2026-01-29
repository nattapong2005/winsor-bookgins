import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, byStatus: [] });
  const [allBookings, setAllBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [statsRes, bookingsRes] = await Promise.all([
          fetch(`${API_URL}/api/bookings/stats`, { headers }),
          fetch(`${API_URL}/api/bookings`, { headers })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setAllBookings(bookingsData);
          setRecentBookings(bookingsData.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
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
        รอยืนยัน: 0,
        ยืนยันแล้ว: 0,
        เสร็จสิ้น: 0,
        ยกเลิก: 0
      });
    }

    // Count bookings per day
    allBookings.forEach(booking => {
      const bookingDate = new Date(booking.booking_date).toISOString().split('T')[0];
      const dayData = last30Days.find(d => d.date === bookingDate);
      if (dayData) {
        dayData.total++;
        if (dayData[booking.status] !== undefined) {
          dayData[booking.status]++;
        }
      }
    });

    return last30Days;
  }, [allBookings]);

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

  const CHART_COLORS = {
    'รอยืนยัน': '#FBBF24',
    'ยืนยันแล้ว': '#3B82F6',
    'กำลังดำเนินการ': '#A855F7',
    'เสร็จสิ้น': '#22C55E',
    'ยกเลิก': '#EF4444',
    'total': '#6366F1'
  };

  const pieChartData = stats.byStatus?.map(item => ({
    name: item.status,
    value: item._count?.status || 0,
    color: CHART_COLORS[item.status] || '#94A3B8'
  })) || [];

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">แดชบอร์ดภาพรวม</h1>
          <p className="text-slate-500 text-sm">ยินดีต้อนรับเข้าสู่ระบบจัดการข้อมูลการจอง</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
          ข้อมูลล่าสุด: {new Date().toLocaleString('th-TH')}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center transition-transform hover:scale-[1.02]">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">การจองทั้งหมด</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>
        </div>

        {['รอยืนยัน', 'ยืนยันแล้ว', 'เสร็จสิ้น'].map(statusName => {
          const statusItem = stats.byStatus?.find(s => s.status === statusName);
          const count = statusItem?._count?.status || 0;
          const colors = getStatusColor(statusName);

          return (
            <div key={statusName} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center transition-transform hover:scale-[1.02]">
              <div className={`p-3 rounded-lg mr-4 ${colors.split(' ')[0]} ${colors.split(' ')[1]}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{statusName}</p>
                <p className="text-2xl font-bold text-slate-800">{count}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* 30 Days Trend Chart - Full Width */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-4">รายการจอง 30 วันล่าสุด</h2>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={dailyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorComplete" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="displayDate" tick={{ fontSize: 11, fill: '#64748B' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}
              formatter={(value, name) => [`${value} รายการ`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey="total" name="ทั้งหมด" stroke="#6366F1" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
            <Area type="monotone" dataKey="รอยืนยัน" name="รอยืนยัน" stroke="#FBBF24" fillOpacity={1} fill="url(#colorPending)" strokeWidth={2} />
            <Area type="monotone" dataKey="ยืนยันแล้ว" name="ยืนยันแล้ว" stroke="#3B82F6" fillOpacity={1} fill="url(#colorConfirmed)" strokeWidth={2} />
            <Area type="monotone" dataKey="เสร็จสิ้น" name="เสร็จสิ้น" stroke="#22C55E" fillOpacity={1} fill="url(#colorComplete)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart and Table side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">สัดส่วนสถานะการจอง</h2>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} รายการ`, 'จำนวน']} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-slate-400">ไม่มีข้อมูล</div>
          )}
        </div>

        {/* Recent Bookings Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">การจองล่าสุด</h2>
            <Link to="/admin/queues" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              จัดการคิวทั้งหมด &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ลูกค้า</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ประเภทบริการ</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">วันที่นัดหมาย</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-800">{booking.customer_name}</div>
                        <div className="text-xs text-slate-500">{booking.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{booking.service_type}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(booking.booking_date).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic">
                      ไม่พบข้อมูลการจองล่าสุด
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;