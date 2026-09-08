// lib/imageLoader.ts

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageKitLoader({ src, width, quality }: ImageLoaderProps): string {
  // ✅ Handle ImageKit URLs (path-based transformations)
  if (src.startsWith("https://ik.imagekit.io")) {
    try {
      const url = new URL(src);
      const pathParts = url.pathname.split("/");

      // Build transformation string
      const transformations = [
        `w-${width}`,
        `q-${quality || 75}`,
        "f-auto", // Auto format (WebP/AVIF)
        "fo-auto", // Auto focus
      ].join(",");

      // Check if transformations already exist
      const trIndex = pathParts.findIndex((part) => part.startsWith("tr:"));

      if (trIndex !== -1) {
        // Replace existing transformations
        pathParts[trIndex] = `tr:${transformations}`;
      } else {
        // Insert after account ID (index 2: ['', 'account-id', ...])
        pathParts.splice(2, 0, `tr:${transformations}`);
      }

      // Rebuild URL with transformations in path
      url.pathname = pathParts.join("/");

      // ✅ Return with transformations in PATH, not query
      return url.toString();
    } catch (error) {
      console.error("[ImageKit] Error optimizing URL:", error);
      return src; // Fallback to original
    }
  }

  // ✅ Handle Unsplash images (query-based)
  if (src.startsWith("https://images.unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("q", (quality || 75).toString());
    url.searchParams.set("auto", "format");
    return url.toString();
  }

  // ✅ For local images, add parameters so Next.js can optimize
  if (src.startsWith("/")) {
    return `${src}?w=${width}&q=${quality || 75}`;
  }

  // ✅ Fallback for any other cases
  return src;
}
