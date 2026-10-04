import { validationResult } from 'express-validator';

/**
 * Middleware to check express-validator errors and return structured 400 responses
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      success: false,
      message: errorList[0].message,
      errors: errorList,
    });
  }
  next();
};

export default validate;
