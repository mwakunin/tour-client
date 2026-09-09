// app/(public)/destinations/[slug]/page.tsx
import { Metadata } from "next";
import { generateSEO } from "@/lib/utils/metadata";
import DestinationDetailClient from "./DestinationDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>; // ✅ Next.js 15 requires Promise
}): Promise<Metadata> {
  try {
    const { slug } = await params; // ✅ Await params

    const apiUrl =
      process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    console.log(`[Metadata] Fetching destination: ${apiUrl}/api/destinations/slug/${slug}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`${apiUrl}/api/destinations/slug/${slug}`, {
      next: { revalidate: 60 },
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[Metadata] API returned ${response.status}`);
      return {
        title: "Destination Not Found | Footloose Adventures",
        description: "The destination you are looking for could not be found.",
      };
    }

    const { data: destination } = await response.json();

    if (!destination) {
      return {
        title: "Destination Not Found | Footloose Adventures",
        description: "The destination you are looking for could not be found.",
      };
    }

    const keywords = [
      destination.title,
      destination.country,
      destination.region,
      "Kenya safari",
      "African safari destination",
      "wildlife safari",
      "safari tours",
    ].filter(Boolean);

    return generateSEO({
      title: destination.meta_title || `${destination.title} Safari Tours`,
      description:
        destination.meta_description ||
        destination.description?.substring(0, 160) ||
        "Explore this amazing destination",
      image: destination.image || "/images/default-destination.jpg",
      url: `https://www.footlooseadventures.co.ke/destinations/${destination.slug}`,
      type: "article",
      keywords,
    });
  } catch (error: any) {
    console.error("[Metadata] Error:", error.message || error);
    return {
      title: "Safari Destinations | Footloose Adventures",
      description: "Explore amazing safari destinations in Kenya",
    };
  }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DestinationDetailClient slug={slug} />; // ✅ Pass slug as prop
}
