import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative selection:bg-indigo-600 selection:text-white">
      {/* Subtle background decoration */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-indigo-50/80 to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-5 text-center text-xs text-slate-500 border-t border-slate-200/80">
        © {new Date().getFullYear()} StoreRate
      </footer>
    </div>
  );
};

export default AuthLayout;
