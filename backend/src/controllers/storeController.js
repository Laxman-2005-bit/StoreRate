import storeService from '../services/storeService.js';

/**
 * Get all stores with search, sort, pagination, overall rating, and user's rating
 */
export const getStores = async (req, res, next) => {
  try {
    const {
      search = '',
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = req.query;

    const currentUserId = req.user ? req.user.id : null;
    const result = await storeService.listStores({
      search,
      sortBy,
      sortOrder,
      page,
      limit,
      currentUserId,
    });

    // Owner contact details are only visible to administrators
    if (!req.user || req.user.role !== 'admin') {
      result.stores = result.stores.map(({ owner_name, owner_email, ...rest }) => rest);
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get store by ID
 */
export const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;
    const store = await storeService.getStoreById(id, currentUserId);

    if (!req.user || req.user.role !== 'admin') {
      delete store.owner_name;
      delete store.owner_email;
      delete store.owner_address;
    }

    return res.status(200).json({
      success: true,
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin creates new store
 */
export const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const store = await storeService.createStore({ name, email, address, owner_id });

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin updates store
 */
export const updateStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, address, owner_id } = req.body;
    const store = await storeService.updateStore(id, { name, email, address, owner_id });

    return res.status(200).json({
      success: true,
      message: 'Store updated successfully.',
      data: { store },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin deletes store
 */
export const deleteStore = async (req, res, next) => {
  try {
    const { id } = req.params;
    await storeService.deleteStore(id);

    return res.status(200).json({
      success: true,
      message: 'Store deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
};
