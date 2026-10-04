import api from './api';

export const userService = {
  async getUsers(params = {}) {
    return api.get('/users', { params });
  },

  async getUserById(id) {
    return api.get(`/users/${id}`);
  },

  async createUser(data) {
    return api.post('/users', data);
  },

  async updateUser(id, data) {
    return api.put(`/users/${id}`, data);
  },

  async changePassword(id, passwords) {
    return api.put(`/users/${id}/password`, passwords);
  },

  async getStoreOwners() {
    return api.get('/users/owners');
  },
};

export default userService;
