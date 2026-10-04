import authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;
    const result = await authService.registerUser({ name, email, address, password });
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  logout,
  getMe,
};
