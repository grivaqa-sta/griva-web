import { api } from "../lib/axios";

const dealOfDayService = {
  /**
   * Get active deal
   */
  getActiveDeal: async () => {
    const response = await api.get("/deal-of-day/active");
    return response.data;
  },

  /**
   * Get all deals
   */
  getAllDeals: async () => {
    const response = await api.get("/deal-of-day");
    return response.data;
  },

  /**
   * Create deal
   */
  createDeal: async (data) => {
    const response = await api.post("/deal-of-day", data);
    return response.data;
  },

  /**
   * Update deal
   */
  updateDeal: async (id, data) => {
    const response = await api.put(`/deal-of-day/${id}`, data);
    return response.data;
  },

  /**
   * Toggle status
   */
  updateDealStatus: async (id) => {
    const response = await api.patch(
      `/deal-of-day/${id}/status`
    );
    return response.data;
  },

  /**
   * Delete deal
   */
  deleteDeal: async (id) => {
    const response = await api.delete(
      `/deal-of-day/${id}`
    );
    return response.data;
  },
};

export default dealOfDayService;