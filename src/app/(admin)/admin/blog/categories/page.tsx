"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { blogApi, type CreateCategoryData, type BlogCategory } from "@/lib/api/blog";
import { queryKeys } from "@/lib/api/queryKeys";
import { toast } from "sonner";

export default function BlogCategoriesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    slug: "",
    description: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.blog.categories.list(),
    queryFn: () => blogApi.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryData) => blogApi.createCategory(data),
    onSuccess: () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.categories.all });
      resetForm();
    },
    onError: () => {
      toast.error("Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCategoryData }) =>
      blogApi.updateCategory(id, data),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.categories.all });
      // Posts carry their category's name inline (the API joins it into every
      // post row), so a rename leaves stale labels on cached post lists.
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.posts.all });
      resetForm();
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => blogApi.deleteCategory(id),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.categories.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.posts.all });
    },
    onError: (error: any) => {
      // The API refuses to delete a category that still has posts and names the
      // count in its message — far more useful than a generic failure.
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });

  //const categories = data?.data || [];
  // Handle different possible data structures
  const categories = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "" });
    setEditingCategory(null);
    setShowModal(false);
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (
      window.confirm(
        `Delete category "${name}"? Categories that still have posts cannot be deleted.`
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    }));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Categories</h1>
            <p className="mt-2 text-gray-600">Organize your blog posts into categories</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white"
          >
            <Plus size={20} />
            New Category
          </button>
        </div>

        {/* Categories Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="mt-4 text-gray-600">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4 text-6xl">📁</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">No categories yet</h3>
              <p className="mb-6 text-gray-600">Create your first category to organize posts</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-white"
              >
                <Plus size={20} />
                Create Category
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categories.map((category: BlogCategory) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-600">{category.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {category.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id, category.name)}
                          className="rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingCategory ? "Edit Category" : "New Category"}
                </h2>
                <button
                  onClick={resetForm}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Travel Tips"
                    className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder="travel-tips"
                    className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:ring-2 focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-gray-500">Auto-generated from name</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                    placeholder="Brief description of this category..."
                    className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90 flex-1 rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : editingCategory ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
