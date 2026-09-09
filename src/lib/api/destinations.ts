// src/lib/api/destinations.ts
import { apiClient } from "./client";
import { normalizeTour } from "@/types/tour";

interface DestinationFilters {
  search?: string;
  featured?: boolean;
  country?: string;
  region?: string;
  page?: number;
  limit?: number;
}

export const destinationsApi = {
  // Get all destinations with optional filters
  getAll: async (filters?: DestinationFilters) => {
    const { data } = await apiClient.get("/destinations", {
      params: filters,
    });
    return data;
  },

  // Get single destination by ID
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/destinations/${id}`);
    return data;
  },

  // Get single destination by slug
  getBySlug: async (slug: string) => {
    const { data } = await apiClient.get(`/destinations/slug/${slug}`);
    return data;
  },

  // Get destination with tours
  // Returns { data: { ...destination, tours } }, so it needs its own
  // normalization rather than toursApi's list/single helpers. Without this the
  // tours arrive raw and any Tour[] annotation downstream is a claim rather
  // than a fact — Tour requires array fields the API can omit.
  getWithTours: async (id: string) => {
    const { data } = await apiClient.get(`/destinations/${id}/tours`);
    if (!Array.isArray(data?.data?.tours)) return data;
    return { ...data, data: { ...data.data, tours: data.data.tours.map(normalizeTour) } };
  },

  // Get destination stats
  getStats: async (id: string) => {
    const { data } = await apiClient.get(`/destinations/${id}/stats`);
    return data;
  },

  // Admin only - Create destination
  create: async (destData: any) => {
    const { data } = await apiClient.post("/destinations", destData);
    return data;
  },

  // Admin only - Update destination
  update: async (id: string, destData: any) => {
    const { data } = await apiClient.patch(`/destinations/${id}`, destData);
    return data;
  },

  // Admin only - Delete destination
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/destinations/${id}`);
    return data;
  },

  getRevenueBreakdown: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      "/destinations/stats/revenue-breakdown"
    );
    return response.data.data;
  },
};
