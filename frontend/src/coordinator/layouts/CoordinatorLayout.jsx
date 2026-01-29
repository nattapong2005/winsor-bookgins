import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const CoordinatorLayout = ({ handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/coordinator/dashboard', label: 'แดชบอร์ด', icon: '📊' },
    { path: '/coordinator/queues', label: 'จัดการคิวงาน', icon: '📅' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-['Prompt']">
      {/* Sidebar */}
      <aside 
        className={`bg-slate-900 text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col fixed h-full z-20`}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-700 h-20">
            {isSidebarOpen ? (
                <span className="text-xl font-bold tracking-tight">VINYL<span className="text-orange-500">COOR</span></span>
            ) : (
                <span className="text-xl font-bold text-orange-500 mx-auto">C</span>
            )}
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2 px-3">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 w-full transition-all`}
          >
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span className="font-medium">ออกจากระบบ</span>}
          </button>
        </div>
        
        {/* Toggle Button */}
        <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-1/2 -right-3 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors shadow-lg"
        >
            <span className="text-xs">{isSidebarOpen ? '◀' : '▶'}</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <main className="flex-1 p-8">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CoordinatorLayout;
