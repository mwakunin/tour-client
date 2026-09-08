"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight, Search, Filter } from "lucide-react";
import { blogApi, type BlogPostFilters, type BlogPost, type BlogCategory } from "@/lib/api/blog";
import { queryKeys } from "@/lib/api/queryKeys";
import PageHero from "@/components/public/layout/PageHero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export default function BlogPage() {
  const [filters, setFilters] = useState<BlogPostFilters>({
    page: 1,
    limit: 9,
    status: "published",
    sort_by: "published_at",
    sort_order: "desc",
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.blog.posts.list(filters),
    queryFn: () => blogApi.getPublishedPosts(filters),
  });

  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.blog.categories.list(),
    queryFn: () => blogApi.getCategories(),
  });

  const posts = postsData?.data || [];
  const pagination = postsData?.pagination;

  const categories: BlogCategory[] = Array.isArray(categoriesData?.data) ? categoriesData.data : [];

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      page: 1,
    }));
  };

  const handleCategoryFilter = (categoryId?: number) => {
    setSelectedCategory(categoryId);
    setFilters((prev) => ({
      ...prev,
      category_id: categoryId,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        title="Safari Insights & Travel Tips"
        description="Expert advice, destination guides, and everything you need to plan your perfect African safari adventure"
        image={{ src: "/blogpage.webp", alt: "Safari landscape in East Africa" }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative max-w-xl flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search articles..."
              className="border-outline-variant bg-surface-container-lowest text-on-surface shadow-elevated focus:ring-primary w-full rounded-none border py-3 pr-12 pl-4 focus:ring-2 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-primary text-on-primary hover:bg-primary/90 absolute top-1/2 right-2 -translate-y-1/2 rounded-none p-2"
            >
              <Search size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="shrink-0 text-white" />
            <select
              value={selectedCategory || ""}
              onChange={(e) =>
                handleCategoryFilter(e.target.value ? Number(e.target.value) : undefined)
              }
              className="border-outline-variant bg-surface-container-lowest text-on-surface shadow-elevated focus:ring-primary rounded-none border px-4 py-3 focus:ring-2 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((category: BlogCategory) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Loading State */}
        {postsLoading && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-surface-container-high h-48" />
                <div className="bg-surface-container-lowest p-6">
                  <div className="bg-surface-container-high mb-4 h-4 rounded" />
                  <div className="bg-surface-container-high mb-2 h-6 rounded" />
                  <div className="bg-surface-container-high h-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blog Posts Grid */}
        {!postsLoading && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post: BlogPost) => (
                <div
                  key={post.id}
                  className="group bg-surface-container-lowest shadow-elevated overflow-hidden rounded-none"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="bg-surface-container-high relative h-48 overflow-hidden">
                      {post.featured_image ? (
                        <Image
                          src={post.featured_image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="from-primary/20 to-primary/5 flex h-full items-center justify-center bg-gradient-to-br">
                          <span className="text-4xl">📝</span>
                        </div>
                      )}
                      {post.category && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge variant="primary">{post.category.name}</Badge>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-6">
                    <div className="text-on-surface-variant mb-3 flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(post.published_at || post.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      {post.read_time_minutes && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{post.read_time_minutes} min read</span>
                        </div>
                      )}
                    </div>

                    <Link href={`/blog/${post.slug}`}>
                      <h3 className="text-on-surface group-hover:text-primary mb-3 line-clamp-2 text-xl font-bold transition-colors">
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-on-surface-variant mb-4 line-clamp-3">{post.excerpt}</p>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
                    >
                      Read More
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                    className: "disabled:cursor-not-allowed disabled:opacity-50",
                  })}
                >
                  Previous
                </button>

                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          buttonVariants({
                            variant: page === pagination.page ? "primary" : "secondary",
                            size: "sm",
                          })
                        )}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === pagination.page - 2 || page === pagination.page + 2) {
                    return (
                      <span key={page} className="text-on-surface-variant px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                    className: "disabled:cursor-not-allowed disabled:opacity-50",
                  })}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!postsLoading && posts.length === 0 && (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">📝</div>
            <h3 className="text-on-surface mb-2 text-2xl font-bold">No posts found</h3>
            <p className="text-on-surface-variant mb-6">
              {search || selectedCategory
                ? "Try adjusting your search or filter criteria"
                : "Check back soon for new content!"}
            </p>
            {(search || selectedCategory) && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(undefined);
                  setFilters({
                    page: 1,
                    limit: 9,
                    status: "published",
                    sort_by: "published_at",
                    sort_order: "desc",
                  });
                }}
                className={buttonVariants({ variant: "primary" })}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
