"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import WildlifeVideoPanel from "./WildlifeVideoPanel";

const faqs = [
  {
    question: "What's included in the tour price?",
    answer:
      "Our tour packages typically include accommodation, park entry fees, game drives, professional guide services, meals as specified, and ground transportation in 4x4 safari vehicles. International flights, travel insurance, tips, and personal expenses are not included unless specifically mentioned.",
  },
  {
    question: "What is the best time to visit Kenya for a safari?",
    answer:
      "Kenya offers excellent wildlife viewing year-round, but the best time depends on your interests. July to October is ideal for the Great Migration in Masai Mara. January to February is perfect for bird watching and fewer crowds. The dry seasons (June-October and January-February) generally offer the best game viewing.",
  },
  {
    question: "Do I need any vaccinations for Kenya?",
    answer:
      "Yellow fever vaccination is required if arriving from certain countries. We recommend consulting your doctor about malaria prophylaxis and routine vaccinations (Hepatitis A & B, Typhoid, Tetanus). Always check the latest health requirements with your local travel clinic at least 6-8 weeks before departure.",
  },
  {
    question: "Are adventures suitable for children?",
    answer:
      "Absolutely! Many of our tours are family-friendly. However, some lodges have age restrictions (typically 6+ years) for game drives due to safety regulations. We can customize family adventures with shorter drives, child-friendly accommodations, and activities suitable for younger travelers.",
  },
  {
    question: "How safe is it to go on safari?",
    answer:
      "Safari tourism in Kenya is very safe when proper precautions are followed. Our experienced guides are trained in wildlife behavior and safety protocols. Vehicles are specially designed for safari use, and all activities are conducted with your safety as the top priority.",
  },
  {
    question: "Can I customize my safari itinerary?",
    answer:
      "Yes! We specialize in tailor-made adventures. Whether you want to add extra days, visit specific destinations, upgrade accommodations, or include special activities like hot air balloon rides or cultural visits, we'll work with you to create your perfect safari experience.",
  },
];

export default function FAQPreview() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="bg-surface-container-low w-full py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-stretch">
          {/* Left Side - FAQ */}
          <div>
            <div className="mb-8">
              <span className="label-caps text-primary">Good to Know</span>
              <h2 className="text-headline-md text-on-surface mt-2">Before You Book</h2>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-3">
              {faqs.slice(0, 5).map((faq, index) => (
                <div
                  key={index}
                  className="hover:border-primary/50 border-outline-variant overflow-hidden rounded-none border transition-colors"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="bg-surface-container-lowest hover:bg-surface-container-low flex w-full items-center justify-between p-5 text-left transition-colors"
                  >
                    <span className="text-on-surface pr-4 text-sm font-semibold">
                      {faq.question}
                    </span>
                    {openFAQ === index ? (
                      <ChevronUp className="text-primary h-5 w-5 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="text-on-surface-variant h-5 w-5 flex-shrink-0" />
                    )}
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFAQ === index ? "max-h-64" : "max-h-0"
                    }`}
                  >
                    <div className="border-outline-variant bg-surface border-t p-4">
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All FAQs Link */}
            <div className="mt-8 text-center">
              <a
                href="/faq"
                className="text-primary inline-flex items-center gap-2 font-semibold hover:underline"
              >
                View All FAQs
                <ChevronDown className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right Side - Wildlife video preview */}
          <WildlifeVideoPanel
            imageSrc="/images/hero/safari-5.webp"
            videoSrc="/videos/faq-wildlife.mp4"
            alt="Wildlife roaming the Kenyan savannah"
            eyebrow="Plan With Confidence"
            caption="Everything you need to know before you go"
          />
        </div>
      </div>
    </section>
  );
}
