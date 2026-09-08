import { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface PageHeroProps {
  title: string;
  description?: string;
  image?: { src: string; alt: string };
  height?: "compact" | "tall";
  children?: ReactNode;
  align?: "center" | "left";
}

/**
 * Stock hero art for pages that have no imagery of their own — without an
 * image PageHero falls back to a flat primary gradient, which reads as an
 * unfinished page next to the photographed heroes everywhere else.
 */
export const HERO_LIONESS: { src: string; alt: string } = {
  src: "/hero-5.webp",
  alt: "A lioness crossing the red earth of the Kenyan bush",
};

export const HERO_LION_PRIDE: { src: string; alt: string } = {
  src: "/hero-7.webp",
  alt: "Lionesses resting in golden grass beneath the bush",
};

export default function PageHero({
  title,
  description,
  image,
  height = "tall",
  children,
  align = "center",
}: PageHeroProps) {
  // The floor is what actually sets a compact hero's height on pages whose only
  // content is a title. At 300px those sat ~110px shorter than /tours and
  // /destinations, which are also "compact" but fill past the floor with a
  // description plus a search field. Matching the floor to that natural height
  // keeps every compact hero the same size regardless of what's inside it.
  const heightClass =
    height === "compact"
      ? "min-h-[400px] py-16 pt-28 md:min-h-[420px] md:pt-32"
      : "py-24 pt-32 md:pt-40";
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <section
      className={cn(
        "relative flex flex-col justify-center overflow-hidden",
        heightClass,
        image ? "bg-inverse-surface" : "bg-gradient-to-br from-primary to-primary-container"
      )}
    >
      {image && (
        <>
          <Image src={image.src} alt={image.alt} fill priority className="object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </>
      )}

      <div className={cn("container relative z-10 mx-auto flex flex-col px-4", alignClass)}>
        <h1 className="text-display-lg text-white">{title}</h1>
        {description && (
          <p className="mt-4 max-w-2xl text-body-lg text-white/90">{description}</p>
        )}
        {children && <div className="mt-8 w-full max-w-2xl">{children}</div>}
      </div>
    </section>
  );
}
