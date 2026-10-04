import { body } from 'express-validator';
import { handleValidationErrors, PASSWORD_REGEX, PASSWORD_HINT } from './common.js';

export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters long.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.')
    .isLength({ max: 400 }).withMessage('Address cannot exceed 400 characters.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .matches(PASSWORD_REGEX).withMessage(PASSWORD_HINT),

  handleValidationErrors,
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),

  handleValidationErrors,
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .matches(PASSWORD_REGEX).withMessage(`New ${PASSWORD_HINT}`),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password.')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New password and confirm password do not match.');
      }
      return true;
    }),

  handleValidationErrors,
];

export default {
  validateRegister,
  validateLogin,
  validateChangePassword,
};
