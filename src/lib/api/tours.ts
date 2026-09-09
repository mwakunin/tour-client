// // src/lib/api/tours.ts
// import { apiClient } from "./client";

// interface TourFilters {
//   search?: string;
//   destination_id?: string;
//   category?: string;
//   featured?: boolean;
//   is_deal?: boolean;
//   status?: string;
//   min_price?: number;
//   max_price?: number;
//   duration?: number;
//   page?: number;
//   limit?: number;
// }

// export const toursApi = {
//   // ============================================
//   // GET TOURS (without destinations)
//   // ============================================

//   // Get all tours with optional filters
//   getAll: async (filters?: TourFilters) => {
//     const { data } = await apiClient.get("/tours", {
//       params: filters,
//     });
//     return data;
//   },

//   // Get featured tours
//   getFeatured: async (limit: number = 6) => {
//     const { data } = await apiClient.get("/tours/featured", {
//       params: { limit },
//     });
//     return data;
//   },

//   // Get deal tours
//   getDeals: async (limit?: number) => {
//     const { data } = await apiClient.get("/tours/deals", {
//       params: { limit },
//     });
//     return data;
//   },

//   // Search tours
//   search: async (query: string) => {
//     const { data } = await apiClient.get("/tours/search", {
//       params: { q: query },
//     });
//     return data;
//   },

//   // Get single tour by ID
//   getById: async (id: string) => {
//     const { data } = await apiClient.get(`/tours/${id}`);
//     return data;
//   },

//   // Get single tour by slug
//   getBySlug: async (slug: string) => {
//     const { data } = await apiClient.get(`/tours/slug/${slug}`);
//     return data;
//   },

//   // ============================================
//   // ✅ NEW: GET TOURS WITH DESTINATIONS
//   // ============================================

//   // Get all tours WITH destinations
//   getAllWithDestinations: async (filters?: TourFilters) => {
//     const { data } = await apiClient.get("/tours/with-destinations", {
//       params: filters,
//     });
//     return data;
//   },

//   // Get single tour by ID WITH destinations (using your existing /full endpoint)
//   getByIdFull: async (id: string) => {
//     const { data } = await apiClient.get(`/tours/${id}/full`);
//     return data;
//   },

//   // Get single tour by ID WITH destinations (alternative endpoint)
//   getByIdWithDestinations: async (id: string) => {
//     const { data } = await apiClient.get(`/tours/${id}/with-destinations`);
//     return data;
//   },

//   // Get single tour by slug WITH destinations
//   getBySlugWithDestinations: async (slug: string) => {
//     const { data } = await apiClient.get(`/tours/slug/${slug}/with-destinations`);
//     return data;
//   },

//   // ============================================
//   // OTHER ENDPOINTS
//   // ============================================

//   // Get tour stats
//   getStats: async (id: string) => {
//     const { data } = await apiClient.get(`/tours/${id}/stats`);
//     return data;
//   },

//   // ============================================
//   // ADMIN ONLY
//   // ============================================

//   // Create tour
//   create: async (tourData: any) => {
//     const { data } = await apiClient.post("/tours", tourData);
//     return data;
//   },

//   // Update tour
//   update: async (id: string, tourData: any) => {
//     const { data } = await apiClient.patch(`/tours/${id}`, tourData);
//     return data;
//   },

//   // Delete tour
//   delete: async (id: string) => {
//     const { data } = await apiClient.delete(`/tours/${id}`);
//     return data;
//   },

//   getTopPerforming: async (metric: "bookings" | "revenue" = "bookings") => {
//     const response = await apiClient.get<{ success: boolean; data: any }>(
//       `/tours/stats/top-performing?metric=${metric}`
//     );
//     return response.data.data;
//   },
// };

import { apiClient } from "./client";
import { normalizeTour } from "@/types/tour";

interface TourFilters {
  search?: string;
  destination_id?: string;
  category?: string;
  featured?: boolean;
  is_deal?: boolean;
  status?: string;
  min_price?: number;
  max_price?: number;
  duration?: number;
  page?: number;
  limit?: number;
}

const normalizeListResponse = (data: any) => ({
  ...data,
  data: Array.isArray(data.data) ? data.data.map(normalizeTour) : data.data,
});

