import db from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export const listUsers = async ({
  search = '',
  role = '',
  sortBy = 'created_at',
  sortOrder = 'desc',
  page = 1,
  limit = 10,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const allowedSortFields = {
    name: 'u.name',
    email: 'u.email',
    address: 'u.address',
    role: 'u.role',
    created_at: 'u.created_at',
  };
  const sortColumn = allowedSortFields[sortBy] || 'u.created_at';
  const orderDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  const conditions = [];
  const params = [];

  if (search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(
      `(LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.address) LIKE ?)`
    );
    params.push(`%${search.trim().toLowerCase()}%`);
    params.push(`%${search.trim().toLowerCase()}%`);
  }

  if (role && ['admin', 'user', 'owner'].includes(role.toLowerCase())) {
    params.push(role.toLowerCase());
    conditions.push(`u.role = ?`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count query
  const countRes = await db.query(`SELECT COUNT(DISTINCT u.id) as total FROM users u ${whereClause}`, params);
  const total = parseInt(countRes.rows[0]?.total || 0, 10);

  // Data query with store information for owners
  const dataParams = [...params, limitNum, offset];

  const dataSql = `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.address, 
      u.role, 
      u.created_at,
      s.id as store_id,
      s.name as store_name,
      COALESCE(ROUND(AVG(r.rating), 2), 0.0) as store_avg_rating,
      COUNT(r.id) as store_total_ratings
    FROM users u
    LEFT JOIN stores s ON s.owner_id = u.id
    LEFT JOIN ratings r ON r.store_id = s.id
    ${whereClause}
    GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at, s.id, s.name
    ORDER BY ${sortColumn} ${orderDirection}
    LIMIT ? OFFSET ?
  `;

  const dataRes = await db.query(dataSql, dataParams);

  return {
    users: dataRes.rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getUserDetails = async (id, requestingUser) => {
  if (requestingUser.role !== 'admin' && requestingUser.id !== parseInt(id, 10)) {
    const error = new Error('Access denied. You can only view your own profile.');
    error.statusCode = 403;
    throw error;
  }

  const res = await db.query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
    [id]
  );

  if (!res.rows || res.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const user = res.rows[0];

  // If Store Owner, display their owned store and overall rating
  if (user.role === 'owner') {
    const storeRes = await db.query(
      `SELECT 
        s.id, 
        s.name, 
        s.email, 
        s.address, 
        COALESCE(ROUND(AVG(r.rating), 2), 0.0) as average_rating,
        COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id, s.name, s.email, s.address`,
      [user.id]
    );
    if (storeRes.rows && storeRes.rows.length > 0) {
      user.store = {
        ...storeRes.rows[0],
        average_rating: parseFloat(storeRes.rows[0].average_rating || 0),
        total_ratings: parseInt(storeRes.rows[0].total_ratings || 0, 10),
      };
    } else {
      user.store = null;
    }
  } else if (user.role === 'user') {
    // Normal user: total ratings submitted
    const countRes = await db.query(
      'SELECT COUNT(*) as total_submitted_ratings FROM ratings WHERE user_id = ?',
      [user.id]
    );
    user.total_submitted_ratings = parseInt(countRes.rows[0]?.total_submitted_ratings || 0, 10);
  }

  return user;
};

export const createUser = async ({ name, email, password, address, role }) => {
  const existing = await db.query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
    [email.trim()]
  );
  if (existing.rows.length > 0) {
    const error = new Error('A user with this email address already exists.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const insertRes = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES (?, ?, ?, ?, ?)`,
    [name.trim(), email.toLowerCase().trim(), passwordHash, address.trim(), role]
  );

  const newUserId = insertRes.insertId;
  const userRes = await db.query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
    [newUserId]
  );

  return userRes.rows[0];
};

export const updateUser = async (id, { name, address, role }, requestingUser) => {
  const isSelf = requestingUser.id === parseInt(id, 10);
  const isAdmin = requestingUser.role === 'admin';

  if (!isAdmin && !isSelf) {
    const error = new Error('Access denied. You can only update your own profile.');
    error.statusCode = 403;
    throw error;
  }

  const existingRes = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  if (!existingRes.rows || existingRes.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const user = existingRes.rows[0];
  const updatedName = name ? name.trim() : user.name;
  const updatedAddress = address ? address.trim() : user.address;
  const updatedRole = isAdmin && role ? role : user.role;

  await db.query(
    `UPDATE users 
     SET name = ?, address = ?, role = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [updatedName, updatedAddress, updatedRole, id]
  );

  return {
    id: user.id,
    name: updatedName,
    email: user.email,
    address: updatedAddress,
    role: updatedRole,
  };
};

export const changeUserPassword = async (id, { currentPassword, newPassword }, requestingUser) => {
  const isSelf = requestingUser.id === parseInt(id, 10);
  const isAdmin = requestingUser.role === 'admin';

  if (!isSelf && !isAdmin) {
    const error = new Error('Access denied.');
    error.statusCode = 403;
    throw error;
  }

  const userRes = await db.query('SELECT id, password_hash FROM users WHERE id = ?', [id]);
  if (!userRes.rows || userRes.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  const user = userRes.rows[0];

  if (isSelf) {
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      const error = new Error('Current password does not match our records.');
      error.statusCode = 400;
      throw error;
    }
  }

  const newHash = await hashPassword(newPassword);

  await db.query(
    'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newHash, id]
  );

  return true;
};

export const listStoreOwners = async () => {
  const res = await db.query(
    `SELECT u.id, u.name, u.email, u.address, s.id as store_id, s.name as store_name
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     WHERE u.role = 'owner'
     ORDER BY u.name ASC`
  );
  return res.rows;
};

export default {
  listUsers,
  getUserDetails,
  createUser,
  updateUser,
  changeUserPassword,
  listStoreOwners,
};
