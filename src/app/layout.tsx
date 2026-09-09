import type { Metadata } from "next";
import { Newsreader, Be_Vietnam_Pro, Work_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Providers from "../providers/queryprovider";
import { PHProvider } from "@/providers/posthog";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "sonner";
import PageLoader from "@/components/public/layout/PageLoader";
import WhatsAppWidget from "@/components/public/layout/WhatsAppWidget";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  // 700 backs the hero headline — without it the browser synthesises a faux-bold.
  weight: ["400", "500", "700"],
  display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  variable: "--font-be-vietnam-pro",
  weight: ["400", "500", "600"],
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.footlooseadventures.co.ke"),
  title: {
    default: "Footloose Adventures | Into the Wild",
    template: "%s | Footloose Adventures",
  },
  description:
    "Wander Kenya on your own terms with Footloose Adventures. Flexible safari and coastal adventures, expert local guides, and no rigid itineraries — just Africa, unscripted.",
  keywords: [
    "Kenya safari",
    "African safari",
    "Maasai Mara",
    "flexible safari tours",
    "Kenya tours",
    "Big Five safari",
    "Amboseli National Park",
    "Tsavo safari",
    "beach safari combo",
    "independent travel Kenya",
  ],
  authors: [{ name: "Footloose Adventures" }],
  creator: "Footloose Adventures",
  publisher: "Footloose Adventures",
  openGraph: {
    type: "website",
    locale: "en",
    url: "https://www.footlooseadventures.co.ke",
    siteName: "Footloose Adventures",
    title: "Footloose Adventures | Into the Wild",
    description: "Wander Kenya on your own terms with flexible safari and coastal adventures.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Footloose Adventures - Into the Wild",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Footloose Adventures | Into the Wild",
    description: "Wander Kenya on your own terms — flexible safari and coastal adventures.",
    creator: "@FootlooseAdv",
    images: ["/twitter-image.jpg"],
  },
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

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-64x64.png", sizes: "64x64", type: "image/png" },
    ],
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  verification: {
    google: "your-google-verification-code", // Add when you get it from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${beVietnamPro.variable} ${workSans.variable}`}
    >
      <head>
        {/* ✅ Preload critical images — both header wordmarks. The colour one is
            mounted from the start (hidden at opacity-0) so it can cross-fade in
            on scroll without a fetch at that moment. */}
        <link rel="preload" as="image" href="/LOGO_WHITE.webp" />
        <link rel="preload" as="image" href="/LOGO_COLOR.webp" />
      </head>
      {/* Browser extensions (ColorZilla, Grammarly, etc.) inject attributes onto
          <body> before hydration; this silences those false positives only. */}
      <body className="font-sans antialiased" suppressHydrationWarning>
        <PageLoader />
        <PHProvider>
          <AuthProvider>
            <Providers>
              <ToastProvider>{children}</ToastProvider>
              {/* sonner's renderer — without it every toast.success/error call
                  in the app is a no-op, which is why admin saves looked silent */}
              <Toaster position="top-right" richColors closeButton duration={6000} />
            </Providers>
          </AuthProvider>
        </PHProvider>
        <WhatsAppWidget />
      </body>
    </html>
  );
}
