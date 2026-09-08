// app/blog/[slug]/page.tsx
import { Metadata } from "next";
import { generateSEO } from "@/lib/utils/metadata";
import BlogDetailClient from "./BlogDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;

    // Use server-side URL (works during SSR)
    const apiUrl =
      process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // Fetch with timeout and proper error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

    const response = await fetch(`${apiUrl}/api/blog/posts/${slug}`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        title: "Post Not Found | Footloose Adventures Blog",
        description: "The blog post you are looking for could not be found.",
      };
    }

    const { data: post } = await response.json();

    if (!post) {
      return {
        title: "Post Not Found | Footloose Adventures Blog",
        description: "The blog post you are looking for could not be found.",
      };
    }

    // Generate keywords from post data
    const keywords = [
      post.title,
      post.category?.name || "",
      "Kenya safari blog",
      "African safari stories",
      "wildlife blog",
      "safari tips",
      "travel blog Kenya",
    ].filter(Boolean);

    return generateSEO({
      title: post.meta_title || `${post.title} | Footloose Adventures Blog`,
      description:
        post.meta_description ||
        post.excerpt ||
        post.content?.substring(0, 160).replace(/<[^>]*>/g, "") || // Strip HTML tags
        "Read this article on our safari blog",
      image: post.featured_image || "/og-image.jpg",
      url: `https://www.footlooseadventures.co.ke/blog/${post.slug}`,
      type: "article",
      keywords,
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
    });
  } catch {
    // Return fallback metadata
    return {
      title: "Safari Blog | Footloose Adventures",
      description: "Discover safari stories, wildlife insights, and travel tips from Kenya",
    };
  }
}

// Pass slug as prop to client component
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BlogDetailClient slug={slug} />;
}
