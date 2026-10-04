import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Badge from './Badge';
import StoreRateBrand from './StoreRateBrand';

export const Navbar = ({ onToggleSidebar, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  const getProfilePath = () => {
    if (user?.role === 'admin') return '/admin/profile';
    if (user?.role === 'owner') return '/owner/profile';
    return '/user/profile';
  };

  const getRoleBadgeLabel = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'owner') return 'Owner';
    return 'User';
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="topbar-toggle-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <StoreRateBrand size={24} className="topbar-brand" />
        <h1 className="topbar-page-title">{title}</h1>
      </div>

      <div className="topbar-right">
        {user && (
          <>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user.name}</span>
              <span className="topbar-user-email">{user.email}</span>
            </div>

            <Badge variant={user.role}>
              {getRoleBadgeLabel(user.role)}
            </Badge>

            <Link
              to={getProfilePath()}
              className="topbar-action-btn"
              title="Account Profile"
              aria-label="Account Profile"
            >
              <User className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={logout}
              className="topbar-action-btn logout-btn"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
