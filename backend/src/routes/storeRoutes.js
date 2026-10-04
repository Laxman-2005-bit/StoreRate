import express from 'express';
import storeController from '../controllers/storeController.js';
import ratingController from '../controllers/ratingController.js';
import { authenticate, optionalAuth, authorize } from '../middleware/authMiddleware.js';
import { validateCreateStore, validateUpdateStore } from '../validators/storeValidator.js';
import { validateRating } from '../validators/ratingValidator.js';

const router = express.Router();

// Store ratings sub-routes (Placed before or matching parameter patterns)
router.get('/:storeId/ratings', authenticate, ratingController.getStoreRatings);
router.post('/:storeId/ratings', authenticate, authorize('user'), validateRating, ratingController.submitRating);
router.put('/:storeId/ratings/:ratingId', authenticate, authorize('user'), validateRating, ratingController.updateRating);

// Store routes
router.get('/', optionalAuth, storeController.getStores);
router.get('/:id', optionalAuth, storeController.getStoreById);
router.post('/', authenticate, authorize('admin'), validateCreateStore, storeController.createStore);
router.put('/:id', authenticate, authorize('admin'), validateUpdateStore, storeController.updateStore);
router.delete('/:id', authenticate, authorize('admin'), storeController.deleteStore);

export default router;
