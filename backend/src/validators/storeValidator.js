import { body } from 'express-validator';
import { handleValidationErrors } from './common.js';

export const validateCreateStore = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required.')
    .isLength({ min: 2, max: 255 }).withMessage('Store name must be between 2 and 255 characters long.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required.')
    .isEmail().withMessage('Please provide a valid store email address.')
    .normalizeEmail(),

  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required.')
    .isLength({ min: 5, max: 400 }).withMessage('Store address must be between 5 and 400 characters long.'),

  body('owner_id')
    .notEmpty().withMessage('Store owner is required.')
    .isInt({ min: 1 }).withMessage('A valid store owner ID must be selected.'),

  handleValidationErrors,
];

export const validateUpdateStore = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Store name must be between 2 and 255 characters long.'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid store email address.')
    .normalizeEmail(),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 400 }).withMessage('Store address must be between 5 and 400 characters long.'),

  body('owner_id')
    .optional()
    .isInt({ min: 1 }).withMessage('A valid store owner ID must be selected.'),

  handleValidationErrors,
];

export default {
  validateCreateStore,
  validateUpdateStore,
};
