// src/lib/api/contact.ts
import { apiClient } from "./client";

export const contactApi = {
  send: async (data: { name: string; email: string; phone?: string; message: string }) => {
    const response = await apiClient.post("/contact", data);
    return response.data;
  },
};
