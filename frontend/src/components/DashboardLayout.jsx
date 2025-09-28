import { useState } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';

export default function DashboardLayout() {
  const { user, token, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" />;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-72 bg-gray-800">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <div className="flex items-center space-x-2">
            {/* 1. Go to heroicons.com and find an icon you like */}
            {/* 2. Copy the SVG code */}
            {/* 3. Paste the SVG code here */}
            {/* 4. IMPORTANT: Add className="w-8 h-8 text-white" to the <svg> tag */}
            <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-2xl font-bold">TaskFlow Pro</span>
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 bg-gray-800">
            <Link to="/" className="flex items-center px-4 py-2 text-gray-100 hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Dashboard
            </Link>
            <Link to="/projects" className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Projects
            </Link>
            <Link to="/tasks" className="flex items-center px-4 py-2 mt-2 text-gray-100 hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Tasks
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200">
          <div className="flex items-center px-4">
            <button className="text-gray-500 focus:outline-none focus:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          <div className="flex items-center pr-4 space-x-4">
            <Notifications />
            <div className="relative">
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none">
                <span className="mr-2">{user?.name}</span>
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  {user?.profile_picture_path ? (
                    <img src={`http://127.0.0.1:8000/storage/${user.profile_picture_path}`} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.993A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                  <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
