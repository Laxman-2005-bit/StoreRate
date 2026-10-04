import api from './api';

export const ratingService = {
  async getStoreRatings(storeId, params = {}) {
    return api.get(`/stores/${storeId}/ratings`, { params });
  },

  async submitRating(storeId, rating) {
    return api.post(`/stores/${storeId}/ratings`, { rating });
  },

  async updateRating(storeId, ratingId, rating) {
    return api.put(`/stores/${storeId}/ratings/${ratingId}`, { rating });
  },

  async getMyRatings() {
    return api.get('/ratings/my-ratings');
  },
};

export default ratingService;
