"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

// Drop the real hero video file at this path — one-line swap, no other changes needed.
const HERO_VIDEO_SRC = "/videos/hero-small-elephants-v2.mp4";
const HERO_FALLBACK_IMAGE = "/images/hero/safari-1.webp";

export default function Hero() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section className="relative flex h-[85vh] items-center justify-center overflow-hidden md:h-screen">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={HERO_FALLBACK_IMAGE}
          alt="Safari"
          fill
          priority
          fetchPriority="high"
          quality={75}
          sizes="100vw"
          className="object-cover object-center"
        />
        {!videoFailed && (
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            src={HERO_VIDEO_SRC}
            poster={HERO_FALLBACK_IMAGE}
            muted
            autoPlay
            loop
            playsInline
            // Deliberately not preload="auto". The <Image> above is the LCP
            // element and is marked fetchPriority="high"; forcing the full
            // 2.3MB video to buffer alongside it just delays the paint the
            // visitor actually waits on. autoPlay still fetches what it needs
            // to start, and the poster covers the gap.
            preload="metadata"
            onError={() => setVideoFailed(true)}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/25" />
      </div>

      {/* Content */}
      {/* The header is fixed, so it overlays this section instead of taking up
          space, and centring against the full height leaves the heading sitting
          too close under it. Padding the flex child by the header's own 64px
          shifts the text down half that — the offset needed to centre it in the
          space actually visible below the navbar. */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-16 text-center sm:px-6 md:pt-0 lg:px-8">
        <h1 className="text-display-lg mx-auto max-w-3xl font-serif leading-tight font-bold text-white">
          Magical African Safaris <br />
          <span className="text-primary">Tailored for you </span>
        </h1>
        <div className="mt-8">
          <Link
            href="/tours"
            className={cn(
              buttonVariants({ variant: "primary", size: "lg" }),
              "hover:border-primary hover:text-primary border-white text-white"
            )}
          >
            Plan Your Safari
          </Link>
        </div>
      </div>
    </section>
  );
}
