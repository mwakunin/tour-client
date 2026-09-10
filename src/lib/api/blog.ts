// src/lib/api/blog.ts
import { apiClient } from "./client";

// ============================================
// TYPES
// ============================================
export interface BlogPostFilters {
  page?: number;
  limit?: number;
  status?: "draft" | "published" | "all";
  category_id?: number;
  search?: string;
  sort_by?: "created_at" | "published_at" | "title" | "read_time_minutes" | "views_count";
  sort_order?: "asc" | "desc";
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category_id?: number;
  author_id: number;
  status: "draft" | "published";
  meta_title?: string;
  meta_description?: string;
  read_time_minutes?: number;
  views_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    name: string;
    email: string;
  };
  category?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogPostData {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  category_id?: number;
  status?: "draft" | "published";
  meta_title?: string;
  meta_description?: string;
  read_time_minutes?: number;
  published_at?: string;
}

export type UpdateBlogPostData = Partial<CreateBlogPostData>;

export interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

// ============================================
// BLOG API
// ============================================
export const blogApi = {
  // ============================================
  // PUBLIC ROUTES
  // ============================================

  /**
   * Get all published blog posts
   */
  getPublishedPosts: async (filters?: BlogPostFilters) => {
    const { data } = await apiClient.get("/blog/posts", {
      params: filters,
    });
    return data;
  },

  /**
   * Get single published post by slug
   */
  getPublishedPostBySlug: async (slug: string) => {
    const { data } = await apiClient.get(`/blog/posts/${slug}`);
    return data;
  },

  /**
   * Get all categories
   */
  getCategories: async () => {
    const { data } = await apiClient.get("/blog/categories");
    return data;
  },

  // ============================================
  // ADMIN ROUTES - POSTS
  // ============================================

  /**
   * Get all posts (including drafts) - Admin only
   */
  getAllPosts: async (filters?: BlogPostFilters) => {
    const { data } = await apiClient.get("/blog/admin/posts", {
      params: filters,
    });
    return data;
  },

  /**
   * Get post by ID - Admin only
   */
  getPostById: async (id: number) => {
    const { data } = await apiClient.get(`/blog/admin/posts/id/${id}`);
    return data;
  },

  /**
   * Get post by slug (includes drafts) - Admin only
   */
  getPostBySlug: async (slug: string) => {
    const { data } = await apiClient.get(`/blog/admin/posts/slug/${slug}`);
    return data;
  },

  /**
   * Create new blog post - Admin only
   */
  createPost: async (postData: CreateBlogPostData) => {
    const { data } = await apiClient.post("/blog/admin/posts", postData);
    return data;
  },

  /**
   * Update blog post - Admin only
   */
  updatePost: async (id: number, postData: UpdateBlogPostData) => {
    const { data } = await apiClient.put(`/blog/admin/posts/${id}`, postData);
    return data;
  },

  /**
   * Delete blog post - Admin only
   */
  deletePost: async (id: number) => {
    const { data } = await apiClient.delete(`/blog/admin/posts/${id}`);
    return data;
  },

  // ============================================
  // ADMIN ROUTES - CATEGORIES
  // ============================================

  /**
   * Get category by ID - Admin only
   */
  getCategoryById: async (id: number) => {
    const { data } = await apiClient.get(`/blog/admin/categories/${id}`);
    return data;
  },

  /**
   * Create new category - Admin only
   */
  createCategory: async (categoryData: CreateCategoryData) => {
    const { data } = await apiClient.post("/blog/admin/categories", categoryData);
    return data;
  },

  /**
   * Update category - Admin only
   */
  updateCategory: async (id: number, categoryData: UpdateCategoryData) => {
    const { data } = await apiClient.put(`/blog/admin/categories/${id}`, categoryData);
    return data;
  },

  /**
   * Delete category - Admin only
   */
  deleteCategory: async (id: number) => {
    const { data } = await apiClient.delete(`/blog/admin/categories/${id}`);
    return data;
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Get posts by category
   */
  getPostsByCategory: async (categoryId: number, filters?: BlogPostFilters) => {
    const { data } = await apiClient.get("/blog/posts", {
      params: {
        ...filters,
        category_id: categoryId,
      },
    });
    return data;
  },

  /**
   * Search posts
   */
  searchPosts: async (searchQuery: string, filters?: BlogPostFilters) => {
    const { data } = await apiClient.get("/blog/posts", {
      params: {
        ...filters,
        search: searchQuery,
      },
    });
    return data;
  },

  /**
   * Get recent posts
   */
  getRecentPosts: async (limit: number = 5) => {
    const { data } = await apiClient.get("/blog/posts", {
      params: {
        limit,
        sort_by: "published_at",
        sort_order: "desc",
      } satisfies BlogPostFilters,
    });
    return data;
  },

  /**
   * Get popular posts (by views)
   */
  getPopularPosts: async (limit: number = 5) => {
    const { data } = await apiClient.get("/blog/posts", {
      params: {
        limit,
        sort_by: "views_count",
        sort_order: "desc",
        // satisfies, not a bare object: these params bypassed BlogPostFilters
        // entirely, so nothing checked "views_count" against the union and the
        // API answered 400 in silence. Typed, the mismatch is a build error.
      } satisfies BlogPostFilters,
    });
    return data;
  },
};
