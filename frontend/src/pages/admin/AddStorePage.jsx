import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Mail, MapPin, User, ArrowLeft, PlusCircle, AlertCircle } from 'lucide-react';
import storeService from '../../services/storeService';
import userService from '../../services/userService';
import useToast from '../../hooks/useToast';

export const AddStorePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: '',
  });

  const [owners, setOwners] = useState([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await userService.getStoreOwners();
        if (res.success && res.data) {
          setOwners(res.data.owners);
          if (res.data.owners.length > 0) {
            setFormData((prev) => ({ ...prev, owner_id: res.data.owners[0].id }));
          }
        }
      } catch (err) {
        toastError('Failed to load store owners.');
      } finally {
        setIsLoadingOwners(false);
      }
    };

    fetchOwners();
  }, [toastError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.name.trim()) {
      setError('Store Name is required.');
      return false;
    }
    if (formData.name.trim().length < 2 || formData.name.trim().length > 255) {
      setError('Store Name must be between 2 and 255 characters.');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Store Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid store email address.');
      return false;
    }

    if (!formData.address.trim()) {
      setError('Store Address is required.');
      return false;
    }
    if (formData.address.trim().length < 5 || formData.address.trim().length > 400) {
      setError('Store Address must be between 5 and 400 characters.');
      return false;
    }

    if (!formData.owner_id) {
      setError('Please select an authorized Store Owner.');
      return false;
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
      await storeService.createStore({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        owner_id: parseInt(formData.owner_id, 10),
      });

      success(`Store "${formData.name.trim()}" registered successfully!`);
      navigate('/admin/stores');
    } catch (err) {
      setError(err.message || 'Failed to create store.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Back button */}
      <div>
        <Link
          to="/admin/stores"
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: '0' }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Stores</span>
        </Link>
      </div>

      <div className="form-card">
        <div className="form-card-header">
          <div className="form-card-icon">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="form-card-title">Add Store</h1>
            <p className="form-card-subtitle">
              Register a new store and assign it to a Store Owner.
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

        <form onSubmit={handleSubmit}>
          <div className="form-card-body">
            {/* Store Name */}
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <div className="form-input-wrapper">
                <Store className="form-input-icon" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Apex Electronics & Gadgets"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Store Email */}
            <div className="form-group">
              <label className="form-label">Store Email Address</label>
              <div className="form-input-wrapper">
                <Mail className="form-input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@business.com"
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Store Address */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Store Physical Address</label>
                <span className="form-char-count">{formData.address.length}/400</span>
              </div>
              <div className="form-input-wrapper">
                <MapPin className="form-input-icon top" />
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Complete store location, street, city..."
                  className="form-textarea"
                  required
                />
              </div>
            </div>

            {/* Store Owner Selection */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Assigned Store Owner</label>
                <Link to="/admin/users?add=1" style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  + Create Store Owner User
                </Link>
              </div>
              <div className="form-input-wrapper">
                <User className="form-input-icon" />
                <select
                  name="owner_id"
                  value={formData.owner_id}
                  onChange={handleChange}
                  disabled={isLoadingOwners || owners.length === 0}
                  className="form-select"
                  required
                >
                  {owners.length === 0 ? (
                    <option value="">No Store Owners available. Please add a Store Owner first.</option>
                  ) : (
                    owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <span className="form-char-count">Select an account holding the Store Owner role.</span>
            </div>
          </div>

          <div className="form-card-footer">
            <Link
              to="/admin/stores"
              className="btn btn-secondary"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || owners.length === 0}
              className="btn btn-primary"
            >
              {isSubmitting ? (
                <span>Registering Store...</span>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Store</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStorePage;
