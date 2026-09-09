// src/lib/api/users.ts
import { apiClient } from "./client";

// Field names mirror the API, which serialises better-auth's `user` row as-is
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  role?: "admin" | "user";
}

export const usersApi = {
  // Get all users with optional filters
  getAll: async (params?: { search?: string; role?: string; limit?: number; offset?: number }) => {
    const { data } = await apiClient.get("/users", {
      params: {
        ...params,
        _t: Date.now(), // Cache buster
      },
    });
    return data;
  },

  // Get single user by ID
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/users/${id}`, {
      params: { _t: Date.now() },
    });
    return data;
  },

  // Get user statistics
  getStats: async () => {
    const { data } = await apiClient.get("/users/stats", {
      params: { _t: Date.now() },
    });
    return data;
  },

  // Delete user
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/users/${id}`);
    return data;
  },

  // Update a user (self: name/email — admin: role too)
  update: async (id: string, updates: UserUpdate) => {
    const { data } = await apiClient.put(`/users/${id}`, updates);
    return data;
  },

  // Change user role
  changeRole: async (id: string, role: "admin" | "user") => {
    const { data } = await apiClient.put(`/users/${id}`, { role });
    return data;
  },
};
