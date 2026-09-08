// lib/utils/metadata.ts
import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
}

export function generateSEO({
  title,
  description,
  image = "https://www.footlooseadventures.co.ke/og-image.jpg",
  url = "https://www.footlooseadventures.co.ke",
  type = "website",
  keywords = [],
  publishedTime,
  modifiedTime,
}: SEOProps): Metadata {
  const siteName = "Footloose Adventures";
  const fullTitle = `${title} | ${siteName}`;

  return {
    // Basic Meta Tags
    title: fullTitle,
    description,
    keywords: keywords.join(", "),

    // Open Graph (Facebook, LinkedIn, WhatsApp)
    openGraph: {
      type,
      title: fullTitle,
      description,
      url,
      siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en",
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@FootlooseAdv", // Change to your Twitter handle
      site: "@footlooseadventures",
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Canonical URL
    alternates: {
      canonical: url,
    },
  };
}
