import React, { useState, useEffect } from 'react';
import { X, Star, Sparkles } from 'lucide-react';
import StarRating from './StarRating';

export const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
  store,
  initialRating = 0,
  isEditing = false,
  isLoading = false,
}) => {
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedRating(initialRating);
    setError('');
  }, [initialRating, isOpen]);

  if (!isOpen || !store) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }
    setError('');
    onSubmit(selectedRating);
  };

  const ratingDescriptions = {
    1: 'Poor - Needs significant improvement',
    2: 'Fair - Below expectations',
    3: 'Good - Met normal expectations',
    4: 'Very Good - Exceeded expectations',
    5: 'Excellent - Outstanding experience!',
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="modal-title">
                {isEditing ? 'Modify Your Rating' : 'Rate This Store'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{store.name}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              How would you evaluate your experience with <strong style={{ color: 'var(--color-text-main)' }}>{store.name}</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <StarRating
                rating={selectedRating}
                interactive={true}
                size="xl"
                onChange={(newRating) => {
                  setSelectedRating(newRating);
                  setError('');
                }}
              />
            </div>

            <div style={{ minHeight: '24px' }}>
              {selectedRating > 0 ? (
                <span className="badge badge-owner" style={{ background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{selectedRating} Star{selectedRating > 1 ? 's' : ''}: {ratingDescriptions[selectedRating]}</span>
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Click a star to rate from 1 to 5</span>
              )}
            </div>

            {error && (
              <div className="form-alert-error" style={{ marginTop: '12px' }}>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedRating === 0}
              className="btn btn-primary"
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : isEditing ? (
                'Update Rating'
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
