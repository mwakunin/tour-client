// app/blog/[slug]/BlogDetailClient.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowLeft, Tag, User, Eye } from "lucide-react";
import { blogApi, type BlogPost } from "@/lib/api/blog";
import { queryKeys } from "@/lib/api/queryKeys";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BlogDetailClient({ slug }: { slug: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.blog.posts.detailBySlug(slug),
    queryFn: () => blogApi.getPublishedPostBySlug(slug),
    enabled: !!slug,
  });

  const { data: relatedPostsData } = useQuery({
    queryKey: queryKeys.blog.posts.related(data?.data?.category_id),
    queryFn: () => blogApi.getPostsByCategory(data.data.category_id!, { limit: 3 }),
    enabled: !!data?.data?.category_id,
  });

  const post = data?.data;
  const relatedPosts = relatedPostsData?.data?.filter((p: BlogPost) => p.slug !== slug) || [];

  if (isLoading) {
    return (
      <div className="bg-surface min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="animate-pulse">
            <div className="bg-surface-container-high mb-6 h-8 w-32 rounded" />
            <div className="bg-surface-container-high mb-4 h-12 rounded" />
            <div className="bg-surface-container-high mb-8 h-6 w-3/4 rounded" />
            <div className="bg-surface-container-high mb-8 h-96 rounded" />
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-surface-container-high h-4 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-surface flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">📝</div>
          <h2 className="text-on-surface mb-2 text-2xl font-bold">Post Not Found</h2>
          <p className="text-on-surface-variant mb-6">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/blog" className={buttonVariants({ variant: "primary" })}>
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen pt-15">
      {/* Header */}
      <div className="border-outline-variant bg-surface-container-lowest border-b">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <Link
            href="/blog"
            className="text-primary hover:text-primary/80 inline-flex items-center gap-2 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-12">
        {/* Category Badge */}
        {post.category && (
          <div className="mb-4">
            <Link href={`/blog?category=${post.category.id}`}>
              <Badge
                variant="primary"
                className="inline-flex items-center gap-1 px-4 py-1.5 text-sm"
              >
                <Tag size={14} />
                {post.category.name}
              </Badge>
            </Link>
          </div>
        )}

        {/* Title */}
        <h1 className="text-on-surface mb-6 text-4xl font-bold md:text-5xl">{post.title}</h1>

        {/* Meta Info */}
        <div className="text-on-surface-variant mb-8 flex flex-wrap items-center gap-6">
          {post.author && (
            <div className="flex items-center gap-2">
              <User size={18} />
              <span className="font-medium">{post.author.name}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={18} />
            <span>
              {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {post.read_time_minutes && (
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{post.read_time_minutes} min read</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Eye size={18} />
            <span>{post.views_count} views</span>
          </div>
        </div>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="relative mb-10 h-[500px] overflow-hidden rounded-none">
            <Image
              src={post.featured_image}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="[&_a]:text-primary hover:[&_a]:text-primary/80 [&_blockquote]:border-outline-variant [&_blockquote]:text-on-surface-variant [&_code]:bg-surface-container-high [&_code]:text-on-surface [&_em]:text-on-surface-variant [&_h1]:text-on-surface [&_h2]:text-on-surface [&_h3]:text-on-surface [&_li]:text-on-surface-variant [&_p]:text-on-surface-variant [&_pre]:bg-surface-container-highest [&_pre]:text-on-surface [&_strong]:text-on-surface max-w-none [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded-none [&_code]:px-2 [&_code]:py-1 [&_code]:text-sm [&_em]:italic [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-2xl [&_h3]:font-bold [&_img]:my-6 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-none [&_li]:leading-relaxed [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_p]:mb-4 [&_p]:text-base [&_p]:leading-relaxed [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-none [&_pre]:p-4 [&_strong]:font-bold [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Last Updated */}
        <div className="border-outline-variant mt-12 border-t pt-8">
          <div className="text-on-surface-variant text-sm">
            Last updated: {new Date(post.updated_at).toLocaleDateString()}
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-on-surface mb-6 text-2xl font-bold">Related Articles</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost: BlogPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-surface-container-lowest shadow-elevated overflow-hidden rounded-none"
                >
                  <div className="bg-surface-container-high relative h-32 overflow-hidden">
                    {relatedPost.featured_image ? (
                      <Image
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="from-primary/20 to-primary/5 flex h-full items-center justify-center bg-gradient-to-br">
                        <span className="text-2xl">📝</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-on-surface group-hover:text-primary line-clamp-2 font-bold transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-on-surface-variant mt-2 line-clamp-2 text-sm">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
