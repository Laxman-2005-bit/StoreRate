import dashboardService from '../services/dashboardService.js';

/**
 * Admin Dashboard statistics
 */
export const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboardMetrics();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Store Owner Dashboard statistics & ratings list
 * The Store Owner must ONLY see rating information related to their own store.
 */
export const getStoreOwnerDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const data = await dashboardService.getStoreOwnerDashboardMetrics(ownerId, {
      sortBy,
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Normal User Dashboard overview
 */
export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = await dashboardService.getUserDashboardMetrics(userId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAdminDashboard,
  getStoreOwnerDashboard,
  getUserDashboard,
};