const normalizeSingleResponse = (data: any) => ({
  ...data,
  data: data.data ? normalizeTour(data.data) : data.data,
});

export const toursApi = {
  // ============================================
  // GET TOURS (without destinations)
  // ============================================

  // Get all tours with optional filters
  getAll: async (filters?: TourFilters) => {
    const { data } = await apiClient.get("/tours", {
      params: filters,
    });
    return normalizeListResponse(data);
  },

  // Get featured tours
  getFeatured: async (limit: number = 6) => {
    const { data } = await apiClient.get("/tours/featured", {
      params: { limit },
    });
    return normalizeListResponse(data);
  },

  // Get deal tours
  getDeals: async (limit?: number) => {
    const { data } = await apiClient.get("/tours/deals", {
      params: { limit },
    });
    return normalizeListResponse(data);
  },

  // Search tours
  search: async (query: string) => {
    const { data } = await apiClient.get("/tours/search", {
      params: { q: query },
    });
    return normalizeListResponse(data);
  },

  // Get single tour by ID
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/tours/${id}`);
    return normalizeSingleResponse(data);
  },

  // Get single tour by slug
  getBySlug: async (slug: string) => {
    const { data } = await apiClient.get(`/tours/slug/${slug}`);
    return normalizeSingleResponse(data);
  },

  // ============================================
  // GET TOURS WITH DESTINATIONS
  // ============================================

  // Get all tours WITH destinations
  getAllWithDestinations: async (filters?: TourFilters) => {
    const { data } = await apiClient.get("/tours/with-destinations", {
      params: filters,
    });
    return normalizeListResponse(data);
  },

  // Get single tour by ID WITH destinations (using your existing /full endpoint)
  getByIdFull: async (id: string) => {
    const { data } = await apiClient.get(`/tours/${id}/full`);
    return normalizeSingleResponse(data);
  },

  // Get single tour by ID WITH destinations (alternative endpoint)
  getByIdWithDestinations: async (id: string) => {
    const { data } = await apiClient.get(`/tours/${id}/with-destinations`);
    return normalizeSingleResponse(data);
  },

  // Get single tour by slug WITH destinations
  getBySlugWithDestinations: async (slug: string) => {
    const { data } = await apiClient.get(`/tours/slug/${slug}/with-destinations`);
    return normalizeSingleResponse(data);
  },

  // ============================================
  // OTHER ENDPOINTS
  // ============================================

  // Get tour stats — not tour-shaped, no normalization needed
  getStats: async (id: string) => {
    const { data } = await apiClient.get(`/tours/${id}/stats`);
    return data;
  },

  // ============================================
  // ADMIN ONLY
  // ============================================

  // Create tour
  create: async (tourData: any) => {
    const { data } = await apiClient.post("/tours", tourData);
    return normalizeSingleResponse(data);
  },

  // Update tour
  update: async (id: string, tourData: any) => {
    const { data } = await apiClient.patch(`/tours/${id}`, tourData);
    return normalizeSingleResponse(data);
  },

  // Delete tour — no tour data returned
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/tours/${id}`);
    return data;
  },

  // Top performing tours — its own shape ({ tours, top_tour }), not a plain
  // array or single tour, so it gets its own normalization
  getTopPerforming: async (metric: "bookings" | "revenue" = "bookings") => {
    const response = await apiClient.get<{ success: boolean; data: any }>(
      `/tours/stats/top-performing?metric=${metric}`
    );
    const result = response.data.data;
    return {
      ...result,
      tours: Array.isArray(result?.tours) ? result.tours.map(normalizeTour) : result?.tours,
    };
  },
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*
// Basic tour list (fast, no destinations)
const tours = await toursApi.getAll({ page: 1, limit: 10 });

// Tour list WITH destinations (for cards showing destination info)
const toursWithDest = await toursApi.getAllWithDestinations({ page: 1, limit: 10 });

// Single tour detail page (with full destination info)
const tour = await toursApi.getBySlugWithDestinations('safari-adventure');

// Or using the /full endpoint
const tourFull = await toursApi.getByIdFull('tour-123');

// Featured tours
const featured = await toursApi.getFeatured(6);

// Search
const results = await toursApi.search('safari');

// Deals
const deals = await toursApi.getDeals(10);
*/
