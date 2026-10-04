import React from 'react';
import { Link } from 'react-router-dom';
import StoreRateBrand from '../common/StoreRateBrand';

export const LandingFooter = () => (
  <footer className="lp-footer">
    <div className="lp-container lp-footer-grid">
      <div className="lp-footer-brand">
        <StoreRateBrand tone="dark" size={28} />
        <p>Discover stores, compare ratings and make better decisions.</p>
      </div>

      <nav aria-label="Explore">
        <h3>Explore</h3>
        <ul>
          <li><a href="#stores">Discover Stores</a></li>
          <li><a href="#reviews">Reviews</a></li>
        </ul>
      </nav>

      <nav aria-label="Account">
        <h3>Account</h3>
        <ul>
          <li><Link to="/login">Sign In</Link></li>
          <li><Link to="/register">Create Account</Link></li>
        </ul>
      </nav>

      <nav aria-label="Business">
        <h3>Business</h3>
        <ul>
          <li><Link to="/login">Store Owner Login</Link></li>
        </ul>
      </nav>
    </div>
    <div className="lp-container lp-footer-copy">© {new Date().getFullYear()} StoreRate</div>
  </footer>
);

export default LandingFooter;
