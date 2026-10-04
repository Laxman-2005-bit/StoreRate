import userService from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const { search, role, sortBy, sortOrder, page, limit } = req.query;
    const result = await userService.listUsers({ search, role, sortBy, sortOrder, page, limit });
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserDetails(id, req.user);
    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;
    const newUser = await userService.createUser({ name, email, password, address, role });
    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { user: newUser },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, address, role } = req.body;
    const updated = await userService.updateUser(id, { name, address, role }, req.user);
    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: { user: updated },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    await userService.changeUserPassword(id, { currentPassword, newPassword }, req.user);
    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please keep your credentials secure.',
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreOwners = async (req, res, next) => {
  try {
    const owners = await userService.listStoreOwners();
    return res.status(200).json({
      success: true,
      data: { owners },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  getStoreOwners,
};
