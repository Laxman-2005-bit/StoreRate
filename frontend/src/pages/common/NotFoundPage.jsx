import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import StoreRateBrand from '../../components/common/StoreRateBrand';

export const NotFoundPage = () => {
  const { user, getDashboardPath } = useAuth();
  const homePath = user ? getDashboardPath(user.role) : '/';
  const buttonLabel = user ? 'Return to Dashboard' : 'Back to Home';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', backgroundColor: 'var(--color-bg-body)' }}>
      <div style={{ marginBottom: '24px' }}>
        <StoreRateBrand size={32} />
      </div>
      <div className="form-card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px', textAlign: 'center' }}>
        <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1, display: 'block', marginBottom: '12px' }}>404</span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em', marginBottom: '8px' }}>Page Not Found</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '24px' }}>
          The requested page could not be found or does not exist.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link
            to={homePath}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            <Home className="w-4 h-4" />
            <span>{buttonLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
