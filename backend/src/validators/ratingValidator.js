import { body } from 'express-validator';
import { handleValidationErrors } from './common.js';

export const validateRating = [
  body('rating')
    .notEmpty().withMessage('Rating value is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5.'),

  handleValidationErrors,
];

export default {
  validateRating,
};
