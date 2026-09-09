"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Eye, Image as ImageIcon } from "lucide-react";
import { blogApi, type CreateBlogPostData, type BlogCategory } from "@/lib/api/blog";
import { queryKeys } from "@/lib/api/queryKeys";
import { toast } from "sonner";
import Link from "next/link";
import ImageUploader from "@/components/admin/forms/ImageUploader";
import RichTextEditor from "@/components/admin/forms/RichTextEditor";

export default function BlogPostForm() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const postId = params?.id ? Number(params.id) : null;
  const isEditing = !!postId;

  const [formData, setFormData] = useState<CreateBlogPostData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image: "",
    category_id: undefined,
    status: "draft",
    meta_title: "",
    meta_description: "",
  });

  const [showImageUploader, setShowImageUploader] = useState(false);

  // Fetch post data if editing
  const { data: postData, isLoading: loadingPost } = useQuery({
    queryKey: queryKeys.blog.posts.detailById(postId!),
    queryFn: () => blogApi.getPostById(postId!),
    enabled: isEditing,
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesFailed,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: queryKeys.blog.categories.list(),
    queryFn: () => blogApi.getCategories(),
    // A failed fetch here leaves an empty dropdown, so retry once rather than
    // making the user reload to get their categories back.
    retry: 1,
  });

  const categories: BlogCategory[] = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

  // Populate form when editing
  useEffect(() => {
    if (postData?.data) {
      const post = postData.data;
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image || "",
        category_id: post.category_id,
        status: post.status,
        meta_title: post.meta_title || "",
        meta_description: post.meta_description || "",
      });
    }
  }, [postData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateBlogPostData) => blogApi.createPost(data),
    onSuccess: () => {
      toast.success("Post created successfully");
      // The root reaches the public blog list and the home feed, not just the
      // admin table — a published post has to show up for visitors too.
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.posts.all });
      router.push("/admin/blog");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create post");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CreateBlogPostData) => blogApi.updatePost(postId!, data),
    onSuccess: () => {
      toast.success("Post updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.blog.posts.all });
      router.push("/admin/blog");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update post");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "category_id" ? (value ? Number(value) : undefined) : value,
    }));

    // Auto-generate slug from title
    if (name === "title" && !isEditing) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  // Handle rich text editor content change
  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleImageUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setFormData((prev) => ({ ...prev, featured_image: urls[0] }));
      setShowImageUploader(false);
      toast.success("Image uploaded successfully");
    }
  };

  const handleSubmit = (e: React.FormEvent, status?: "draft" | "published") => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.slug?.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error("Excerpt is required");
      return;
    }
    if (!formData.content.trim() || formData.content === "<p><br></p>") {
      toast.error("Content is required");
      return;
    }

    const dataToSubmit = {
      ...formData,
      status: status || formData.status,
      category_id: formData.category_id || undefined,
      featured_image: formData.featured_image || undefined,
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(dataToSubmit);
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingPost) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/blog"
            className="text-primary hover:text-primary/80 mb-4 inline-flex items-center gap-2 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Posts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Post" : "Create New Post"}
          </h1>
        </div>

        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Title */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <label className="mb-2 block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter post title..."
                  className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:outline-none"
                />
              </div>

              {/* Slug */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <label className="mb-2 block text-sm font-medium text-gray-700">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="post-url-slug"
                  className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm focus:ring-2 focus:outline-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  URL-friendly version of the title. Auto-generated from title.
                </p>
              </div>

              {/* Excerpt */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <label className="mb-2 block text-sm font-medium text-gray-700">Excerpt *</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  required
                  rows={3}
                  maxLength={500}
                  placeholder="Brief summary of the post (50-500 characters)..."
                  className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:outline-none"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {formData.excerpt.length} / 500 characters
                </p>
              </div>

              {/* Rich Text Content */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <label className="mb-2 block text-sm font-medium text-gray-700">Content *</label>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Write your blog content here... Use the toolbar to format text, add images, links, and more."
                />
                <p className="mt-2 text-xs text-gray-500">
                  Use the toolbar above to format your content. Click the image icon to insert
                  images.
                </p>
              </div>

              {/* SEO Fields */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">SEO Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      maxLength={60}
                      placeholder="SEO title (max 60 characters)"
                      className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.meta_title?.length || 0} / 60 characters
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Meta Description
                    </label>
                    <textarea
                      name="meta_description"
                      value={formData.meta_description}
                      onChange={handleChange}
                      maxLength={160}
                      rows={3}
                      placeholder="SEO description (max 160 characters)"
                      className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.meta_description?.length || 0} / 160 characters
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Publish</h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, "draft")}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Save as Draft
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, "published")}
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          {isEditing ? "Update & Publish" : "Publish"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Category</h3>
                <select
                  name="category_id"
                  value={formData.category_id || ""}
                  onChange={handleChange}
                  disabled={categoriesLoading || categoriesFailed}
                  className="focus:border-primary focus:ring-primary/20 w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  {/* An empty dropdown must never be ambiguous — say which of
                      loading, failed, or genuinely empty it is. */}
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories…"
                      : categoriesFailed
                        ? "Categories unavailable"
                        : "No Category"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoriesFailed && (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-sm text-red-600">Could not load categories.</p>
                    <button
                      type="button"
                      onClick={() => refetchCategories()}
                      className="text-primary text-sm underline"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {!categoriesLoading && !categoriesFailed && categories.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">No categories created yet.</p>
                )}
              </div>

              {/* Featured Image */}
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Featured Image</h3>

                {formData.featured_image && !showImageUploader ? (
                  <div className="space-y-4">
                    <div className="overflow-hidden rounded-lg">
                      <img src={formData.featured_image} alt="Featured" className="h-auto w-full" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImageUploader(true)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <ImageIcon size={18} />
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, featured_image: "" }))}
                      className="w-full rounded-lg border border-red-300 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <>
                    {showImageUploader ? (
                      <div className="space-y-4">
                        <ImageUploader
                          onUploadComplete={handleImageUpload}
                          folder="blog"
                          maxFiles={1}
                          multiple={false}
                        />
                        <button
                          type="button"
                          onClick={() => setShowImageUploader(false)}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowImageUploader(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        <ImageIcon size={18} />
                        Upload Image
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Preview Link */}
              {isEditing && postData?.data && (
                <Link
                  href={`/blog/${postData.data.slug}`}
                  target="_blank"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Eye size={18} />
                  Preview Post
                </Link>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
