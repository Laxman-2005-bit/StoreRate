import React from 'react';
import { Link } from 'react-router-dom';
import StoreRateLogo from './StoreRateLogo';

/**
 * Logo + wordmark link, used by the landing page, auth pages,
 * dashboard navbar and sidebar so branding stays identical everywhere.
 * tone: "light" (on white backgrounds) | "dark" (on the navy sidebar/footer)
 */
export const StoreRateBrand = ({ tone = 'light', size = 28, to = '/', className = '', onClick }) => (
  <Link to={to} onClick={onClick} className={`sr-brand sr-brand--${tone} ${className}`} aria-label="StoreRate home">
    <StoreRateLogo size={size} />
    <span className="sr-brand-text" aria-hidden="true">
      Store<span>Rate</span>
    </span>
  </Link>
);

export default StoreRateBrand;
