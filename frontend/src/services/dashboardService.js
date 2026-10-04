import api from './api';

export const dashboardService = {
  async getAdminDashboard() {
    return api.get('/dashboard/admin');
  },

  async getStoreOwnerDashboard(params = {}) {
    return api.get('/dashboard/store-owner', { params });
  },

  async getUserDashboard() {
    return api.get('/dashboard/user');
  },
};

export default dashboardService;
