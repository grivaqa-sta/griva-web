import { api } from "../lib/axios";
import { DiscoverMorePayload } from "../types/types";

/**
 * Get All Banners
 */
export const getAllDiscoverMore = async () => {
  const response = await api.get("/discover-more");
  return response.data;
};

/**
 * Get Active Banners
 */
export const getActiveDiscoverMore = async () => {
  const response = await api.get("/discover-more/active");
  return response.data;
};

/**
 * Get Banner By Id
 */
export const getDiscoverMoreById = async (id: number) => {
  const response = await api.get(`/discover-more/${id}`);
  return response.data;
};

/**
 * Create Banner
 */
export const createDiscoverMore = async (
  payload: DiscoverMorePayload
) => {
  const response = await api.post("/discover-more", payload);
  return response.data;
};

/**
 * Update Banner
 */
export const updateDiscoverMore = async (id: number,payload: Partial<DiscoverMorePayload>) => {
  const response = await api.put(`/discover-more/${id}`,payload);
  return response.data;
};

/**
 * Toggle Status
 */
export const updateDiscoverMoreStatus = async (id: number) => {
  const response = await api.patch(`/discover-more/${id}/status`);
  return response.data;
};

/**
 * Delete Banner
 */
export const deleteDiscoverMore = async (id: number) => {
  const response = await api.delete(`/discover-more/${id}`);
  return response.data;
};