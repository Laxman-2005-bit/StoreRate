import express from 'express';
import userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateCreateUser, validateUpdateUser } from '../validators/userValidator.js';
import { validateChangePassword } from '../validators/authValidator.js';

const router = express.Router();

// List store owners (for store creation dropdown)
router.get('/owners', authenticate, authorize('admin'), userController.getStoreOwners);

// List users with search/filter/sort/pagination (admin only)
router.get('/', authenticate, authorize('admin'), userController.getUsers);

// Create new user (admin only)
router.post('/', authenticate, authorize('admin'), validateCreateUser, userController.createUser);

// Get user by ID (admin or self)
router.get('/:id', authenticate, userController.getUserById);

// Update user details (admin or self)
router.put('/:id', authenticate, validateUpdateUser, userController.updateUser);

// Change user password (admin or self)
router.put('/:id/password', authenticate, validateChangePassword, userController.changePassword);

export default router;
