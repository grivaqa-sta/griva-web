import { api } from "../lib/axios";
import { AddressRequest } from "../types/types";

export const addressService = {
  createAddress: async (data: AddressRequest) => {
    const response = await api.post("/addresses", data);
    return response.data;
  },

  getAddresses: async () => {
    const response = await api.get("/addresses");
    return response.data;
  },

  getAddress: async (id: number) => {
    const response = await api.get(`/addresses/${id}`);
    return response.data;
  },

  updateAddress: async (id: number,data: Partial<AddressRequest>) => {
    const response = await api.put(`/addresses/${id}`,data);
    return response.data;
  },

  deleteAddress: async (id: number) => {
    const response = await api.delete(`/addresses/${id}`);
    return response.data;
  },

  setDefaultAddress: async (id: number) => {
    const response = await api.put(`/addresses/${id}/default`);
    return response.data;
  },
  
};