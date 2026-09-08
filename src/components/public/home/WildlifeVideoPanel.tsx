"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface WildlifeVideoPanelProps {
  imageSrc: string;
  videoSrc: string;
  alt: string;
  eyebrow?: string;
  caption?: string;
  showPlayButton?: boolean;
}

export default function WildlifeVideoPanel({
  imageSrc,
  videoSrc,
  alt,
  eyebrow,
  caption,
  showPlayButton = false,
}: WildlifeVideoPanelProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Don't fetch the video until the panel is near the viewport.
   *
   * These panels sit well below the fold, but `autoPlay` makes the browser
   * download the media immediately regardless of any `preload` hint — so
   * rendering the <video> eagerly pulled ~3.6MB on first paint for clips most
   * visitors never scrolled to. Withholding the element itself is the only
   * reliable way to defer that. The poster <Image> below renders either way,
   * so the panel never looks empty.
   */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Without IntersectionObserver, fall back to loading straight away.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect(); // one-shot: once loaded, keep it
        }
      },
      // Start slightly before the panel scrolls in, so playback has a head
      // start rather than popping in visibly.
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="shadow-elevated relative h-full min-h-[360px] overflow-hidden lg:min-h-[480px]"
    >
      <Image
        src={imageSrc}
        alt={alt}
        fill
        quality={75}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover object-center"
      />
      {/* Drop the real wildlife video file at videoSrc — one-line swap, no other changes needed. */}
      {inView && !videoFailed && (
        <video
          className="absolute inset-0 h-full w-full object-cover object-center"
          src={videoSrc}
          poster={imageSrc}
          muted
          autoPlay
          loop
          playsInline
          onError={() => setVideoFailed(true)}
        />
      )}
      <div className="from-inverse-surface/70 via-inverse-surface/10 absolute inset-0 bg-gradient-to-t to-transparent" />

      {showPlayButton && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-inverse-surface/40 ring-inverse-on-surface/50 flex h-16 w-16 items-center justify-center rounded-full ring-1 backdrop-blur-sm">
            <Play className="text-inverse-on-surface ml-1 h-6 w-6" fill="currentColor" />
          </div>
        </div>
      )}

      {(eyebrow || caption) && (
        <div className="absolute bottom-0 left-0 p-6">
          {eyebrow && <span className="label-caps text-inverse-on-surface/80">{eyebrow}</span>}
          {caption && <p className="text-headline-sm text-inverse-on-surface mt-2">{caption}</p>}
        </div>
      )}
    </div>
  );
}
