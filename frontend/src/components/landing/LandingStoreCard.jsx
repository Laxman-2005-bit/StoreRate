import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

export const LandingStoreCard = ({ store }) => {
  const count = Number(store.total_ratings) || 0;
  const avg = Number(store.overall_rating) || 0;

  return (
    <article className="lp-store-card">
      <div className="lp-store-card-top">
        <h3 className="lp-store-name">{store.name}</h3>
        <p className="lp-store-address">
          <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{store.address}</span>
        </p>
      </div>

      <div className="lp-store-card-bottom">
        <div className="lp-store-rating" aria-label={count ? `Average rating ${avg.toFixed(1)} out of 5` : 'Not rated yet'}>
          <Star className="w-4 h-4" aria-hidden="true" />
          {count > 0 ? (
            <>
              <strong>{avg.toFixed(1)}</strong>
              <span>({count} {count === 1 ? 'rating' : 'ratings'})</span>
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
        <Link to="/login" className="btn btn-secondary btn-sm" aria-label={`Sign in to rate ${store.name}`}>Rate Store</Link>
      </div>
    </article>
  );
};

export default LandingStoreCard;
