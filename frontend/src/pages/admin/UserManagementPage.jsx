import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Store,
  X,
  Filter,
  User,
  Mail,
  MapPin,
  Lock,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import userService from '../../services/userService';
import SearchInput from '../../components/common/SearchInput';
import Badge from '../../components/common/Badge';
import StarRating from '../../components/common/StarRating';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import useToast from '../../hooks/useToast';
import { formatDate, formatRole } from '../../utils/formatters';

// ─── Add User Modal ───────────────────────────────────────────────────────────
const AddUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { success } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const isLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);

  const validate = () => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) { setError('User full name is required.'); return false; }
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      setError(`Name must be between 20 and 60 characters (currently ${trimmedName.length} chars).`);
      return false;
    }
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) { setError('Email address is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please provide a valid email address.'); return false;
    }
    if (!isLengthValid || !hasUppercase || !hasSpecial) {
      setError('Password must be 8–16 characters with at least one uppercase letter and one special character.');
      return false;
    }
    const trimmedAddress = formData.address.trim();
    if (!trimmedAddress) { setError('Physical address is required.'); return false; }
    if (trimmedAddress.length > 400) { setError('Address cannot exceed 400 characters.'); return false; }
    if (!['user', 'owner', 'admin'].includes(formData.role)) {
      setError('Please select a valid user role.'); return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setError('');
    try {
      await userService.createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim(),
        role: formData.role,
      });
      success(`User account for "${formData.name.trim()}" created successfully!`);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '540px', width: '100%' }}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="modal-title">Add User</h3>
              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Create a new user account</div>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body — Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {error && (
              <div className="form-alert-error">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role</label>
              <div className="role-radio-grid">
                {[
                  { role: 'user', label: 'Normal User', desc: 'Browse & rate stores' },
                  { role: 'owner', label: 'Store Owner', desc: 'Manages assigned store' },
                  { role: 'admin', label: 'Admin', desc: 'Full administrative access' },
                ].map((item) => (
                  <label
                    key={item.role}
                    className={`role-radio-card ${formData.role === item.role ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={item.role}
                      checked={formData.role === item.role}
                      onChange={handleChange}
                      style={{ display: 'none' }}
                    />
                    <span className="role-card-name">{item.label}</span>
                    <span className="role-card-desc">{item.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="form-label-row">
                <label className="form-label">Full Name</label>
                <span className="form-char-count">{formData.name.length}/60 (20–60 chars)</span>
              </div>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Jonathan Alexander Higgins"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <Mail className="form-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a temporary password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="form-input-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.6875rem', marginTop: '4px', color: 'var(--color-text-muted)' }}>
                <span style={{ color: isLengthValid ? 'var(--color-success)' : undefined, fontWeight: isLengthValid ? 700 : 400 }}>• 8–16 chars</span>
                <span style={{ color: hasUppercase ? 'var(--color-success)' : undefined, fontWeight: hasUppercase ? 700 : 400 }}>• 1 Uppercase</span>
                <span style={{ color: hasSpecial ? 'var(--color-success)' : undefined, fontWeight: hasSpecial ? 700 : 400 }}>• 1 Special char</span>
              </div>
            </div>

            {/* Address */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div className="form-label-row">
                <label className="form-label">Physical Address</label>
                <span className="form-char-count">{formData.address.length}/400 max</span>
              </div>
              <div className="form-input-wrapper">
                <MapPin className="form-input-icon top" />
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full physical address..."
                  className="form-textarea"
                  required
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? (
                <span>Creating...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);

  // View user details modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Add user modal
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(searchParams.get('add') === '1');

  // Support deep links such as /admin/users?add=1 and clear the flag afterwards
  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setShowAddModal(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const { error: toastError } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers({
        search,
        role: roleFilter,
        sortBy,
        sortOrder,
        page: pagination.page,
        limit: pagination.limit,
      });
      if (res.success && res.data) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toastError(err.message || 'Failed to fetch users list.');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, sortBy, sortOrder, pagination.page, pagination.limit, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleViewUser = async (user) => {
    setIsLoadingDetails(true);
    try {
      const res = await userService.getUserById(user.id);
      if (res.success && res.data) {
        setSelectedUser(res.data.user);
      }
    } catch (err) {
      toastError(err.message || 'Failed to load user details.');
      setSelectedUser(user);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUserCreated = () => {
    setShowAddModal(false);
    fetchUsers();
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
          <h1 className="page-main-title">Users</h1>
          <p className="page-main-subtitle">
            Manage system administrators, store owners, and normal users.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="table-wrapper-card">
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '280px' }}>
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              placeholder="Search users by name, email, or address..."
              style={{ width: '100%', maxWidth: '360px' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
                className="form-select no-icon"
                style={{ padding: '8px 12px', fontSize: '0.8125rem', width: 'auto' }}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Users: <span style={{ color: 'var(--color-text-main)', fontWeight: 800 }}>{pagination.total}</span>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <LoadingSpinner message="Loading user records..." />
        ) : users.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="empty-state-title">No users found</h3>
            <p className="empty-state-text">
              {search || roleFilter ? 'No users match your filter criteria.' : 'No additional records available.'}
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
                  <th className="sortable" onClick={() => handleSort('role')}>
                    <div className="th-content">
                      <span>Role</span>
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="cell-bold">{u.name}</div>
                      {u.role === 'owner' && u.store_name && (
                        <div className="cell-subtext" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                          Store: {u.store_name} ({u.store_avg_rating || '0.0'} ★)
                        </div>
                      )}
                    </td>
                    <td>{u.email}</td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.address}>
                      {u.address}
                    </td>
                    <td>
                      <Badge variant={u.role}>
                        {formatRole(u.role)}
                      </Badge>
                    </td>
                    <td>
                      <div className="cell-actions">
                        <button
                          type="button"
                          onClick={() => handleViewUser(u)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
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

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleUserCreated}
        />
      )}

      {/* View User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="modal-title">{selectedUser.name}</h3>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>User Account Details</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="modal-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Account Role</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{formatRole(selectedUser.role)}</div>
                </div>
                <Badge variant={selectedUser.role} size="md">
                  {selectedUser.role.toUpperCase()}
                </Badge>
              </div>

              {/* If Store Owner, show Store and Average Rating */}
              {selectedUser.role === 'owner' && (
                <div style={{ padding: '14px 16px', background: '#fffbeb', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Store className="w-3.5 h-3.5" /> Owned Store &amp; Rating
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#78350f' }}>
                      {selectedUser.store?.average_rating || selectedUser.store_avg_rating || '0.0'} ★
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.875rem' }}>
                    {selectedUser.store?.name || selectedUser.store_name || 'No store assigned yet'}
                  </div>
                  {(selectedUser.store || selectedUser.store_name) && (
                    <div style={{ marginTop: '6px' }}>
                      <StarRating
                        rating={selectedUser.store?.average_rating || selectedUser.store_avg_rating || 0}
                        size="sm"
                        showValue={true}
                        totalReviews={selectedUser.store?.total_ratings || selectedUser.store_total_ratings || 0}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* If normal user, show ratings submitted count */}
              {selectedUser.role === 'user' && (
                <div style={{ padding: '12px 14px', background: '#eef2ff', borderRadius: 'var(--radius-md)', border: '1px solid #c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                  <span style={{ color: '#3730a3', fontWeight: 600 }}>Total Ratings Submitted:</span>
                  <span style={{ fontWeight: 800, color: '#312e81', fontSize: '0.9375rem' }}>{selectedUser.total_submitted_ratings ?? 0}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '0.8125rem' }}>
                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', marginBottom: '2px' }}>Email Address</div>
                  <div style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>{selectedUser.email}</div>
                </div>

                <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', marginBottom: '2px' }}>Physical Address</div>
                  <div style={{ color: 'var(--color-text-main)' }}>{selectedUser.address}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Joined: {formatDate(selectedUser.created_at)}</span>
                <span>User ID: #{selectedUser.id}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
