import db from '../config/db.js';

export const listStores = async ({
  search = '',
  sortBy = 'name',
  sortOrder = 'asc',
  page = 1,
  limit = 10,
  currentUserId = null,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const allowedSortFields = {
    name: 's.name',
    email: 's.email',
    address: 's.address',
    rating: 'overall_rating',
    created_at: 's.created_at',
  };
  const sortColumn = allowedSortFields[sortBy] || 's.name';
  const orderDirection = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const conditions = [];
  const params = [];

  if (search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    params.push(`%${search.trim().toLowerCase()}%`);
    params.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(
      `(LOWER(s.name) LIKE ? OR LOWER(s.email) LIKE ? OR LOWER(s.address) LIKE ?)`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countRes = await db.query(`SELECT COUNT(*) as total FROM stores s ${whereClause}`, params);
  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  let userRatingSelect = 'NULL as user_rating, NULL as user_rating_id, NULL as user_rated_at';
  let userRatingJoin = '';
  // Placeholder order must match the SQL: the user-rating JOIN (?) comes before the WHERE clause
  const dataParams = currentUserId ? [currentUserId, ...params] : [...params];

  if (currentUserId) {
    userRatingSelect = 'ur.rating as user_rating, ur.id as user_rating_id, ur.updated_at as user_rated_at';
    userRatingJoin = `LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?`;
  }

  dataParams.push(limitNum);
  dataParams.push(offset);

  const dataSql = `
    SELECT 
      s.id,
      s.name,
      s.email,
      s.address,
      s.owner_id,
      s.created_at,
      u.name as owner_name,
      u.email as owner_email,
      COALESCE(ROUND(AVG(r.rating), 2), 0.0) as overall_rating,
      COUNT(r.id) as total_ratings,
      ${userRatingSelect}
    FROM stores s
    JOIN users u ON u.id = s.owner_id
    LEFT JOIN ratings r ON r.store_id = s.id
    ${userRatingJoin}
    ${whereClause}
    GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, u.name, u.email
    ${currentUserId ? ', ur.rating, ur.id, ur.updated_at' : ''}
    ORDER BY ${sortColumn} ${orderDirection}
    LIMIT ? OFFSET ?
  `;

  const dataRes = await db.query(dataSql, dataParams);

  return {
    stores: dataRes.rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getStoreById = async (id, currentUserId = null) => {
  let userRatingSelect = 'NULL as user_rating, NULL as user_rating_id';
  let userRatingJoin = '';
  const params = [];

  if (currentUserId) {
    params.push(currentUserId);
    userRatingSelect = 'ur.rating as user_rating, ur.id as user_rating_id';
    userRatingJoin = `LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?`;
  }

  params.push(id);

  const sql = `
    SELECT 
      s.id,
      s.name,
      s.email,
      s.address,
      s.owner_id,
      s.created_at,
      u.name as owner_name,
      u.email as owner_email,
      u.address as owner_address,
      COALESCE(ROUND(AVG(r.rating), 2), 0.0) as overall_rating,
      COUNT(r.id) as total_ratings,
      ${userRatingSelect}
    FROM stores s
    JOIN users u ON u.id = s.owner_id
    LEFT JOIN ratings r ON r.store_id = s.id
    ${userRatingJoin}
    WHERE s.id = ?
    GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, u.name, u.email, u.address
    ${currentUserId ? ', ur.rating, ur.id' : ''}
  `;

  const res = await db.query(sql, params);
  if (!res.rows || res.rows.length === 0) {
    const error = new Error('Store not found.');
    error.statusCode = 404;
    throw error;
  }
  return res.rows[0];
};

export const createStore = async ({ name, email, address, owner_id }) => {
  // Validate owner existence and role
  const ownerRes = await db.query('SELECT id, role, name FROM users WHERE id = ?', [owner_id]);
  if (!ownerRes.rows || ownerRes.rows.length === 0) {
    const error = new Error('Selected store owner does not exist.');
    error.statusCode = 400;
    throw error;
  }

  if (ownerRes.rows[0].role !== 'owner') {
    const error = new Error('The selected user must have the Store Owner role.');
    error.statusCode = 400;
    throw error;
  }

  // Enforce one store per owner
  const existingStore = await db.query('SELECT id, name FROM stores WHERE owner_id = ?', [owner_id]);
  if (existingStore.rows.length > 0) {
    const error = new Error(`This owner already manages "${existingStore.rows[0].name}". Each owner may manage one store.`);
    error.statusCode = 409;
    throw error;
  }

  const insertRes = await db.query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES (?, ?, ?, ?)`,
    [name.trim(), email.toLowerCase().trim(), address.trim(), owner_id]
  );

  const newStoreId = insertRes.insertId;
  const storeRes = await db.query(
    'SELECT id, name, email, address, owner_id, created_at FROM stores WHERE id = ?',
    [newStoreId]
  );

  return storeRes.rows[0];
};

export const updateStore = async (id, { name, email, address, owner_id }) => {
  const existingRes = await db.query('SELECT * FROM stores WHERE id = ?', [id]);
  if (!existingRes.rows || existingRes.rows.length === 0) {
    const error = new Error('Store not found.');
    error.statusCode = 404;
    throw error;
  }

  const existing = existingRes.rows[0];
  let targetOwnerId = existing.owner_id;

  if (owner_id && parseInt(owner_id, 10) !== existing.owner_id) {
    const ownerRes = await db.query('SELECT id, role FROM users WHERE id = ?', [owner_id]);
    if (!ownerRes.rows || ownerRes.rows.length === 0 || ownerRes.rows[0].role !== 'owner') {
      const error = new Error('Selected user is not a valid Store Owner.');
      error.statusCode = 400;
      throw error;
    }

    const assigned = await db.query('SELECT id, name FROM stores WHERE owner_id = ? AND id != ?', [owner_id, id]);
    if (assigned.rows.length > 0) {
      const error = new Error('Selected owner already manages another store.');
      error.statusCode = 409;
      throw error;
    }
    targetOwnerId = owner_id;
  }

  const updatedName = name ? name.trim() : existing.name;
  const updatedEmail = email ? email.toLowerCase().trim() : existing.email;
  const updatedAddress = address ? address.trim() : existing.address;

  await db.query(
    `UPDATE stores 
     SET name = ?, email = ?, address = ?, owner_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [updatedName, updatedEmail, updatedAddress, targetOwnerId, id]
  );

  return {
    id,
    name: updatedName,
    email: updatedEmail,
    address: updatedAddress,
    owner_id: targetOwnerId,
  };
};

export const deleteStore = async (id) => {
  const existing = await db.query('SELECT id FROM stores WHERE id = ?', [id]);
  if (!existing.rows || existing.rows.length === 0) {
    const error = new Error('Store not found.');
    error.statusCode = 404;
    throw error;
  }

  await db.query('DELETE FROM stores WHERE id = ?', [id]);
  return true;
};

export default {
  listStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
};
