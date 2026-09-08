import {
  Award,
  Target,
  Eye,
  Compass,
  Leaf,
  ShieldCheck,
  HeartHandshake,
  LifeBuoy,
  Check,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/public/layout/PageHero";
import { buttonVariants } from "@/components/ui/button";

export default function AboutPage() {
  const coreValues = [
    {
      icon: Award,
      title: "Excellence",
      description:
        "We are committed to delivering exceptional service, meticulous planning, and unforgettable travel experiences that exceed our clients' expectations.",
    },
    {
      icon: ShieldCheck,
      title: "Integrity",
      description:
        "We conduct our business with honesty, transparency, and professionalism, building lasting relationships based on trust and reliability.",
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description:
        "We believe tourism should protect wildlife, preserve natural habitats, and create positive social and economic benefits for local communities.",
    },
    {
      icon: HeartHandshake,
      title: "Community Partnership",
      description:
        "We work hand in hand with local communities because we believe they are essential partners in conserving Africa's wildlife and cultural heritage.",
    },
    {
      icon: Compass,
      title: "Authentic Experiences",
      description:
        "We create journeys that immerse travelers in the genuine beauty, cultures, and wildlife of East Africa while respecting local traditions and environments.",
    },
    {
      icon: LifeBuoy,
      title: "Safety & Reliability",
      description:
        "The comfort and safety of our guests are our highest priorities. We work with trusted guides, accommodation partners, and transport providers to ensure every journey is smooth, secure, and memorable.",
    },
  ];

  const whyChooseUs = [
    "TRA-licensed and professionally operated from Nairobi, Kenya.",
    "Personalized, tailor-made safari itineraries.",
    "Expert local knowledge across Kenya and East Africa.",
    "Trusted partnerships with quality lodges, camps, airlines, and guides.",
    "Commitment to responsible tourism and conservation.",
    "Competitive pricing with exceptional value.",
    "Dedicated customer support before, during, and after your journey.",
  ];

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        title="About Footloose Adventures"
        description="TRA-licensed safaris across Kenya and East Africa, crafted from Nairobi"
        image={{
          src: "/images/hero/safari-1.webp",
          alt: "Wildebeest and a safari vehicle in the Maasai Mara",
        }}
      />

      {/* Our Story Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-on-surface mb-6 font-serif text-3xl font-bold md:text-4xl">
              Footloose Adventures
            </h2>
            <div className="space-y-4">
              <p className="text-on-surface-variant">
                At Footloose Adventures, we believe that travel is more than just visiting
                destinations, it's about creating meaningful experiences, connecting with nature,
                and leaving a positive impact on the places and people you encounter.
              </p>
              <p className="text-on-surface-variant">
                Based in Nairobi, Kenya, Footloose Adventures is a Tourism Regulatory Authority
                (TRA)-licensed tour operator specializing in unforgettable safaris across Kenya and
                East Africa. From the world-famous Maasai Mara and Amboseli to the pristine beaches
                of the Kenyan and Zanzibar coast, the mountain gorillas of Uganda, the vast
                Serengeti of Tanzania, and the hidden gems across the region, we craft journeys that
                showcase the very best East Africa has to offer.
              </p>
              <p className="text-on-surface-variant">
                Our team combines local knowledge, personalized service, and attention to detail to
                design tailor-made adventures for honeymooners, families, solo travelers,
                photographers, groups, and wildlife enthusiasts. Whether you're looking for a luxury
                safari, a budget-friendly adventure, a cultural experience, or a bush-and-beach
                holiday, we are committed to delivering seamless travel experiences from the moment
                you arrive until your journey ends.
              </p>
            </div>
          </div>
          <div className="shadow-elevated relative h-96 overflow-hidden rounded-none">
            <Image
              src="/images/hero/safari-5.webp"
              alt="Guests watching an elephant herd from a safari vehicle"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Conservation */}
      <div className="bg-surface-container-lowest py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-on-surface font-serif text-3xl font-bold md:text-4xl">
              Our Commitment to Conservation
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-on-surface-variant">
              Wildlife is at the heart of everything we do. We proudly work alongside local
              communities, conservation organizations, and tourism partners to promote peaceful
              human-wildlife coexistence. We believe that thriving communities and thriving wildlife
              go hand in hand, and we support responsible tourism that protects natural habitats
              while creating sustainable economic opportunities for the people who call these
              landscapes home.
            </p>
            <p className="text-on-surface-variant">
              By choosing Footloose Adventures, you're not only embarking on an incredible safari,
              you are also supporting a tourism model that values conservation, community
              empowerment, and the preservation of East Africa's extraordinary natural heritage for
              future generations.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="bg-surface-container-lowest rounded-none p-8">
            <div className="bg-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg">
              <Target className="text-on-primary" size={32} />
            </div>
            <h3 className="text-on-surface mb-3 text-xl font-bold">Our Mission</h3>
            <div className="space-y-4">
              <p className="text-on-surface-variant">
                Our mission is to create exceptional safari experiences that connect travelers with
                the spectacular wildlife, landscapes, and cultures of East Africa through
                personalized service, responsible tourism, and unwavering professionalism.
              </p>
              <p className="text-on-surface-variant">
                We strive to deliver unforgettable adventures while supporting conservation
                initiatives and working alongside local communities to promote peaceful
                human-wildlife coexistence for generations to come.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-none p-8">
            <div className="bg-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg">
              <Eye className="text-on-primary" size={32} />
            </div>
            <h3 className="text-on-surface mb-3 text-xl font-bold">Our Vision</h3>
            <p className="text-on-surface-variant">
              To be East Africa's most trusted and respected safari company, inspiring meaningful
              travel while championing wildlife conservation, community empowerment, and sustainable
              tourism.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="bg-surface-container-lowest py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-on-surface mb-4 font-serif text-3xl font-bold md:text-4xl">
              Our Core Values
            </h2>
            <p className="text-on-surface-variant mx-auto max-w-2xl text-lg">
              The principles that guide every journey we plan
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-surface rounded-none p-8">
                  <div className="bg-primary mb-4 inline-flex h-16 w-16 items-center justify-center rounded-lg">
                    <Icon className="text-on-primary" size={32} />
                  </div>
                  <h3 className="text-on-surface mb-3 text-xl font-bold">{value.title}</h3>
                  <p className="text-on-surface-variant">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-serif text-3xl font-bold text-white md:text-4xl">
              Why Choose Footloose Adventures?
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-none bg-white/10 p-5 backdrop-blur-sm"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Check size={18} className="text-white" />
                </div>
                <p className="text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="text-on-surface mb-4 font-serif text-3xl font-bold">
          Ready to Start Your Adventure?
        </h2>
        <p className="text-on-surface-variant mb-8 text-lg">
          Let us help you plan the safari of your dreams
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/tours" className={buttonVariants({ variant: "primary", size: "lg" })}>
            View Our Tours
          </Link>
          <Link href="/contact" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
