import { apiClient } from "./client";

// ============================================
// TYPES
// ============================================
export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  bookings: number;
  target?: number;
}

// Type definition
interface RevenueStats {
  monthly_data: Array<{
    month: string;
    revenue: number;
    bookings: number;
    avg_price_per_person: number; // ✅ number
    total_guests: number; // ✅ number
    target?: number;
  }>;
  total_revenue: number;
  average_monthly_revenue: number;
  total_bookings: number;
  total_guests: number; // ✅ number
  avg_price_per_person: number; // ✅ number
  growth_percentage: number;
  best_month: {
    month: string;
    revenue: number;
  };
}

export interface BookingStats {
  total_bookings: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
  total_revenue: string;
  pending_revenue: string;
}

export const bookingsApi = {
  getAll: async (params?: any) => {
    const response = await apiClient.get("/bookings", { params });

    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);

    // Try to return the right nested value
    return response.data?.data || response.data?.booking || response.data;
  },

  // ✅ ADD THIS:
  getMyBookings: async (status?: string) => {
    const params = status ? { status } : {};
    const response = await apiClient.get("/bookings/my-bookings", { params });
    return response.data;
  },

  // ✅ ADD THIS:
  cancel: async (id: string) => {
    const response = await apiClient.patch(`/bookings/${id}/cancel`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.patch(`/bookings/${id}/status`, {
      status,
    });
    return data;
  },

  updatePayment: async (id: string, paymentData: any) => {
    const { data } = await apiClient.patch(`/bookings/${id}/payment`, paymentData);
    return data;
  },

  create: async (bookingData: any) => {
    const { data } = await apiClient.post("/bookings", bookingData);
    return data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/bookings/${id}`, data);
    return response.data;
  },
  // ✅ NEW: Get booking statistics (overview)
  getStats: async (filters?: { tour_id?: string; start_date?: string; end_date?: string }) => {
    const response = await apiClient.get<{
      success: boolean;
      data: BookingStats;
    }>("/bookings/stats/overview", { params: filters });
    return response.data.data; // Extract data from wrapper
  },

  // ✅ NEW: Get revenue statistics (for charts)
  getRevenueStats: async (): Promise<RevenueStats> => {
    const response = await apiClient.get<{
      success: boolean;
      data: RevenueStats;
    }>("/bookings/stats/revenue");
    return response.data.data; // Extract data from { success: true, data: {...} }
  },

  getBookingTrends: async () => {
    const response = await apiClient.get<{ success: boolean; data: any }>("/bookings/stats/trends");
    return response.data.data;
  },
};
