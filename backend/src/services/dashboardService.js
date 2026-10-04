import db from '../config/db.js';

export const getAdminDashboardMetrics = async () => {
  // Total Users
  const usersRes = await db.query('SELECT COUNT(*) as count FROM users');
  const totalUsers = parseInt(usersRes.rows[0]?.count || 0, 10);

  // Total Stores
  const storesRes = await db.query('SELECT COUNT(*) as count FROM stores');
  const totalStores = parseInt(storesRes.rows[0]?.count || 0, 10);

  // Total Ratings
  const ratingsRes = await db.query('SELECT COUNT(*) as count FROM ratings');
  const totalRatings = parseInt(ratingsRes.rows[0]?.count || 0, 10);

  // Average of all submitted ratings
  const avgRes = await db.query(
    'SELECT COALESCE(ROUND(AVG(rating), 2), 0.0) as average_rating FROM ratings'
  );
  const averageRating = parseFloat(avgRes.rows[0]?.average_rating || 0);

  // Role Breakdown
  const rolesRes = await db.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
  const roleBreakdown = { admin: 0, user: 0, owner: 0 };
  rolesRes.rows.forEach((r) => {
    roleBreakdown[r.role] = parseInt(r.count, 10);
  });

  // Recent 5 Ratings Activity Feed
  const recentRatingsRes = await db.query(
    `SELECT 
      r.id,
      r.rating,
      r.created_at,
      u.name as user_name,
      u.email as user_email,
      s.name as store_name
     FROM ratings r
     JOIN users u ON u.id = r.user_id
     JOIN stores s ON s.id = r.store_id
     ORDER BY r.created_at DESC
     LIMIT 5`
  );

  // Top Rated Stores
  const topStoresRes = await db.query(
    `SELECT 
      s.id,
      s.name,
      s.address,
      COALESCE(ROUND(AVG(r.rating), 2), 0.0) as average_rating,
      COUNT(r.id) as ratings_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     GROUP BY s.id, s.name, s.address
     ORDER BY average_rating DESC, ratings_count DESC
     LIMIT 5`
  );

  return {
    stats: {
      totalUsers,
      totalStores,
      totalRatings,
      averageRating,
      roleBreakdown,
    },
    recentRatings: recentRatingsRes.rows,
    topStores: topStoresRes.rows,
  };
};

export const getStoreOwnerDashboardMetrics = async (ownerId, { sortBy = 'created_at', sortOrder = 'desc' }) => {
  const storeRes = await db.query(
    `SELECT id, name, email, address, created_at FROM stores WHERE owner_id = ?`,
    [ownerId]
  );

  if (!storeRes.rows || storeRes.rows.length === 0) {
    return {
      hasStore: false,
      store: null,
      stats: {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      },
      ratings: [],
    };
  }

  const store = storeRes.rows[0];
  const storeId = store.id;

  // Prominent Average Rating & Total Ratings
  const avgRes = await db.query(
    `SELECT COALESCE(ROUND(AVG(rating), 2), 0.0) as average_rating, COUNT(id) as total_ratings 
     FROM ratings WHERE store_id = ?`,
    [storeId]
  );

  const averageRating = parseFloat(avgRes.rows[0]?.average_rating || 0);
  const totalRatings = parseInt(avgRes.rows[0]?.total_ratings || 0, 10);

  // Rating Distribution (5, 4, 3, 2, 1)
  const distRes = await db.query(
    `SELECT rating, COUNT(id) as count FROM ratings WHERE store_id = ? GROUP BY rating`,
    [storeId]
  );
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distRes.rows.forEach((r) => {
    ratingDistribution[r.rating] = parseInt(r.count, 10);
  });

  // Customer ratings table
  const allowedSortFields = {
    customer_name: 'u.name',
    user_name: 'u.name',
    customer_email: 'u.email',
    user_email: 'u.email',
    rating: 'r.rating',
    created_at: 'r.created_at',
  };
  const sortColumn = allowedSortFields[sortBy] || 'r.created_at';
  const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const ratingsSql = `
    SELECT 
      r.id,
      r.rating,
      r.created_at,
      r.updated_at,
      u.name as user_name,
      u.name as customer_name,
      u.email as user_email,
      u.email as customer_email,
      u.address as user_address,
      u.address as customer_address
    FROM ratings r
    JOIN users u ON u.id = r.user_id
    WHERE r.store_id = ?
    ORDER BY ${sortColumn} ${orderDirection}
  `;

  const ratingsRes = await db.query(ratingsSql, [storeId]);

  return {
    hasStore: true,
    store,
    stats: {
      averageRating,
      totalRatings,
      ratingDistribution,
    },
    ratings: ratingsRes.rows,
  };
};

export const getUserDashboardMetrics = async (userId) => {
  // Stores Available
  const storesRes = await db.query('SELECT COUNT(*) as count FROM stores');
  const storesAvailable = parseInt(storesRes.rows[0]?.count || 0, 10);

  // User's Submitted Ratings & Average
  const ratingsRes = await db.query(
    'SELECT COUNT(*) as count, COALESCE(ROUND(AVG(rating), 2), 0.0) as avg_rating FROM ratings WHERE user_id = ?',
    [userId]
  );
  const ratingsSubmitted = parseInt(ratingsRes.rows[0]?.count || 0, 10);
  const averageRatingGiven = parseFloat(ratingsRes.rows[0]?.avg_rating || 0);

  // Recent 5 Stores Rated by User
  const recentRes = await db.query(
    `SELECT 
      r.id,
      r.rating,
      r.created_at,
      r.updated_at,
      s.id as store_id,
      s.name as store_name,
      s.address as store_address,
      COALESCE(ROUND(AVG(all_r.rating), 2), 0.0) as store_overall_rating
     FROM ratings r
     JOIN stores s ON s.id = r.store_id
     LEFT JOIN ratings all_r ON all_r.store_id = s.id
     WHERE r.user_id = ?
     GROUP BY r.id, r.rating, r.created_at, r.updated_at, s.id, s.name, s.address
     ORDER BY r.updated_at DESC
     LIMIT 5`,
    [userId]
  );

  return {
    stats: {
      storesAvailable,
      ratingsSubmitted,
      averageRatingGiven,
    },
    recentRatings: recentRes.rows,
  };
};

export default {
  getAdminDashboardMetrics,
  getStoreOwnerDashboardMetrics,
  getUserDashboardMetrics,
};
