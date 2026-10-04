import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Star, MessageSquare, Eye, ArrowRight } from 'lucide-react';
import storeService from '../../services/storeService';
import LandingHeader from '../../components/landing/LandingHeader';
import LandingFooter from '../../components/landing/LandingFooter';
import LandingStoreCard from '../../components/landing/LandingStoreCard';

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Genuine ratings', text: 'Every rating comes from a registered user, one rating per store.' },
  { icon: Star, title: '1–5 star ratings', text: 'A simple scale that is the same for every store.' },
  { icon: MessageSquare, title: 'Real customer feedback', text: 'Scores come from people who signed up and rated.' },
  { icon: Eye, title: 'Transparent ratings', text: 'Averages and rating counts are shown side by side.' },
];

/**
 * Public homepage. All numbers are calculated from the live store API;
 * nothing on this page is hard-coded sample data.
 */
export const LandingPage = () => {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overview, setOverview] = useState(null);

  // Aggregate figures, derived from every store's real rating data
  useEffect(() => {
    let active = true;
    storeService
      .getStores({ limit: 100 })
      .then((res) => {
        if (!active) return;
        const all = res?.data?.stores || [];
        const totalRatings = all.reduce((sum, s) => sum + (Number(s.total_ratings) || 0), 0);
        const weighted = all.reduce(
          (sum, s) => sum + (Number(s.overall_rating) || 0) * (Number(s.total_ratings) || 0),
          0
        );
        setOverview({
          stores: res?.data?.pagination?.total ?? all.length,
          ratings: totalRatings,
          average: totalRatings > 0 ? weighted / totalRatings : 0,
        });
      })
      .catch(() => active && setOverview(null));
    return () => { active = false; };
  }, []);

  // Top rated stores / search results
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    storeService
      .getStores({ search, sortBy: 'rating', sortOrder: 'desc', limit: 6 })
      .then((res) => active && setStores(res?.data?.stores || []))
      .catch((err) => active && setError(err.message || 'Unable to load stores.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(query.trim());
    document.getElementById('stores')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="lp-shell">
      <LandingHeader />

      <main>
        {/* Hero + search */}
        <section className="lp-hero">
          <div className="lp-container lp-hero-inner">
            <h1 className="lp-hero-title">
              Discover better <span>places</span>.
            </h1>
            <p className="lp-hero-text">
              StoreRate helps you discover stores, compare ratings from real users and make better decisions before you visit.
            </p>

            <form className="lp-search" onSubmit={handleSearch} role="search">
              <Search className="lp-search-icon" aria-hidden="true" />
              <input
                type="search"
                className="lp-search-input"
                placeholder="Search by store name or address"
                aria-label="Search stores by name or address"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search Stores</button>
            </form>
          </div>
        </section>

        {/* Top rated / search results */}
        <section className="lp-section" id="stores">
          <div className="lp-container">
            <div className="lp-section-head">
              <div>
                <h2 className="lp-section-title">{search ? 'Search results' : 'Top rated stores'}</h2>
                <p className="lp-section-sub">
                  {search ? `Stores matching “${search}”` : 'Highest average ratings first.'}
                </p>
              </div>
              {search && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setQuery(''); setSearch(''); }}>
                  Clear search
                </button>
              )}
            </div>

            {loading ? (
              <p className="lp-muted">Loading stores…</p>
            ) : error ? (
              <p className="lp-error" role="alert">{error}</p>
            ) : stores.length === 0 ? (
              <p className="lp-muted">{search ? 'No stores match your search.' : 'No stores have been added yet.'}</p>
            ) : (
              <div className="lp-store-grid">
                {stores.map((s) => <LandingStoreCard key={s.id} store={s} />)}
              </div>
            )}
          </div>
        </section>

        {/* Ratings / trust */}
        <section className="lp-section lp-section-alt">
          <div className="lp-container">
            <div className="lp-section-head">
              <div>
                <h2 className="lp-section-title">Ratings with integrity</h2>
                <p className="lp-section-sub">How StoreRate keeps ratings honest.</p>
              </div>
            </div>
            <div className="lp-trust-grid">
              {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="lp-trust-item">
                  <div className="lp-trust-icon"><Icon className="w-5 h-5" aria-hidden="true" /></div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customer ratings: numeric only, calculated from the database */}
        <section className="lp-section" id="reviews">
          <div className="lp-container">
            <div className="lp-section-head">
              <div>
                <h2 className="lp-section-title">Customer ratings</h2>
                <p className="lp-section-sub">
                  StoreRate collects star ratings only, so these figures come straight from submitted ratings.
                </p>
              </div>
            </div>

            {overview && overview.ratings > 0 ? (
              <div className="lp-overview">
                <div className="lp-overview-item">
                  <strong>{overview.average.toFixed(1)} <Star className="w-5 h-5" aria-hidden="true" /></strong>
                  <span>Average rating</span>
                </div>
                <div className="lp-overview-item">
                  <strong>{overview.ratings}</strong>
                  <span>{overview.ratings === 1 ? 'Rating submitted' : 'Ratings submitted'}</span>
                </div>
                <div className="lp-overview-item">
                  <strong>{overview.stores}</strong>
                  <span>{overview.stores === 1 ? 'Store listed' : 'Stores listed'}</span>
                </div>
              </div>
            ) : (
              <p className="lp-muted">No ratings have been submitted yet.</p>
            )}
          </div>
        </section>

        {/* Store owners */}
        <section className="lp-section">
          <div className="lp-container">
            <div className="lp-owner">
              <div>
                <h2>Grow your business with real feedback.</h2>
                <p>
                  Store owners can monitor their store rating, view the ratings users have submitted and understand customer feedback.
                </p>
              </div>
              <Link to="/login" className="btn btn-primary btn-lg">
                Store Owner Login <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
