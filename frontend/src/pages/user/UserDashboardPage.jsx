import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, Star, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';

export const UserDashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getUserDashboard();
        if (res.success && res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load user dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const { stats, recentRatings = [] } = dashboardData || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div className="dashboard-hero-content">
          <div className="dashboard-role-badge">
            User
          </div>
          <h1 className="dashboard-hero-title">
            Hello, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="dashboard-hero-subtitle">
            Discover local stores, evaluate service quality, and submit ratings from 1 to 5 stars.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <Link
            to="/user/stores"
            className="btn btn-primary"
          >
            <Store className="w-4 h-4" />
            <span>Discover Stores</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="cards-grid-3">
        <StatCard
          title="Available Stores"
          value={stats?.totalStores ?? 0}
          subtitle="Registered businesses to review"
          icon={Store}
          color="indigo"
        />

        <StatCard
          title="Your Submitted Ratings"
          value={stats?.myTotalRatings || 0}
          subtitle="Stores you have evaluated"
          icon={CheckCircle}
          color="emerald"
        />

        <StatCard
          title="Your Average Rating Given"
          value={stats?.myAvgRating ? `${stats.myAvgRating} ★` : '0.0 ★'}
          subtitle="Across your store reviews"
          icon={Star}
          color="amber"
        />
      </div>

      {/* Recent Ratings by User */}
      <div className="dashboard-card">
        <div>
          <div className="dashboard-card-header">
            <div className="dashboard-card-title-group">
              <Clock className="dashboard-card-icon" style={{ color: 'var(--color-primary)' }} />
              <h2 className="dashboard-card-title">Your Recent Ratings</h2>
            </div>
            <Link
              to="/user/ratings"
              className="dashboard-view-all-link"
              style={{ fontSize: '0.75rem' }}
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentRatings.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="empty-state-title">You haven't rated any stores yet</h3>
              <p className="empty-state-text">
                Browse available stores and submit your feedback from 1 to 5 stars.
              </p>
              <Link
                to="/user/stores"
                className="btn btn-primary btn-sm"
                style={{ marginTop: '16px' }}
              >
                Discover Stores Now
              </Link>
            </div>
          ) : (
            <div className="activity-list">
              {recentRatings.map((rating) => (
                <div key={rating.id} className="activity-item">
                  <div>
                    <div className="activity-user">{rating.store_name}</div>
                    <div className="activity-subtext">{rating.store_address}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Your Rating:</span>
                        <StarRating rating={rating.rating} size="sm" />
                      </div>
                      <div className="cell-subtext">
                        {formatDate(rating.updated_at || rating.created_at)}
                      </div>
                    </div>

                    <Link
                      to="/user/stores"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Modify
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
