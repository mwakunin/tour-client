"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, Search, Filter } from "lucide-react";
import { blogApi, type BlogPostFilters, type BlogPost } from "@/lib/api/blog";
import { queryKeys } from "@/lib/api/queryKeys";
import { toast } from "sonner";

export default function AdminBlogPostsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<BlogPostFilters>({
    page: 1,
    limit: 10,
    status: "all",
    sort_by: "created_at",
    sort_order: "desc",
  });

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "draft" | "published">("all");

  const { data: postsData, isLoading } = useQuery({
    queryKey: queryKeys.blog.posts.list(filters),
    queryFn: () => blogApi.getAllPosts(filters),
  });

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.blog.categories.list(),
    queryFn: () => blogApi.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => blogApi.deletePost(id),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      // The root reaches the public blog list, the home feed, related posts,
      // and both the id- and slug-keyed detail pages.
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.posts.all });
    },
    onError: () => {
      toast.error("Failed to delete post");
    },
  });

  const posts = postsData?.data || [];
  const pagination = postsData?.pagination;

  const categories = categoriesData?.data || [];

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      page: 1,
    }));
  };

  const handleStatusFilter = (status: "all" | "draft" | "published") => {
    setSelectedStatus(status);
    setFilters((prev) => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Posts</h1>
            <p className="mt-2 text-gray-600">Manage your blog content</p>
          </div>
          <Link
            href="/admin/blog/create"
            className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white"
          >
            <Plus size={20} />
            New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-6 shadow-md md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="max-w-md flex-1">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search posts..."
                className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:ring-2 focus:outline-none"
              />
              <button
                onClick={handleSearch}
                className="hover:text-primary absolute top-1/2 right-2 -translate-y-1/2 text-gray-400"
              >
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value as "all" | "draft" | "published")}
              className="focus:border-primary focus:ring-primary/20 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="text-sm text-gray-600">Total Posts</div>
            <div className="text-3xl font-bold text-gray-900">{pagination?.total || 0}</div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="text-sm text-gray-600">Published</div>
            <div className="text-3xl font-bold text-green-600">
              {posts.filter((p: BlogPost) => p.status === "published").length}
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="text-sm text-gray-600">Drafts</div>
            <div className="text-3xl font-bold text-yellow-600">
              {posts.filter((p: BlogPost) => p.status === "draft").length}
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4 text-6xl">📝</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">No posts found</h3>
              <p className="mb-6 text-gray-600">
                {search ? "Try adjusting your search" : "Get started by creating your first post"}
              </p>
              <Link
                href="/admin/blog/create"
                className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white"
              >
                <Plus size={20} />
                Create Post
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {posts.map((post: BlogPost) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{post.title}</div>
                            <div className="line-clamp-1 text-sm text-gray-500">{post.excerpt}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {post.category?.name || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                              post.status
                            )}`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{post.views_count}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="hover:text-primary rounded p-2 text-gray-600 hover:bg-gray-100"
                              title="View"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              href={`/admin/blog/edit/${post.id}`}
                              className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-red-600"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                      {pagination.total} results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
                        disabled={pagination.page === 1}
                        className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
