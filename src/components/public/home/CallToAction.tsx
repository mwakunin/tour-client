import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const features = [
  "Free consultation & custom itineraries",
  "Expert local guides who know the land",
  "Small groups & personalized attention",
];

export default function CTASection() {
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-28">
      <Image
        src="/images/hero/safari-1.webp"
        alt="Safari guides watching wildlife across the grasslands"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/40 to-black/70" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="ml-auto max-w-xl text-right">
          <h2 className="text-headline-md text-white">Let's Plan Your Next Journey</h2>
          <p className="mt-4 text-lg leading-relaxed text-white/90">
            Tell us where you want to go, and we'll build a trip around you—not the other way
            around.
          </p>

          <div className="mt-8 flex flex-col items-end justify-end gap-3">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <span className="text-sm text-white">{feature}</span>
                <CheckCircle className="h-5 w-5 shrink-0 text-white" />
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-end justify-end gap-4 sm:flex-row sm:justify-end">
            <Link
              href="/tours"
              className={cn(
                buttonVariants({ variant: "secondary", size: "lg" }),
                "border-white text-white hover:bg-white/10 hover:text-white"
              )}
            >
              View Tours
            </Link>
            <Link
              href="/contact"
              className={cn(
                buttonVariants({ variant: "primary", size: "lg" }),
                "group text-primary hover:bg-primary border-white bg-white hover:text-white"
              )}
            >
              Get Started
              <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
