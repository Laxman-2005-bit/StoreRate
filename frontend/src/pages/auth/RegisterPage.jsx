import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Lock, Eye, EyeOff, UserPlus, AlertCircle, Info, CheckCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import StoreRateBrand from '../../components/common/StoreRateBrand';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const isLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password);

  const isNameValid = formData.name.trim().length >= 20 && formData.name.trim().length <= 60;
  const isAddressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;

  const validateForm = () => {
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setError('Please enter your full name.');
      return false;
    }
    if (trimmedName.length < 20 || trimmedName.length > 60) {
      setError(`Name must be between 20 and 60 characters long (currently ${trimmedName.length} characters).`);
      return false;
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }

    const trimmedAddress = formData.address.trim();
    if (!trimmedAddress) {
      setError('Please enter your address.');
      return false;
    }
    if (trimmedAddress.length > 400) {
      setError('Address cannot exceed 400 characters.');
      return false;
    }

    if (!isLengthValid || !hasUppercase || !hasSpecial) {
      setError('Password must be 8–16 characters with at least one uppercase letter and one special character.');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const { user, dashboardPath } = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password,
      });

      success(`Account created successfully! Welcome, ${user.name}`);
      navigate(dashboardPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the information provided.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        {/* Header with Logo */}
        <header className="auth-header" style={{ justifyContent: 'center' }}>
          <StoreRateBrand size={32} />
        </header>

        {/* Informative Banner */}
        <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: '#eef2ff', border: '1px solid #c7d2fe', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.75rem', color: '#312e81', marginBottom: '16px' }}>
          <Info className="w-4 h-4 shrink-0 text-indigo-600 mt-0.5" />
          <p>
            <strong>Role: User (Normal User)</strong> — Self-registration is for normal users to browse stores, evaluate services, and submit ratings from 1 to 5 stars.
          </p>
        </div>

        {/* Registration Card */}
        <div className="register-card-container">
          <h1 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
            Create Account
          </h1>
          <p className="auth-subtitle" style={{ marginBottom: '20px' }}>
            Enter your details to register as a Normal User
          </p>

          {error && (
            <div className="form-alert-error" style={{ marginBottom: '16px' }}>
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Full Name</label>
                <span className="form-char-count" style={{ color: isNameValid ? 'var(--color-success)' : undefined }}>
                  {formData.name.trim().length}/60 (20–60 chars)
                </span>
              </div>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Christopher Johnathan Davis"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <Mail className="form-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Physical Address</label>
                <span className="form-char-count" style={{ color: isAddressValid ? 'var(--color-success)' : undefined }}>
                  {formData.address.trim().length}/400 max
                </span>
              </div>
              <div className="form-input-wrapper">
                <MapPin className="form-input-icon top" />
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your residential address"
                  className="form-textarea"
                  style={{ minHeight: '65px' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrapper">
                <Lock className="form-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create your password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="form-input-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Checklist */}
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.6875rem', marginTop: '4px', color: 'var(--color-text-muted)' }}>
                <span style={{ color: isLengthValid ? 'var(--color-success)' : undefined, fontWeight: isLengthValid ? 700 : 400 }}>
                  • 8–16 chars
                </span>
                <span style={{ color: hasUppercase ? 'var(--color-success)' : undefined, fontWeight: hasUppercase ? 700 : 400 }}>
                  • 1 Uppercase
                </span>
                <span style={{ color: hasSpecial ? 'var(--color-success)' : undefined, fontWeight: hasSpecial ? 700 : 400 }}>
                  • 1 Special char
                </span>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '4px' }}
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
