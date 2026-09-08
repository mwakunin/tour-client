// src/lib/api/inquiries.ts
import { apiClient } from "./client";

export interface InquiryData {
  name: string;
  email: string;
  country: string;
  contact: string;
  adults: number;
  children: number;
  subject: string;
  message: string;
  tour_id?: string;
  tour_title?: string;
}

export const inquiriesApi = {
  create: async (data: InquiryData) => {
    const response = await apiClient.post("/inquiries", data);
    return response.data;
  },
};
