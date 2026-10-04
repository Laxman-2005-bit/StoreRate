import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import StoreManagementPage from '../pages/admin/StoreManagementPage';
import UserManagementPage from '../pages/admin/UserManagementPage';
import AddStorePage from '../pages/admin/AddStorePage';

// Owner Pages
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage';
import OwnerRatingsPage from '../pages/owner/OwnerRatingsPage';

// User Pages
import UserDashboardPage from '../pages/user/UserDashboardPage';
import UserStoreListPage from '../pages/user/UserStoreListPage';
import MyRatingsPage from '../pages/user/MyRatingsPage';

// Common Pages
import ProfilePage from '../pages/common/ProfilePage';
import ChangePasswordPage from '../pages/common/ChangePasswordPage';
import NotFoundPage from '../pages/common/NotFoundPage';

/**
 * Renders the Landing Page for unauthenticated visitors.
 * Authenticated users are immediately redirected to their dashboard.
 */
const LandingRoute = () => {
  const { user, isAuthenticated, loading, getDashboardPath } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <LandingPage />;
};

// Auth redirect handler (prevents logged-in users from seeing login/register)
const PublicAuthRoute = ({ children }) => {
  const { user, isAuthenticated, loading, getDashboardPath } = useAuth();

  if (loading) return null;

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Root Path — Landing Page (public) */}
      <Route path="/" element={<LandingRoute />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicAuthRoute>
              <LoginPage />
            </PublicAuthRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicAuthRoute>
              <RegisterPage />
            </PublicAuthRoute>
          }
        />
      </Route>

      {/* Authenticated Application Routes (Dashboard Layout) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* =========================================================================
            System Administrator Routes
            ========================================================================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StoreManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-store"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddStorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/stores/add"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddStorePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/add-user" element={<Navigate to="/admin/users?add=1" replace />} />
        <Route path="/admin/users/add" element={<Navigate to="/admin/users?add=1" replace />} />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* =========================================================================
            Store Owner Routes
            ========================================================================= */}
        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/ratings"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerRatingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/profile"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* =========================================================================
            Normal User Routes
            ========================================================================= */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/stores"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserStoreListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/ratings"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MyRatingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/my-ratings"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <MyRatingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/profile"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Shared Authenticated Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* 404 Not Found Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
