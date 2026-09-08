// ============================================================
// FILE 1: lib/api/payments.ts - UPDATE THIS FILE
// ============================================================

import { apiClient } from "./client";

export const paymentsApi = {
  // ============================================
  // UNIFIED PAYMENT INITIALIZATION
  // ============================================

  /**
   * Initialize payment (supports M-Pesa, Pesapal & Paystack)
   */
  initializePayment: async (data: {
    bookingId: string;
    paymentMethod: "mpesa" | "pesapal" | "paystack" | "card"; // ✅ Added pesapal
    phoneNumber?: string; // Required for M-Pesa
    email?: string; // Required for Pesapal/Paystack
  }) => {
    const response = await apiClient.post("/payments/initiate", data);
    return response.data;
  },

  // ✅ Updated verify payment to handle both Pesapal and Paystack
  verifyPayment: async (params: {
    reference?: string; // For Paystack
    orderTrackingId?: string; // For Pesapal
    paymentMethod?: "pesapal" | "paystack";
  }) => {
    const queryParams = new URLSearchParams();
    if (params.reference) queryParams.append("reference", params.reference);
    if (params.orderTrackingId) queryParams.append("orderTrackingId", params.orderTrackingId);
    if (params.paymentMethod) queryParams.append("paymentMethod", params.paymentMethod);

    const response = await apiClient.get(`/payments/verify?${queryParams.toString()}`);
    return response.data;
  },

  // ============================================
  // PESAPAL PAYMENTS (NEW)
  // ============================================

  /**
   * Initialize Pesapal payment
   */
  pesapalCheckout: async (data: {
    bookingId: string;
    email: string;
    phoneNumber?: string;
    amount?: number;
    currency?: string;
  }) => {
    const response = await apiClient.post("/payments/initiate", {
      ...data,
      paymentMethod: "pesapal",
    });
    return response.data;
  },

  /**
   * Verify Pesapal payment
   */
  verifyPesapal: async (orderTrackingId: string) => {
    const response = await apiClient.get(
      `/payments/verify?orderTrackingId=${orderTrackingId}&paymentMethod=pesapal`
    );
    return response.data;
  },

  // ============================================
  // PAYSTACK PAYMENTS (LEGACY - Being phased out)
  // ============================================

  /**
   * Initialize Paystack payment (Legacy)
   * @deprecated Use pesapalCheckout instead
   */
  paystackCheckout: async (data: {
    bookingId: string;
    email: string;
    amount?: number;
    currency?: string;
  }) => {
    const response = await apiClient.post("/payments/initiate", {
      ...data,
      paymentMethod: "paystack",
    });
    return response.data;
  },

  /**
   * Verify Paystack payment (Legacy)
   * @deprecated Use verifyPesapal instead
   */
  verifyPaystack: async (reference: string) => {
    const response = await apiClient.get(
      `/payments/verify?reference=${reference}&paymentMethod=paystack`
    );
    return response.data;
  },

  // ============================================
  // M-PESA PAYMENTS
  // ============================================

  /**
   * Initiate M-Pesa STK Push
   */
  mpesaStkPush: async (data: { bookingId: string; phoneNumber: string; amount?: number }) => {
    const response = await apiClient.post("/payments/initiate", {
      ...data,
      paymentMethod: "mpesa",
    });
    return response.data;
  },

  /**
   * Check M-Pesa payment status
   */
  checkMpesaStatus: async (checkoutRequestId: string) => {
    const response = await apiClient.get(`/payments/mpesa/status/${checkoutRequestId}`);
    return response.data;
  },

  // ============================================
  // GENERAL PAYMENT METHODS
  // ============================================

  /**
   * Get payment status for a booking
   */
  getPaymentStatus: async (bookingId: string) => {
    const response = await apiClient.get(`/payments/booking/${bookingId}/status`);
    return response.data;
  },

  /**
   * Get all available payment methods for a currency
   */
  getPaymentMethods: async (currency?: string) => {
    const url = currency ? `/payments/methods?currency=${currency}` : "/payments/methods";
    const response = await apiClient.get(url);
    return response.data;
  },

  /**
   * Get payment history for authenticated user
   */
  getPaymentHistory: async () => {
    const response = await apiClient.get("/payments/history");
    return response.data;
  },

  /**
   * Get payment details by ID
   */
  getPaymentDetails: async (paymentId: string) => {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return response.data;
  },

  // ============================================
  // BANK TRANSFER PAYMENTS
  // ============================================

  /**
   * Get pending bank transfers (Admin only)
   */
  getPendingBankTransfers: async () => {
    const response = await apiClient.get("/payments/bank-transfers/pending");
    return response.data;
  },

  /**
   * Get bank transfer statistics (Admin only)
   */
  getBankTransferStats: async () => {
    const response = await apiClient.get("/payments/bank-transfers/stats");
    return response.data;
  },

  /**
   * Confirm bank transfer payment (Admin only)
   */
  confirmBankTransfer: async (
    transferId: string,
    data?: {
      notes?: string;
      verified_amount?: number;
    }
  ) => {
    const response = await apiClient.post(`/payments/bank-transfers/${transferId}/confirm`, data);
    return response.data;
  },
};

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PaymentInitResponse {
  success: boolean;
  message: string;
  data?: {
    // Pesapal response
    authorization_url?: string;
    tracking_id?: string;
    merchant_reference?: string;

    // Paystack response (legacy)
    access_code?: string;
    reference?: string;

    // M-Pesa response
    checkoutRequestId?: string;
    merchantRequestId?: string;

    payment_id: string;
    payment_method: "mpesa" | "pesapal" | "paystack" | "card" | "bank_transfer";
  };
}

export interface PaymentVerifyResponse {
  success: boolean;
  message?: string;
  status: string;
  amount: number;
  currency: string;
  merchant_reference?: string;
  confirmation_code?: string;
}

export interface PaymentStatus {
  booking_id: string;
  payment_id: string;
  status: "pending" | "completed" | "failed";
  amount: number;
  currency: string;
  payment_method: "mpesa" | "pesapal" | "paystack" | "card" | "bank_transfer" | "cash";
  created_at: string;
  completed_at?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  currencies: string[];
  recommended?: boolean;
  deprecated?: boolean;
}

export interface PaymentHistory {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  completed_at?: string;
}
