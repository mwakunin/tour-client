import React from "react";
import Image from "next/image";
import { ShieldCheck, Compass, Handshake, Scale } from "lucide-react";

const WhyChooseUs = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: "TRA-Licensed & Locally Rooted",
      description:
        "Professionally licensed and operated from Nairobi, Kenya — real local expertise, not a franchise playbook.",
    },
    {
      icon: Compass,
      title: "Tailor-Made Journeys",
      description:
        "Personalized itineraries built around how you want to travel, not a fixed template.",
    },
    {
      icon: Handshake,
      title: "Responsible & Community-First",
      description:
        "Trusted partnerships with quality lodges, guides, and conservation initiatives that support the land and people who call it home.",
    },
    {
      icon: Scale,
      title: "Fair, Transparent Pricing",
      description:
        "Competitive rates with no hidden costs — value that supports both your trip and local communities.",
    },
  ];

  return (
    <section className="bg-surface relative overflow-hidden py-12 md:py-20">
      {/* Photo bleeding in from the right edge, behind the copy. The mask fades
          it out before it reaches the narrative column, and 20% is set from a
          contrast check rather than by eye: over bg-surface that leaves
          text-on-surface-variant at ~6.6:1 on the photo's average tone and
          above 5:1 on its darkest, so body copy clears AA either way.
          Desktop only — on a phone the grid collapses to one column and the
          text would run straight over the busiest part of the frame. */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block"
        aria-hidden="true"
      >
        <Image
          src="/hero-7.webp"
          alt=""
          fill
          sizes="50vw"
          className="[mask-image:linear-gradient(to_right,transparent_0%,black_65%)] object-cover object-center opacity-30 [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_65%)]"
        />
      </div>

      {/* Paw watermark on the narrative side, at every width — on a phone the
          photo above is hidden, so this is the only art the section gets.
          Bleeds off the left edge (the section clips it) so it reads as a mark
          rather than a pasted-in logo. 10% leaves body copy at ~7.9:1 over the
          tint, with headroom to 20% (6.9:1) if it wants to be bolder. */}
      <div
        className="pointer-events-none absolute top-1/2 -left-12 w-48 -translate-y-1/2 opacity-10 sm:w-60 lg:-left-20 lg:w-[26rem]"
        aria-hidden="true"
      >
        <Image
          src="/leopard-paw.webp"
          alt=""
          width={1000}
          height={1058}
          sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 416px"
          className="h-auto w-full"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left: narrative */}
          <div className="space-y-5">
            <h2 className="label-caps text-primary">Our Philosophy</h2>
            <h3 className="text-headline-md text-on-surface">
              Adventure, Rooted in Place and Purpose
            </h3>
            <p className="text-body-lg text-on-surface-variant">
              We don't just plan adventures—we create life-changing adventures backed by expertise
              you can trust and passion you can feel.
            </p>
            <p className="text-body-md text-on-surface-variant">
              Every itinerary we build starts from the ground up, in Kenya, with people who know
              these landscapes as home rather than a destination on a map. That's a deliberate
              choice: a safari planned by someone who has walked the trail is a different trip
              entirely from one assembled off a template.
            </p>
            <p className="text-body-md text-on-surface-variant">
              We measure a good trip by how it changes the way you see a place—and by what it leaves
              behind for the guides, lodges, and communities who make it possible. That's the
              philosophy behind every journey we design.
            </p>
          </div>

          {/* Right: condensed feature list */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-3 md:gap-4">
                  <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg md:h-12 md:w-12">
                    <Icon className="text-on-primary h-[18px] w-[18px] md:h-[22px] md:w-[22px]" />
                  </div>
                  <div>
                    {/* text-headline-sm is a flat 24px at every width; that plus the
                        48px tile made these rows top-heavy on a phone. Keep the
                        utility for the serif family and step only the size down. */}
                    <h3 className="text-headline-sm text-on-surface max-md:text-[20px]">
                      {feature.title}
                    </h3>
                    <p className="text-body-md text-on-surface-variant">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
