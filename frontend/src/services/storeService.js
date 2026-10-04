import api from './api';

export const storeService = {
  async getStores(params = {}) {
    return api.get('/stores', { params });
  },

  async getStoreById(id) {
    return api.get(`/stores/${id}`);
  },

  async createStore(data) {
    return api.post('/stores', data);
  },

  async updateStore(id, data) {
    return api.put(`/stores/${id}`, data);
  },

  async deleteStore(id) {
    return api.delete(`/stores/${id}`);
  },
};

export default storeService;
