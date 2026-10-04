import React from 'react';

/**
 * StoreRate logo mark: a storefront (store), a star badge (rating)
 * and a check in the doorway (trust). Single source for every screen.
 */
export const StoreRateLogo = ({ size = 28, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="StoreRate"
  >
    <title>StoreRate</title>
    {/* Storefront body and roof */}
    <rect x="8" y="18" width="28" height="18" rx="3" fill="#4F46E5" />
    <path d="M6 19 L22 9 L38 19" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {/* Doorway with trust check */}
    <rect x="17" y="25" width="10" height="11" rx="1.5" fill="white" fillOpacity="0.9" />
    <path d="M19.8 30.6l1.7 1.7 3-3.4" stroke="#4F46E5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    {/* Rating star badge */}
    <circle cx="33" cy="13" r="7.5" fill="#F59E0B" />
    <path d="M33 9.2l.98 2.52 2.7.22-2.06 1.76.62 2.65L33 14.93l-2.24 1.42.62-2.65-2.06-1.76 2.7-.22L33 9.2z" fill="white" />
  </svg>
);

export default StoreRateLogo;
