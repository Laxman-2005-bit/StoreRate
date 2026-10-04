import ratingService from '../services/ratingService.js';

/**
 * Get all ratings for a specific store (supports sorting)
 */
export const getStoreRatings = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const result = await ratingService.getStoreRatings(storeId, req.user, {
      sortBy,
      sortOrder,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a new rating for a store (Normal user only)
 */
export const submitRating = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const result = await ratingService.submitRating(storeId, rating, userId);

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully!',
      data: result,
    });
  } catch (error) {
    // Unique constraint violation safety check
    if (error.code === '23505' || error.message?.includes('UNIQUE')) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a rating for this store.',
      });
    }
    next(error);
  }
};

/**
 * Modify an existing rating (Normal user only)
 */
export const updateRating = async (req, res, next) => {
  try {
    const { storeId, ratingId } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const result = await ratingService.updateRating(storeId, ratingId, rating, userId);

    return res.status(200).json({
      success: true,
      message: 'Your rating has been updated successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's submitted ratings across all stores
 */
export const getMyRatings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const ratings = await ratingService.getMyRatings(userId);

    return res.status(200).json({
      success: true,
      data: { ratings },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getStoreRatings,
  submitRating,
  updateRating,
  getMyRatings,
};
