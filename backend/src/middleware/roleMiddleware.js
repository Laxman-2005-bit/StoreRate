/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles ('admin', 'user', 'owner')
 */
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied. This action requires one of the following roles: [${roles.join(', ')}].`,
      });
    }

    next();
  };
};

export default authorizeRole;
