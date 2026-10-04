import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  PlusCircle,
  Eye,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  MapPin,
  X,
  Building,
} from 'lucide-react';
import storeService from '../../services/storeService';
import SearchInput from '../../components/common/SearchInput';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import useToast from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

export const StoreManagementPage = () => {
  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
      toastError(err.message || 'Failed to fetch stores.');
    } finally {
      setIsLoading(false);
    }
  }, [search, sortBy, sortOrder, pagination.page, pagination.limit, toastError]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeleteStore = async () => {
    if (!storeToDelete) return;
    setIsDeleting(true);
    try {
      await storeService.deleteStore(storeToDelete.id);
      success(`Store "${storeToDelete.name}" deleted successfully.`);
      setStoreToDelete(null);
      fetchStores();
    } catch (err) {
      toastError(err.message || 'Failed to delete store.');
    } finally {
      setIsDeleting(false);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="page-header-block">
        <div className="page-title-group">
          <h1 className="page-main-title">Stores</h1>
          <p className="page-main-subtitle">
            View registered stores and their ratings.
          </p>
        </div>

        <div className="page-header-actions">
          <Link
            to="/admin/add-store"
            className="btn btn-primary"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Store</span>
          </Link>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="table-wrapper-card">
        <div className="table-toolbar">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            placeholder="Search stores by name, email, or address..."
            style={{ width: '100%', maxWidth: '380px' }}
          />

          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Stores: <span style={{ color: 'var(--color-text-main)', fontWeight: 800 }}>{pagination.total}</span>
          </div>
        </div>

        {/* Stores Table */}
        {isLoading ? (
          <LoadingSpinner message="Loading stores..." />
        ) : stores.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">No stores found</h3>
            <p className="empty-state-text">
              {search ? `No stores match "${search}".` : 'No additional records available.'}
            </p>
          </div>
        ) : (
          <div className="table-responsive-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    <div className="th-content">
                      <span>Name</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort('email')}>
                    <div className="th-content">
                      <span>Email</span>
                      {getSortIcon('email')}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort('address')}>
                    <div className="th-content">
                      <span>Address</span>
                      {getSortIcon('address')}
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort('rating')}>
                    <div className="th-content">
                      <span>Rating</span>
                      {getSortIcon('rating')}
                    </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td>
                      <div className="cell-bold">{store.name}</div>
                      <div className="cell-subtext">Owner: {store.owner_name}</div>
                    </td>
                    <td>{store.email}</td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={store.address}>
                      {store.address}
                    </td>
                    <td>
                      <StarRating
                        rating={store.overall_rating}
                        showValue={true}
                        totalReviews={store.total_ratings}
                        size="sm"
                      />
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button
                          type="button"
                          onClick={() => setSelectedStore(store)}
                          className="action-icon-btn"
                          title="View store details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStoreToDelete(store)}
                          className="action-icon-btn danger"
                          title="Delete store"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      </div>

      {/* Store Details Modal */}
      {selectedStore && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                <h3 className="modal-title">{selectedStore.name}</h3>
              </div>
              <button
                onClick={() => setSelectedStore(null)}
                className="modal-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '14px 16px', background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>Overall Rating</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#78350f' }}>{selectedStore.overall_rating} ★</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <StarRating rating={selectedStore.overall_rating} size="md" />
                  <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '2px' }}>{selectedStore.total_ratings} verified reviews</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8125rem' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', marginBottom: '4px' }}>Store Email</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{selectedStore.email}</div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', marginBottom: '4px' }}>Store Owner</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{selectedStore.owner_name}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{selectedStore.owner_email}</div>
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '0.8125rem' }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', marginBottom: '4px' }}>Physical Address</div>
                <div style={{ color: 'var(--color-text-main)' }}>{selectedStore.address}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setSelectedStore(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!storeToDelete}
        onClose={() => setStoreToDelete(null)}
        onConfirm={handleDeleteStore}
        title="Delete Store"
        message={`Are you sure you want to delete "${storeToDelete?.name}"? All associated ratings will also be permanently removed.`}
        confirmText="Delete Store"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default StoreManagementPage;
