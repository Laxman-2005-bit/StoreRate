import express from 'express';
import ratingController from '../controllers/ratingController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get ratings submitted by the current authenticated user
router.get('/my-ratings', authenticate, authorize('user'), ratingController.getMyRatings);

export default router;
