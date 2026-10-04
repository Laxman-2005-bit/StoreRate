import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, Store, MapPin, Edit3, ArrowRight } from 'lucide-react';
import ratingService from '../../services/ratingService';
import StarRating from '../../components/common/StarRating';
import RatingModal from '../../components/common/RatingModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import useToast from '../../hooks/useToast';

export const MyRatingsPage = () => {
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchMyRatings = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ratingService.getMyRatings();
      if (res.success && res.data) {
        setRatings(res.data.ratings);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load your submitted ratings.');
    } finally {
      setIsLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchMyRatings();
  }, [fetchMyRatings]);

  const handleUpdateRating = async (newRatingValue) => {
    if (!selectedRating) return;
    setIsSubmitting(true);
    try {
      await ratingService.updateRating(selectedRating.store_id, selectedRating.id, newRatingValue);
      success(`Updated rating for "${selectedRating.store_name}" to ${newRatingValue} stars.`);
      setSelectedRating(null);
      fetchMyRatings();
    } catch (err) {
      toastError(err.message || 'Failed to update rating.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header-block">
        <div className="page-title-group">
          <h1 className="page-main-title">My Ratings</h1>
          <p className="page-main-subtitle">
            Review and modify your ratings across all evaluated stores.
          </p>
        </div>

        <div className="page-header-actions">
          <Link
            to="/user/stores"
            className="btn btn-primary"
          >
            <Store className="w-4 h-4" />
            <span>Discover Stores</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your submitted ratings..." />
      ) : ratings.length === 0 ? (
        <div className="table-wrapper-card">
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">No ratings submitted yet</h3>
            <p className="empty-state-text">
              You haven't rated any stores yet. Visit the stores catalog to evaluate services and share your feedback.
            </p>
            <Link
              to="/user/stores"
              className="btn btn-primary btn-sm"
              style={{ marginTop: '16px' }}
            >
              <span>Browse Stores</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="cards-grid-3">
          {ratings.map((item) => (
            <div
              key={item.id}
              className="dashboard-card"
              style={{ padding: '20px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div className="stat-icon-wrapper stat-icon-indigo">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="badge badge-owner" style={{ background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>Your Rating: {item.rating} ★</span>
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                  {item.store_name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '16px' }}>
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{item.store_address}</span>
                </p>

                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '16px', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    <span>Store Average:</span>
                    <span style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>{item.store_overall_rating} ★</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', fontSize: '0.6875rem' }}>
                    <span>Last Updated:</span>
                    <span>{formatDate(item.updated_at || item.created_at)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedRating({
                    id: item.id,
                    store_id: item.store_id,
                    store_name: item.store_name,
                    rating: item.rating,
                  })
                }
                className="btn btn-secondary"
                style={{ width: '100%', borderColor: '#fde68a', background: '#fffbeb', color: '#92400e' }}
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Modify Rating</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modify Rating Modal */}
      {selectedRating && (
        <RatingModal
          isOpen={!!selectedRating}
          onClose={() => setSelectedRating(null)}
          onSubmit={handleUpdateRating}
          store={{ name: selectedRating.store_name }}
          initialRating={selectedRating.rating}
          isEditing={true}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default MyRatingsPage;
