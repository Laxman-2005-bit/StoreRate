import React, { useState, useEffect, useCallback } from 'react';
import { Star, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import StarRating from '../../components/common/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import useToast from '../../hooks/useToast';

export const OwnerRatingsPage = () => {
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [ratingFilter, setRatingFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { error: toastError } = useToast();

  const fetchRatings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await dashboardService.getStoreOwnerDashboard({
        sortBy,
        sortOrder,
      });

      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load ratings.');
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, sortOrder, toastError]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

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
    return <LoadingSpinner message="Loading customer reviews..." />;
  }

  const { store, ratings = [] } = data || {};

  const filteredRatings = ratingFilter
    ? ratings.filter((r) => r.rating === parseInt(ratingFilter, 10))
    : ratings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header-block">
        <div className="page-title-group">
          <h1 className="page-main-title">Customer Ratings</h1>
          <p className="page-main-subtitle">
            Detailed list of customer feedback and star ratings for {store?.name || 'your store'}.
          </p>
        </div>

        {/* Rating Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Filter by Stars:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="form-select no-icon"
            style={{ padding: '6px 12px', fontSize: '0.8125rem', width: 'auto' }}
          >
            <option value="">All Ratings ({ratings.length})</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="table-wrapper-card">
        {filteredRatings.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">No matching reviews</h3>
            <p className="empty-state-text">
              {ratingFilter
                ? `No customers have submitted a ${ratingFilter}-star rating yet.`
                : 'No customer reviews submitted yet.'}
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
                {filteredRatings.map((item) => (
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

export default OwnerRatingsPage;
