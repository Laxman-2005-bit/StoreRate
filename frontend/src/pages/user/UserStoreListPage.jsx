import React, { useState, useEffect, useCallback } from 'react';
import {
  Store,
  MapPin,
  Star,
  Edit3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import storeService from '../../services/storeService';
import ratingService from '../../services/ratingService';
import SearchInput from '../../components/common/SearchInput';
import StarRating from '../../components/common/StarRating';
import RatingModal from '../../components/common/RatingModal';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';

export const UserStoreListPage = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);

  // Rating modal state
  const [modalStore, setModalStore] = useState(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const { success, error: toastError } = useToast();

  const fetchStores = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await storeService.getStores({
        search,
        sortBy,
        sortOrder,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (res.success && res.data) {
        setStores(res.data.stores);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load stores.');
    } finally {
      setIsLoading(false);
    }
  }, [search, sortBy, sortOrder, pagination.page, pagination.limit, toastError]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleOpenRatingModal = (store) => {
    setModalStore(store);
  };

  const handleRatingSubmit = async (ratingValue) => {
    if (!modalStore) return;
    setIsSubmittingRating(true);

    try {
      if (modalStore.user_rating_id) {
        await ratingService.updateRating(modalStore.id, modalStore.user_rating_id, ratingValue);
        success(`Your rating for "${modalStore.name}" was updated to ${ratingValue} stars!`);
      } else {
        await ratingService.submitRating(modalStore.id, ratingValue);
        success(`Thank you! Your ${ratingValue}-star rating for "${modalStore.name}" was submitted.`);
      }

      setModalStore(null);
      fetchStores();
    } catch (err) {
      toastError(err.message || 'Failed to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="page-header-block">
        <div className="page-title-group">
          <h1 className="page-main-title">Discover Stores</h1>
          <p className="page-main-subtitle">
            Explore registered commercial stores, review community ratings, and submit your evaluation.
          </p>
        </div>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="table-wrapper-card" style={{ marginBottom: '4px' }}>
        <div className="table-toolbar">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search stores by name or address..."
            style={{ width: '100%', maxWidth: '380px' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Sort by:</span>
              <select
                value={`${sortBy}_${sortOrder}`}
                onChange={(e) => {
                  const [f, o] = e.target.value.split('_');
                  setSortBy(f);
                  setSortOrder(o);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="form-select no-icon"
                style={{ padding: '6px 12px', fontSize: '0.8125rem', width: 'auto' }}
              >
                <option value="name_asc">Name (A–Z)</option>
                <option value="name_desc">Name (Z–A)</option>
                <option value="rating_desc">Highest Rated</option>
                <option value="rating_asc">Lowest Rated</option>
              </select>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Stores: <span style={{ color: 'var(--color-text-main)', fontWeight: 800 }}>{pagination.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Content Cards */}
      {isLoading ? (
        <LoadingSpinner message="Searching stores..." />
      ) : stores.length === 0 ? (
        <div className="table-wrapper-card">
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">No stores found</h3>
            <p className="empty-state-text">
              {search ? `No stores matched "${search}".` : 'No additional records available.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="cards-grid-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="dashboard-card"
              style={{ padding: '20px' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                  <div className="stat-icon-wrapper stat-icon-indigo">
                    <Store className="w-5 h-5" />
                  </div>

                  {/* User's Rating Badge */}
                  {store.user_rating ? (
                    <span className="badge badge-owner" style={{ background: '#fffbeb', color: '#b45309', borderColor: '#fde68a' }}>
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>Your Rating: {store.user_rating} ★</span>
                    </span>
                  ) : (
                    <span className="badge" style={{ background: '#f1f5f9', color: '#64748b', borderColor: '#e2e8f0' }}>
                      Not rated yet
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                  {store.name}
                </h2>

                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '16px' }}>
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </p>

                {/* Overall Rating Block */}
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Community Rating
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <StarRating rating={store.overall_rating} size="md" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                      {store.overall_rating} ★ <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>({store.total_ratings} {store.total_ratings === 1 ? 'rating' : 'ratings'})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button: Rate Store / Modify Rating */}
              <div>
                {store.user_rating ? (
                  <button
                    type="button"
                    onClick={() => handleOpenRatingModal(store)}
                    className="btn btn-secondary"
                    style={{ width: '100%', borderColor: '#fde68a', background: '#fffbeb', color: '#92400e' }}
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Modify Rating</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenRatingModal(store)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Rate Store</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Rating Submission & Modification Modal */}
      {modalStore && (
        <RatingModal
          isOpen={!!modalStore}
          onClose={() => setModalStore(null)}
          onSubmit={handleRatingSubmit}
          store={modalStore}
          initialRating={modalStore.user_rating || 0}
          isEditing={!!modalStore.user_rating}
          isLoading={isSubmittingRating}
        />
      )}
    </div>
  );
};

export default UserStoreListPage;
