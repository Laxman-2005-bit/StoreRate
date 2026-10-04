import db from '../config/db.js';

export const submitRating = async (storeId, rating, userId) => {
  const storeRes = await db.query('SELECT id, name FROM stores WHERE id = ?', [storeId]);
  if (!storeRes.rows || storeRes.rows.length === 0) {
    const error = new Error('Store not found.');
    error.statusCode = 404;
    throw error;
  }

  // Prevent duplicate rating
  const existing = await db.query(
    'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?',
    [userId, storeId]
  );

  if (existing.rows.length > 0) {
    const error = new Error('You have already rated this store. Please modify your existing rating instead.');
    error.statusCode = 409;
    error.data = { existingRatingId: existing.rows[0].id, currentRating: existing.rows[0].rating };
    throw error;
  }

  const insertRes = await db.query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES (?, ?, ?)`,
    [userId, storeId, rating]
  );

  const ratingId = insertRes.insertId;
  const newRatingRes = await db.query(
    'SELECT id, user_id, store_id, rating, created_at, updated_at FROM ratings WHERE id = ?',
    [ratingId]
  );
  const newRating = newRatingRes.rows[0];

  // Calculate updated store overall metrics
  const avgRes = await db.query(
    `SELECT COALESCE(ROUND(AVG(rating), 2), 0.0) as average_rating, COUNT(id) as total_ratings 
     FROM ratings WHERE store_id = ?`,
    [storeId]
  );

  return {
    rating: newRating,
    overallRating: parseFloat(avgRes.rows[0]?.average_rating || 0),
    totalRatings: parseInt(avgRes.rows[0]?.total_ratings || 0, 10),
  };
};

export const updateRating = async (storeId, ratingId, rating, userId) => {
  const ratingRes = await db.query(
    'SELECT id, user_id, store_id FROM ratings WHERE id = ? AND store_id = ?',
    [ratingId, storeId]
  );

  if (!ratingRes.rows || ratingRes.rows.length === 0) {
    const error = new Error('Rating record not found for this store.');
    error.statusCode = 404;
    throw error;
  }

  if (ratingRes.rows[0].user_id !== userId) {
    const error = new Error('Forbidden: You can only modify your own rating.');
    error.statusCode = 403;
    throw error;
  }

  await db.query(
    `UPDATE ratings 
     SET rating = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [rating, ratingId]
  );

  const avgRes = await db.query(
    `SELECT COALESCE(ROUND(AVG(rating), 2), 0.0) as average_rating, COUNT(id) as total_ratings 
     FROM ratings WHERE store_id = ?`,
    [storeId]
  );

  return {
    ratingId: parseInt(ratingId, 10),
    newRating: rating,
    overallRating: parseFloat(avgRes.rows[0]?.average_rating || 0),
    totalRatings: parseInt(avgRes.rows[0]?.total_ratings || 0, 10),
  };
};

export const getMyRatings = async (userId) => {
  const sql = `
    SELECT 
      r.id,
      r.rating,
      r.created_at,
      r.updated_at,
      s.id as store_id,
      s.name as store_name,
      s.address as store_address,
      s.email as store_email,
      COALESCE(ROUND(AVG(all_r.rating), 2), 0.0) as store_overall_rating
    FROM ratings r
    JOIN stores s ON s.id = r.store_id
    LEFT JOIN ratings all_r ON all_r.store_id = s.id
    WHERE r.user_id = ?
    GROUP BY r.id, r.rating, r.created_at, r.updated_at, s.id, s.name, s.address, s.email
    ORDER BY r.updated_at DESC
  `;

  const res = await db.query(sql, [userId]);
  return res.rows;
};

export const getStoreRatings = async (storeId, requestingUser, { sortBy = 'created_at', sortOrder = 'desc' }) => {
  const storeRes = await db.query('SELECT id, name, owner_id FROM stores WHERE id = ?', [storeId]);
  if (!storeRes.rows || storeRes.rows.length === 0) {
    const error = new Error('Store not found.');
    error.statusCode = 404;
    throw error;
  }

  if (requestingUser.role === 'owner' && requestingUser.id !== storeRes.rows[0].owner_id) {
    const error = new Error('Access denied: Store owners can only view ratings for their own store.');
    error.statusCode = 403;
    throw error;
  }

  const allowedSortFields = {
    user_name: 'u.name',
    user_email: 'u.email',
    rating: 'r.rating',
    created_at: 'r.created_at',
  };
  const sortColumn = allowedSortFields[sortBy] || 'r.created_at';
  const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const sql = `
    SELECT 
      r.id,
      r.rating,
      r.created_at,
      r.updated_at,
      u.name as user_name,
      u.email as user_email
    FROM ratings r
    JOIN users u ON u.id = r.user_id
    WHERE r.store_id = ?
    ORDER BY ${sortColumn} ${orderDirection}
  `;

  const ratingsRes = await db.query(sql, [storeId]);
  const avgRes = await db.query(
    `SELECT COALESCE(ROUND(AVG(rating), 2), 0.0) as average_rating, COUNT(id) as total_ratings 
     FROM ratings WHERE store_id = ?`,
    [storeId]
  );

  return {
    store: storeRes.rows[0],
    average_rating: parseFloat(avgRes.rows[0]?.average_rating || 0),
    total_ratings: parseInt(avgRes.rows[0]?.total_ratings || 0, 10),
    ratings: ratingsRes.rows,
  };
};

export default {
  submitRating,
  updateRating,
  getMyRatings,
  getStoreRatings,
};
