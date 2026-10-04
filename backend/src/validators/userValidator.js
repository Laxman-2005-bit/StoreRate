import { body } from 'express-validator';
import { handleValidationErrors, PASSWORD_REGEX, PASSWORD_HINT } from './common.js';

export const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters long.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .matches(PASSWORD_REGEX).withMessage(PASSWORD_HINT),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.')
    .isLength({ max: 400 }).withMessage('Address cannot exceed 400 characters.'),

  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['admin', 'user', 'owner']).withMessage('Role must be one of: admin, user, owner.'),

  handleValidationErrors,
];

export const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters long.'),

  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 }).withMessage('Address cannot exceed 400 characters.'),

  body('role')
    .optional()
    .isIn(['admin', 'user', 'owner']).withMessage('Role must be one of: admin, user, owner.'),

  handleValidationErrors,
];

export default {
  validateCreateUser,
  validateUpdateUser,
};
