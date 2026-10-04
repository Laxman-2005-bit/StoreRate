import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, KeyRound, AlertCircle, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import Badge from '../../components/common/Badge';
import useToast from '../../hooks/useToast';
import { formatDate, formatRole } from '../../utils/formatters';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: user?.address || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const { success, error: toastError } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const validate = () => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError('Name is required.');
      return false;
    }
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      setError(`Name must be between 20 and 60 characters (currently ${trimmedName.length} chars).`);
      return false;
    }

    const trimmedAddress = formData.address.trim();
    if (!trimmedAddress) {
      setError('Address is required.');
      return false;
    }
    if (trimmedAddress.length > 400) {
      setError('Address cannot exceed 400 characters.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setError('');

    try {
      const res = await userService.updateUser(user.id, {
        name: formData.name.trim(),
        address: formData.address.trim(),
      });

      if (res.success && res.data?.user) {
        updateUserProfile(res.data.user);
        success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="form-card">
        {/* Header Banner */}
        <div style={{ padding: '24px 28px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: 'var(--color-primary)', color: '#ffffff', fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{user?.name}</h1>
              <div style={{ marginTop: '4px' }}>
                <Badge variant={user?.role}>
                  {formatRole(user?.role)}
                </Badge>
              </div>
            </div>
          </div>

          <Link
            to="/change-password"
            className="btn btn-secondary btn-sm"
            style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </Link>
        </div>

        {error && (
          <div style={{ padding: '0 28px', paddingTop: '20px' }}>
            <div className="form-alert-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Profile Info / Edit Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-card-body">
            {/* Email (Readonly) */}
            <div className="form-group">
              <label className="form-label">Email Address (Account Identifier)</label>
              <div className="form-input-wrapper">
                <Mail className="form-input-icon" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="form-input"
                  style={{ background: 'var(--color-bg-muted)', cursor: 'not-allowed', color: 'var(--color-text-muted)' }}
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Full Name</label>
                {isEditing && (
                  <span className="form-char-count">{formData.name.length}/60 (20–60 chars)</span>
                )}
              </div>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  disabled={!isEditing}
                  className="form-input"
                  style={{ background: !isEditing ? 'var(--color-bg-muted)' : '#ffffff' }}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Physical Address</label>
                {isEditing && (
                  <span className="form-char-count">{formData.address.length}/400 max</span>
                )}
              </div>
              <div className="form-input-wrapper">
                <MapPin className="form-input-icon top" />
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  disabled={!isEditing}
                  className="form-textarea"
                  style={{ background: !isEditing ? 'var(--color-bg-muted)' : '#ffffff' }}
                  required
                />
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar className="w-3.5 h-3.5" />
              <span>Registered on: {formatDate(user?.created_at)}</span>
            </div>
          </div>

          <div className="form-card-footer">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: user.name, address: user.address });
                    setError('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
