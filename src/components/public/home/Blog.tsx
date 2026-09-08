"use client";

import { Calendar, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { blogApi, type BlogPost } from "@/lib/api/blog";
import { queryKeys } from "@/lib/api/queryKeys";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export default function BlogTravelTips() {
  // Fetch recent blog posts (limit to 3 for the homepage section)
  const { data: postsData, isLoading } = useQuery({
    queryKey: queryKeys.blog.posts.recent(),
    queryFn: () => blogApi.getRecentPosts(3),
  });

  const blogPosts: BlogPost[] = postsData?.data || [];

  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <h2 className="text-headline-md text-primary mb-3">From the Field</h2>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-body-lg text-on-surface-variant max-w-2xl">
                Notes, guides, and things worth knowing before you go.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-primary hover:text-primary/80 hidden items-center gap-2 font-semibold transition-colors md:inline-flex"
            >
              View All Articles
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest shadow-elevated animate-pulse overflow-hidden rounded-none"
              >
                <div className="bg-surface-container-high h-48" />
                <div className="p-6">
                  <div className="mb-3 flex gap-4">
                    <div className="bg-surface-container-high h-4 w-20 rounded" />
                    <div className="bg-surface-container-high h-4 w-20 rounded" />
                  </div>
                  <div className="bg-surface-container-high mb-3 h-6 rounded" />
                  <div className="mb-4 space-y-2">
                    <div className="bg-surface-container-high h-4 rounded" />
                    <div className="bg-surface-container-high h-4 rounded" />
                    <div className="bg-surface-container-high h-4 w-2/3 rounded" />
                  </div>
                  <div className="bg-surface-container-high h-4 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blog Grid */}
        {!isLoading && blogPosts.length > 0 && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-surface-container-lowest shadow-elevated cursor-pointer overflow-hidden rounded-none transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Image */}
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
                    {/* Category Badge */}
                    {post.category && (
                      <Badge variant="primary" className="absolute top-4 left-4 z-10">
                        {post.category.name}
                      </Badge>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6">
                  {/* Meta Info */}
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

                  {/* Title */}
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-headline-sm text-on-surface group-hover:text-primary mb-3 line-clamp-2 transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-body-md text-on-surface-variant mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary inline-flex items-center gap-2 font-semibold transition-all hover:gap-3"
                  >
                    <span aria-hidden="true">Read More</span>
                    <span className="sr-only">about {post.title}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && blogPosts.length === 0 && (
          <div className="py-16 text-center">
            <div className="mb-4 text-6xl">📝</div>
            <h3 className="text-on-surface mb-2 text-2xl font-bold">No posts yet</h3>
            <p className="text-on-surface-variant">Check back soon for new content!</p>
          </div>
        )}

        {/* Mobile View All Button */}
        {!isLoading && blogPosts.length > 0 && (
          <div className="mt-12 text-center md:hidden">
            <Link href="/blog" className={cn(buttonVariants({ variant: "primary" }), "gap-2")}>
              View All Articles
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
