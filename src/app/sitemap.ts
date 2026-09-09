// app/sitemap.ts
import { MetadataRoute } from "next";
import { MAX_PAGE_SIZE } from "@/lib/api/constants";

const baseUrl = "https://www.footlooseadventures.co.ke";

// This runs on the server, where the shared axios client is unusable: its
// baseURL is relative in development and its error interceptor reads
// window.location. Talk to the API directly instead — the dev fallback matches
// the proxy target in next.config.ts.
// Prefers API_URL, matching the [slug] pages' generateMetadata — that is the
// var the /api/* rewrite also targets, so there is one origin to configure.
const apiBase =
  process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3000";

// Regenerate hourly rather than freezing whatever existed at build time
export const revalidate = 3600;

const fetchList = async (path: string): Promise<any[]> => {
  const response = await fetch(`${apiBase}/api/${path}`, {
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`GET /${path} responded ${response.status}`);
  }

  const body = await response.json();
  return Array.isArray(body?.data) ? body.data : [];
};

/** An unparseable timestamp would emit an invalid <lastmod>, so fall back to now. */
const lastModified = (value?: string) => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const routes = ["", "/tours", "/destinations", "/about", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    // allSettled, not all: one failing endpoint shouldn't drop the other's
    // URLs from the sitemap along with its own.
    const [destinationsResult, toursResult] = await Promise.allSettled([
      fetchList(`destinations?limit=${MAX_PAGE_SIZE}`),
      fetchList(`tours?limit=${MAX_PAGE_SIZE}&status=published`),
    ]);

    for (const result of [destinationsResult, toursResult]) {
      if (result.status === "rejected") {
        console.error("Sitemap: a list request failed:", result.reason);
      }
    }

    const destinations = destinationsResult.status === "fulfilled" ? destinationsResult.value : [];
    const tours = toursResult.status === "fulfilled" ? toursResult.value : [];

    const destinationRoutes = destinations.map((dest: any) => ({
      url: `${baseUrl}/destinations/${dest.slug}`,
      lastModified: lastModified(dest.updated_at),
      changeFrequency: "weekly" as const,
      priority: dest.featured ? 0.9 : 0.7,
    }));

    const tourRoutes = tours.map((tour: any) => ({
      url: `${baseUrl}/tours/${tour.slug}`,
      lastModified: lastModified(tour.updated_at),
      changeFrequency: "weekly" as const,
      priority: tour.featured ? 1.0 : 0.9,
    }));

    return [...routes, ...destinationRoutes, ...tourRoutes];
  } catch (error) {
    // A sitemap with only the static routes still beats a 500
    console.error("Error generating sitemap:", error);
    return routes;
  }
}
