import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Store,
  Star,
  PlusCircle,
  UserPlus,
  ArrowRight,
  Activity,
  Award,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import StatCard from '../../components/common/StatCard';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getAdminDashboard();
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load administrator metrics.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading administrator metrics..." />;
  }

  if (error) {
    return (
      <div className="form-alert-error">
        <span>{error}</span>
      </div>
    );
  }

  const { stats, recentRatings = [], topStores = [] } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Banner */}
      <div className="dashboard-hero-banner">
        <div className="dashboard-hero-content">
          <div className="dashboard-role-badge">
            Admin
          </div>
          <h1 className="dashboard-hero-title">Admin Overview</h1>
          <p className="dashboard-hero-subtitle">
            Monitor users, stores and submitted ratings.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <Link
            to="/admin/add-store"
            className="btn btn-primary btn-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Store</span>
          </Link>
          <Link
            to="/admin/users?add=1"
            className="btn btn-secondary btn-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </Link>
        </div>
      </div>

      {/* Live counts from the database */}
      <div className="cards-grid-3">
        <StatCard
          title="Users"
          value={stats?.totalUsers ?? 0}
          subtitle={`Admins: ${stats?.roleBreakdown?.admin ?? 0} | Owners: ${stats?.roleBreakdown?.owner ?? 0} | Users: ${stats?.roleBreakdown?.user ?? 0}`}
          icon={Users}
          color="indigo"
        />

        <StatCard
          title="Stores"
          value={stats?.totalStores ?? 0}
          subtitle="Registered stores"
          icon={Store}
          color="emerald"
        />

        <StatCard
          title="Submitted Ratings"
          value={stats?.totalRatings ?? 0}
          subtitle={stats?.totalRatings > 0 ? `Average: ${Number(stats.averageRating).toFixed(1)} ★` : 'No ratings yet'}
          icon={Star}
          color="amber"
        />
      </div>

      {/* Overview Grid: Left Recent Ratings, Right Top Rated Stores */}
      <div className="cards-grid-2">
        {/* LEFT: Recent Rating Activity */}
        <div className="dashboard-card">
          <div>
            <div className="dashboard-card-header">
              <div className="dashboard-card-title-group">
                <Activity className="dashboard-card-icon" style={{ color: 'var(--color-primary)' }} />
                <h2 className="dashboard-card-title">Recent Rating Activity</h2>
              </div>
              <span className="dashboard-card-tag">Latest Submissions</span>
            </div>

            {recentRatings.length === 0 ? (
              <div className="empty-state-box" style={{ padding: '24px' }}>
                <p className="empty-state-text">No additional records available.</p>
              </div>
            ) : (
              <div className="activity-list">
                {recentRatings.slice(0, 5).map((rating) => (
                  <div key={rating.id} className="activity-item">
                    <div>
                      <div className="activity-user">{rating.user_name}</div>
                      <div className="activity-subtext">
                        Rated <span className="activity-store-name">{rating.store_name}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StarRating rating={rating.rating} size="sm" />
                      <div className="cell-subtext">{formatDate(rating.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card-footer">
            <Link to="/admin/stores" className="dashboard-view-all-link">
              <span>View All Stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT: Top Rated Stores */}
        <div className="dashboard-card">
          <div>
            <div className="dashboard-card-header">
              <div className="dashboard-card-title-group">
                <Award className="dashboard-card-icon" style={{ color: '#059669' }} />
                <h2 className="dashboard-card-title">Top Rated Stores</h2>
              </div>
              <span className="dashboard-card-tag">By Community Score</span>
            </div>

            {topStores.length === 0 ? (
              <div className="empty-state-box" style={{ padding: '24px' }}>
                <p className="empty-state-text">No additional records available.</p>
              </div>
            ) : (
              <div className="activity-list">
                {topStores.map((store) => (
                  <div key={store.id} className="activity-item">
                    <div>
                      <div className="activity-user">{store.name}</div>
                      <div className="activity-subtext">{store.address}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <StarRating rating={store.average_rating} size="sm" showValue={true} />
                      <div className="cell-subtext">
                        {store.ratings_count} {Number(store.ratings_count) === 1 ? 'rating' : 'ratings'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-card-footer">
            <Link to="/admin/users" className="dashboard-view-all-link">
              <span>View All Users</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
