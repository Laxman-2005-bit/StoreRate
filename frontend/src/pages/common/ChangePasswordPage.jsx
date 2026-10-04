import React, { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import useToast from '../../hooks/useToast';

export const ChangePasswordPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { success } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const isLengthValid = formData.newPassword.length >= 8 && formData.newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.newPassword);

  const validate = () => {
    if (!formData.currentPassword) {
      setError('Please enter your current password.');
      return false;
    }

    if (!isLengthValid || !hasUppercase || !hasSpecial) {
      setError('New password must be 8–16 characters long and contain at least one uppercase letter and at least one special character.');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirmation password do not match.');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError('Your new password must be different from your current password.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await userService.changePassword(user.id, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      success('Your password has been changed successfully!');
      setSuccessMessage('Your password has been updated. Please use your new password next time you log in.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to update password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="form-card">
        <div className="form-card-header">
          <div className="form-card-icon">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h1 className="form-card-title">Change Password</h1>
            <p className="form-card-subtitle">
              Update your account password to maintain security.
            </p>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0 28px', paddingTop: '20px' }}>
            <div className="form-alert-error">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div style={{ padding: '0 28px', paddingTop: '20px' }}>
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-card-body">
            {/* Current Password */}
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type={showCurrent ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="form-input-toggle"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type={showNew ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new secure password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="form-input-toggle"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', fontSize: '0.6875rem', marginTop: '4px', color: 'var(--color-text-muted)' }}>
                <span style={{ color: isLengthValid ? 'var(--color-success)' : undefined, fontWeight: isLengthValid ? 700 : 400 }}>• 8–16 chars</span>
                <span style={{ color: hasUppercase ? 'var(--color-success)' : undefined, fontWeight: hasUppercase ? 700 : 400 }}>• 1 Uppercase</span>
                <span style={{ color: hasSpecial ? 'var(--color-success)' : undefined, fontWeight: hasSpecial ? 700 : 400 }}>• 1 Special character</span>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter new password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="form-input-toggle"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="form-card-footer">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
