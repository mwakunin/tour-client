"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import PageHero, { HERO_LION_PRIDE } from "@/components/public/layout/PageHero";
import { buttonVariants } from "@/components/ui/button";

const faqCategories = [
  {
    category: "Booking & Pricing",
    questions: [
      {
        question: "What's included in the tour price?",
        answer:
          "Our tour packages typically include accommodation, park entry fees, game drives, professional guide services, meals as specified, and ground transportation in 4x4 safari vehicles. International flights, travel insurance, tips, and personal expenses are not included unless specifically mentioned in the tour description.",
      },
      {
        question: "How do I book a safari?",
        answer:
          "Booking is easy! Browse our tours, select your preferred dates, and click 'Book Now'. You can also contact our team directly via phone or email for personalized assistance. We'll guide you through the entire process and answer any questions you may have.",
      },
      {
        question: "What is your cancellation policy?",
        answer:
          "Cancellation policies vary by tour and season. Generally, cancellations made 60+ days before departure receive a full refund minus a small processing fee. Cancellations 30-59 days prior forfeit 50% of the deposit, and cancellations within 30 days forfeit the full deposit. We strongly recommend purchasing travel insurance.",
      },
      {
        question: "Do you offer group discounts?",
        answer:
          "Yes! We offer special rates for groups according to the size. Contact our sales team with your group size and preferred dates for a custom quote. We also have special packages for families, corporate groups, and school trips.",
      },
    ],
  },
  {
    category: "Safari Planning",
    questions: [
      {
        question: "What is the best time to visit Kenya for a safari?",
        answer:
          "Kenya offers excellent wildlife viewing year-round, but the best time depends on your interests. July to October is ideal for the Great Migration in Masai Mara. January to February is perfect for bird watching and fewer crowds. The dry seasons (June-October and January-February) generally offer the best game viewing as animals congregate around water sources.",
      },
      {
        question: "Can I customize my safari itinerary?",
        answer:
          "Absolutely! We specialize in tailor-made adventures. Whether you want to add extra days, visit specific destinations, upgrade accommodations, or include special activities like hot air balloon rides, bush dinners, or cultural visits, we'll work with you to create your perfect safari experience.",
      },
      {
        question: "How physically demanding are adventures?",
        answer:
          "Most of our adventures involve minimal physical activity - you'll spend most of your time in a comfortable safari vehicle. However, some activities like walking adventures or mountain climbing require moderate fitness. We can adjust itineraries to match your physical abilities and preferences.",
      },
      {
        question: "What should I pack for a safari?",
        answer:
          "Essential items include: neutral-colored clothing (khaki, beige, olive), a warm jacket for early mornings, comfortable walking shoes, sun protection (hat, sunscreen, sunglasses), binoculars, camera with extra batteries, insect repellent, and personal medications. We'll provide a detailed packing list upon booking.",
      },
    ],
  },
  {
    category: "Health & Safety",
    questions: [
      {
        question: "Do I need any vaccinations for Kenya?",
        answer:
          "Yellow fever vaccination is required if arriving from certain countries. We recommend consulting your doctor about malaria prophylaxis and routine vaccinations (Hepatitis A & B, Typhoid, Tetanus). Always check the latest health requirements with your local travel clinic at least 6-8 weeks before departure.",
      },
      {
        question: "How safe is it to go on safari?",
        answer:
          "Safari tourism in Kenya is very safe when proper precautions are followed. Our experienced guides are trained in wildlife behavior and safety protocols. Vehicles are specially designed for safari use, and all activities are conducted with your safety as the top priority. We also provide comprehensive travel insurance recommendations.",
      },
      {
        question: "What about malaria prevention?",
        answer:
          "Some safari areas are in malaria zones. We recommend consulting your doctor about antimalarial medication. Additional precautions include using insect repellent, wearing long sleeves in the evening, and sleeping under mosquito nets (provided at most lodges).",
      },
      {
        question: "Are adventures suitable for children?",
        answer:
          "Yes! Many of our tours are family-friendly. However, some lodges have age restrictions (typically 6+ years) for game drives due to safety regulations. We can customize family adventures with shorter drives, child-friendly accommodations, and activities suitable for younger travelers.",
      },
    ],
  },
  {
    category: "During Your Safari",
    questions: [
      {
        question: "What wildlife can I expect to see?",
        answer:
          "Kenya is home to the 'Big Five' (lion, leopard, elephant, buffalo, and rhino) plus countless other species including cheetahs, giraffes, zebras, wildebeest, hippos, and over 1,000 bird species. While we can't guarantee specific sightings, our experienced guides know the best spots and times for optimal wildlife viewing.",
      },
      {
        question: "What type of accommodations are provided?",
        answer:
          "We offer a range of accommodations from comfortable tented camps to luxury lodges. All options are carefully selected for their location, service, and amenities. Accommodations typically include en-suite bathrooms, comfortable beds, and meals. We can arrange upgrades or special requests upon booking.",
      },
      {
        question: "Will I have internet access?",
        answer:
          "Most lodges and camps offer WiFi in common areas, though connections may be slower than you're used to. Some remote camps have limited or no connectivity. We recommend embracing the digital detox and immersing yourself in the safari experience!",
      },
      {
        question: "What happens if I get sick during the safari?",
        answer:
          "All our guides are trained in first aid, and we maintain contact with local medical facilities. Most lodges have medical staff or are near clinics. We strongly recommend comprehensive travel insurance that covers medical emergencies and evacuation.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openFAQ, setOpenFAQ] = useState<string | null>("0-0");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  // Filter FAQs based on search
  const filteredCategories = searchQuery
    ? faqCategories
        .map((cat) => ({
          ...cat,
          questions: cat.questions.filter(
            (q) =>
              q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.questions.length > 0)
    : faqCategories;

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        title="Frequently Asked Questions"
        description="Find answers to common questions about planning your safari adventure"
        image={HERO_LION_PRIDE}
      >
        <div className="relative mx-auto max-w-2xl">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for answers..."
            className="border-outline-variant bg-surface-container-lowest text-on-surface shadow-elevated focus:ring-primary w-full rounded-none border px-6 py-4 pr-12 focus:ring-2 focus:outline-none"
          />
          <Search className="text-on-surface-variant absolute top-1/2 right-4 h-6 w-6 -translate-y-1/2" />
        </div>
      </PageHero>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          {filteredCategories.length === 0 ? (
            <div className="bg-surface-container-lowest shadow-elevated rounded-none p-12 text-center">
              <p className="text-on-surface-variant">No results found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-primary mt-4 font-semibold hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredCategories.map((category, catIndex) => (
                <div key={catIndex}>
                  {/* Category Header */}
                  <h2 className="text-on-surface mb-6 font-serif text-2xl font-bold">
                    {category.category}
                  </h2>

                  {/* Questions in Category */}
                  <div className="space-y-4">
                    {category.questions.map((faq, qIndex) => {
                      const faqId = `${catIndex}-${qIndex}`;
                      return (
                        <div
                          key={qIndex}
                          className="border-outline-variant bg-surface-container-lowest shadow-elevated overflow-hidden rounded-none border"
                        >
                          <button
                            onClick={() => toggleFAQ(faqId)}
                            className="hover:bg-surface-container-low flex w-full items-center justify-between p-6 text-left transition-colors"
                          >
                            <span className="text-on-surface pr-4 text-lg font-semibold">
                              {faq.question}
                            </span>
                            {openFAQ === faqId ? (
                              <ChevronUp className="text-primary h-6 w-6 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="text-on-surface-variant h-6 w-6 flex-shrink-0" />
                            )}
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-300 ${
                              openFAQ === faqId ? "max-h-96" : "max-h-0"
                            }`}
                          >
                            <div className="bg-primary/95 p-6 text-white">
                              <p className="leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Still Have Questions CTA */}
          <div className="bg-surface-container-lowest shadow-elevated mt-16 rounded-none p-8 text-center">
            <h3 className="text-on-surface mb-4 font-serif text-2xl font-bold">
              Still Have Questions?
            </h3>
            <p className="text-on-surface-variant mb-6">
              Our team is here to help! Contact us and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <a href="/contact" className={buttonVariants({ variant: "primary" })}>
                Contact Us
              </a>
              <a href="tel:+254742060624" className={buttonVariants({ variant: "secondary" })}>
                Call Us: +254 742 060 624
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
