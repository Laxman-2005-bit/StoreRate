import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import StoreRateBrand from '../common/StoreRateBrand';

const NAV = [
  { href: '#stores', label: 'Discover Stores' },
  { href: '#reviews', label: 'Reviews' },
];

export const LandingHeader = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="lp-header">
      <div className="lp-container lp-header-inner">
        <StoreRateBrand size={30} />

        <nav className="lp-nav" aria-label="Primary">
          {NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
        </nav>

        <div className="lp-header-actions">
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Create Account</Link>
        </div>

        <button
          type="button"
          className="lp-menu-btn"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="lp-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <nav id="lp-mobile-menu" className="lp-mobile-menu" aria-label="Mobile">
          {NAV.map((n) => <a key={n.href} href={n.href} onClick={close}>{n.label}</a>)}
          <Link to="/login" onClick={close}>Sign In</Link>
          <Link to="/register" onClick={close}>Create Account</Link>
        </nav>
      )}
    </header>
  );
};

export default LandingHeader;
