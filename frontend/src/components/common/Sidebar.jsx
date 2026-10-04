import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  Users,
  Star,
  User,
  LogOut,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import StoreRateBrand from './StoreRateBrand';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define navigation items based strictly on role requirements
  const getNavItems = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { label: 'Stores', path: '/admin/stores', icon: Store },
        { label: 'Users', path: '/admin/users', icon: Users },
        { label: 'Profile', path: '/admin/profile', icon: User },
      ];
    }

    if (user.role === 'owner') {
      return [
        { label: 'Dashboard', path: '/owner', icon: LayoutDashboard },
        { label: 'Ratings', path: '/owner/ratings', icon: Star },
        { label: 'Profile', path: '/owner/profile', icon: User },
      ];
    }

    // Default: 'user' (Normal User)
    return [
      { label: 'Dashboard', path: '/user', icon: LayoutDashboard },
      { label: 'Discover Stores', path: '/user/stores', icon: Store },
      { label: 'My Ratings', path: '/user/ratings', icon: Star },
      { label: 'Profile', path: '/user/profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  const getRoleDisplayName = (role) => {
    if (role === 'admin') return 'System Administrator';
    if (role === 'owner') return 'Store Owner';
    return 'Normal User';
  };

  const getRoleBadgeLabel = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'owner') return 'Owner';
    return 'User';
  };

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div>
        {/* Logo & Brand Header */}
        <div className="sidebar-header">
          <StoreRateBrand tone="dark" size={28} onClick={onClose} />

          <button
            type="button"
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile / Role Card */}
        <div className="sidebar-profile-card">
          <div className="sidebar-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="sidebar-user-meta">
            <div className="sidebar-user-name" title={user?.name}>
              {user?.name || 'User'}
            </div>
            <div className="sidebar-user-role">
              {getRoleDisplayName(user?.role)}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <ul className="sidebar-nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="sidebar-nav-item">
                <NavLink
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/user' || item.path === '/owner'}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="sidebar-nav-icon" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Actions */}
      <div className="sidebar-footer">
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-logout-btn"
        >
          <LogOut className="sidebar-nav-icon" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
