import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
  tagline?: string;
  footer: ReactNode;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  imageSrc,
  imageAlt,
  tagline,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left panel - form */}
      <div className="bg-inverse-surface text-inverse-on-surface short:py-6 shorter:py-4 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="short:mb-6 shorter:mb-4 mb-10 flex items-center justify-between gap-4">
            {/* The paw mark rather than the wordmark — the page title carries the
                name, so the logo only has to be recognisable. Orange on this dark
                panel is 3.1:1, past the 3:1 floor for a non-text graphic, so it
                needs no plate behind it. Same mark as the page loader. */}
            <Link href="/" className="inline-flex shrink-0">
              <Image
                src="/leopard-paw.webp"
                alt="Footloose Adventures"
                width={1000}
                height={1058}
                className="short:h-12 shorter:h-10 h-14 w-auto object-contain sm:h-16"
                priority
              />
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "text-inverse-on-surface decoration-inverse-on-surface/40 hover:text-primary shrink-0 px-0"
              )}
            >
              ← Back
            </Link>
          </div>

          <h1 className="text-headline-md text-inverse-on-surface">{title}</h1>
          <p className="text-body-md text-inverse-on-surface/70 mt-2">{subtitle}</p>

          <div className="short:mt-5 shorter:mt-4 mt-8">{children}</div>

          <div className="short:mt-5 shorter:mt-4 mt-8 text-center">{footer}</div>
        </div>
      </div>

      {/* Right panel - image */}
      <div className="relative hidden lg:block">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          quality={75}
          sizes="50vw"
          className="object-cover object-center"
        />
        <div className="from-inverse-surface/70 absolute inset-0 bg-gradient-to-t to-transparent" />
        <div className="from-inverse-surface/40 absolute inset-0 bg-gradient-to-r to-transparent" />
        {tagline && (
          <div className="absolute right-0 bottom-0 left-0 p-10">
            <span className="label-caps text-inverse-on-surface/80">Footloose Adventures</span>
            <p className="text-headline-md text-inverse-on-surface mt-2">{tagline}</p>
          </div>
        )}
      </div>
    </div>
  );
}
