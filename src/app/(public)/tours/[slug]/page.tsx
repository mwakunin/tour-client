import { Metadata } from "next";
import { generateSEO } from "@/lib/utils/metadata";
import TourDetailClient from "./TourDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;

    // ✅ Use server-side URL (works during SSR)
    const apiUrl =
      process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    console.log(`[Metadata] Fetching tour: ${apiUrl}/api/tours/slug/${slug}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

    const response = await fetch(`${apiUrl}/api/tours/slug/${slug}`, {
      next: { revalidate: 60 }, // ✅ Only use this for caching
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId); // ✅ Clear timeout after response

    if (!response.ok) {
      console.error(`[Metadata] API returned ${response.status}`);
      return {
        title: "Tour Not Found | Footloose Adventures",
        description: "The safari tour you are looking for could not be found.",
      };
    }

    const { data: tour } = await response.json();

    if (!tour) {
      return {
        title: "Tour Not Found | Footloose Adventures",
        description: "The safari tour you are looking for could not be found.",
      };
    }

    // ✅ Safe keyword generation
    const keywords = [
      tour.title,
      ...(tour.tags || []),
      ...(tour.categories || []),
      "Kenya safari",
      "African safari",
      "wildlife tour",
      tour.duration_unit === "days" ? `${tour.duration} day safari` : "",
    ].filter(Boolean);

    return generateSEO({
      title: tour.meta_title || tour.title,
      description:
        tour.meta_description ||
        tour.overview?.substring(0, 160) ||
        "Explore this amazing safari tour",
      image: tour.cover_image || tour.images?.[0] || "/images/default-tour.jpg",
      url: `https://www.footlooseadventures.co.ke/tours/${tour.slug}`,
      type: "article",
      keywords,
      publishedTime: tour.created_at,
      modifiedTime: tour.updated_at,
    });
  } catch (error: any) {
    console.error("[Metadata] Error:", error.message || error);

    // ✅ Return fallback metadata instead of just title
    return {
      title: "Safari Tours | Footloose Adventures",
      description: "Experience unforgettable safari adventures in Kenya",
    };
  }
}

// ✅ Pass slug as prop to client component
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TourDetailClient slug={slug} />;
}
