import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine current page title based on path
  const getPageTitle = (pathname) => {
    if (pathname === '/admin' || pathname.startsWith('/admin/dashboard')) return 'Dashboard';
    if (pathname === '/admin/add-store' || pathname.startsWith('/admin/stores/add')) return 'Add Store';
    
    if (pathname.startsWith('/admin/stores')) return 'Stores';
    if (pathname.startsWith('/admin/users')) return 'Users';
    if (pathname === '/owner' || pathname.startsWith('/owner/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/owner/ratings')) return 'Ratings';
    if (pathname === '/user' || pathname.startsWith('/user/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/user/stores')) return 'Discover Stores';
    if (pathname.startsWith('/user/ratings') || pathname.startsWith('/user/my-ratings')) return 'My Ratings';
    if (pathname.includes('/profile')) return 'Profile';
    if (pathname.includes('/change-password')) return 'Change Password';
    return 'Dashboard';
  };

  const currentTitle = getPageTitle(location.pathname);

  return (
    <div className="app-layout">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Persistent / Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Area starts strictly AFTER the sidebar */}
      <div className="main-area">
        <Navbar
          title={currentTitle}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
