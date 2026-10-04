import db from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

export const registerUser = async ({ name, email, address, password }) => {
  const existing = await db.query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
    [email.trim()]
  );

  if (existing.rows.length > 0) {
    const error = new Error('An account with this email address already exists. Please sign in.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const insertRes = await db.query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES (?, ?, ?, ?, ?)`,
    [name.trim(), email.toLowerCase().trim(), passwordHash, address.trim(), 'user']
  );

  const userId = insertRes.insertId;
  const userRes = await db.query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
    [userId]
  );
  const user = userRes.rows[0];
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const userRes = await db.query(
    'SELECT id, name, email, password_hash, address, role FROM users WHERE LOWER(email) = LOWER(?)',
    [email.trim()]
  );

  if (!userRes.rows || userRes.rows.length === 0) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const user = userRes.rows[0];
  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
    },
    token,
  };
};

export const getMe = async (userId) => {
  const res = await db.query(
    'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
    [userId]
  );
  if (!res.rows || res.rows.length === 0) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return res.rows[0];
};

export default {
  registerUser,
  loginUser,
  getMe,
};
