import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  MapPin,
  KeyRound,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import useToast from '../../hooks/useToast';

export const OwnerDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);

  const { error: toastError } = useToast();

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getStoreOwnerDashboard({
        sortBy,
        sortOrder,
      });

      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load store owner metrics.');
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, sortOrder, toastError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
    ) : (
      <ArrowDown className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading store owner metrics..." />;
  }

  const { hasStore, store, stats, ratings = [] } = dashboardData || {};

  if (!hasStore || !store) {
    return (
      <div className="table-wrapper-card" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="empty-state-box">
          <div className="empty-state-icon">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="empty-state-title">No Store Assigned Yet</h2>
          <p className="empty-state-text">
            Your account holds the Store Owner role, but an administrator has not yet assigned a store to your profile.
          </p>
        </div>
      </div>
    );
  }

  const avgRating = stats?.averageRating || 0;
  const totalReviews = stats?.totalRatings || 0;
  const dist = stats?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Store Header Banner */}
      <div className="dashboard-hero-banner">
        <div className="dashboard-hero-content">
          <div className="dashboard-role-badge">
            Owner
          </div>
          <h1 className="dashboard-hero-title">{store.name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail className="w-3.5 h-3.5" />
              <span>{store.email}</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin className="w-3.5 h-3.5" />
              <span>{store.address}</span>
            </span>
          </div>
        </div>

        <div className="dashboard-hero-actions">
          <Link
            to="/change-password"
            className="btn btn-secondary btn-sm"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </Link>
        </div>
      </div>

      {/* Average Rating & Breakdown */}
      <div className="cards-grid-3">
        {/* Prominent Average Rating Card */}
        <div className="dashboard-card" style={{ padding: '24px' }}>
          <div>
            <span className="stat-title">Average Store Rating</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-text-main)', lineHeight: 1 }}>
                {avgRating.toFixed(1)}
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>/ 5.0</span>
            </div>

            <StarRating rating={avgRating} size="lg" />

            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '12px', fontWeight: 600 }}>
              Based on <span style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{totalReviews}</span> submitted customer rating{totalReviews === 1 ? '' : 's'}
            </p>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--color-bg-muted)', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Status: <span style={{ color: '#059669', fontWeight: 700 }}>Live Real-Time Synced</span>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="dashboard-card" style={{ gridColumn: 'span 2', padding: '24px' }}>
          <div className="dashboard-card-header">
            <h2 className="dashboard-card-title">Rating Distribution</h2>
            <span className="dashboard-card-tag">Customer Breakdown</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: 'auto 0' }}>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = dist[stars] || 0;
              const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

              return (
                <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8125rem' }}>
                  <div style={{ width: '48px', fontWeight: 700, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>

                  <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: '#f59e0b',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>

                  <div style={{ width: '64px', textAlign: 'right', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{count}</span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-bg-muted)', fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Verified Customer Reviews</span>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Total: {totalReviews}</span>
          </div>
        </div>
      </div>

      {/* Users Who Submitted Ratings Table */}
      <div className="table-wrapper-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Users Who Submitted Ratings
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Customer evaluations received for {store.name}
            </p>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Reviews: <span style={{ color: 'var(--color-text-main)', fontWeight: 800 }}>{ratings.length}</span>
          </div>
        </div>

        {ratings.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">No customer ratings yet</h3>
            <p className="empty-state-text">
              As users rate your store, their reviews will appear here.
            </p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('user_name')}>
                    <div className="th-content">
                      <span>User Name</span>
                      {getSortIcon('user_name')}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort('user_email')}>
                    <div className="th-content">
                      <span>User Email</span>
                      {getSortIcon('user_email')}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort('rating')}>
                    <div className="th-content">
                      <span>Rating</span>
                      {getSortIcon('rating')}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort('created_at')}>
                    <div className="th-content">
                      <span>Date Submitted</span>
                      {getSortIcon('created_at')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ratings.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="cell-bold">{item.user_name}</div>
                    </td>
                    <td>{item.user_email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StarRating rating={item.rating} size="sm" />
                        <span style={{ fontWeight: 800, color: 'var(--color-text-main)', fontSize: '0.8125rem' }}>
                          {item.rating} ★
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
