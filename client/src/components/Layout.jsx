import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaHospital, FaCalendarAlt, FaSignOutAlt, FaUser, FaClipboardList } from 'react-icons/fa';

const Layout = () => {
  const { currentFacility, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Updated navigation items for facility users
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaUser /> },
    { path: '/shifts', label: 'Manage Shifts', icon: <FaCalendarAlt /> },
    { path: '/facility-profile', label: 'Facility Profile', icon: <FaHospital /> },
    { path: '/post-shift', label: 'Post New Shift', icon: <FaClipboardList /> },
  ];
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for mobile */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity bg-black bg-opacity-50 ${
          sidebarOpen ? 'opacity-100 ease-out duration-300' : 'opacity-0 ease-in duration-200 pointer-events-none'
        }`}
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-primary-600 ${
          sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
        } md:translate-x-0 md:static md:inset-0`}
      >
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-white">NurseConnect</span>
          </div>
          <button
            onClick={closeSidebar}
            className="text-white focus:outline-none md:hidden"
          >
            <FaTimes size={24} />
          </button>
        </div>
        <nav className="px-2 mt-5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mt-2 rounded-md text-white ${
                location.pathname === item.path
                  ? 'bg-primary-700'
                  : 'hover:bg-primary-500'
              }`}
              onClick={closeSidebar}
            >
              <div className="mr-3">{item.icon}</div>
              <span>{item.label}</span>
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 mt-10 text-white rounded-md hover:bg-primary-500"
          >
            <FaSignOutAlt className="mr-3" />
            <span>Logout</span>
          </button>
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow md:hidden">
          <button
            onClick={toggleSidebar}
            className="text-gray-500 focus:outline-none"
          >
            <FaBars size={24} />
          </button>
          <div className="text-xl font-semibold">NurseConnect</div>
          <div className="text-gray-500">{currentFacility?.name}</div>
        </header>
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;