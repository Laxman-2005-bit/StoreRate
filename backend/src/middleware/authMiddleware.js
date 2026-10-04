import { verifyToken } from '../utils/jwt.js';
import db from '../config/db.js';
import { authorizeRole } from './roleMiddleware.js';

/**
 * Authentication middleware checking JWT Bearer token
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please provide a valid session token.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please sign in again.',
      });
    }

    const userRes = await db.query(
      'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!userRes.rows || userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.',
      });
    }

    req.user = userRes.rows[0];
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication check.',
    });
  }
};

/**
 * Optional authentication middleware for public endpoints with personalized context
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token);
        const userRes = await db.query(
          'SELECT id, name, email, address, role FROM users WHERE id = ?',
          [decoded.id]
        );
        if (userRes.rows && userRes.rows.length > 0) {
          req.user = userRes.rows[0];
        }
      } catch {
        // Continue silently if token is invalid or expired
      }
    }
    next();
  } catch {
    next();
  }
};

export const authorize = authorizeRole;

export default {
  authenticate,
  optionalAuth,
  authorize,
};
