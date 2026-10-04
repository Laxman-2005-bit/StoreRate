import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', authenticate, authorize('admin'), dashboardController.getAdminDashboard);
router.get('/store-owner', authenticate, authorize('owner'), dashboardController.getStoreOwnerDashboard);
router.get('/user', authenticate, authorize('user'), dashboardController.getUserDashboard);

export default router;
