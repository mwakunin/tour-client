"use client";

import { useState, useEffect } from "react";
import { Quote, Star } from "lucide-react";
import Card from "@/components/ui/card";
import WildlifeVideoPanel from "./WildlifeVideoPanel";

const testimonials = [
  {
    id: 1,
    name: "Lisa",
    location: "USA",
    rating: 5,
    headline: "Made the whole trip unforgettable",
    text: "An amazing safari experience! Our guide, Chris, was fantastic—knowledgeable, friendly, and made the whole trip unforgettable. I would highly recommend this tour to anyone looking for a truly memorable adventure!",
  },
  {
    id: 2,
    name: "Guglielmo",
    location: "Italy",
    rating: 5,
    headline: "A fantastic itinerary, exactly as we had imagined",
    text: "John was amazing, accommodating all our requests and planning a fantastic itinerary exactly as we had imagined. Thank you, John! Thank you, Footloose Adventures.",
  },
  {
    id: 3,
    name: "Pratley",
    location: "Great Britain",
    rating: 5,
    headline: "The best value for money safari I have ever done",
    text: "John from the outset was responsive, and answered all our questions. We were a group of 9, and everything was perfect. The ground arrangements such as our flights to the Mara, the amazing hotel, the game drives, it was all faultless. It's honestly the best value for money safari I have ever done, and I can't thank John enough!",
  },
  {
    id: 4,
    name: "Jamie",
    location: "USA",
    rating: 5,
    headline: "There is nothing on this trip I feel like we missed out on",
    text: "John was very good at communicating via email of any questions with regards to details with the safari. He was also very helpful when our luggage was lost at airport to find a way to still do the safari and not miss out on anything and yet come back to the airport to get our luggage. Our driver and tour guide was efficient, informative, passionate about his job, went above and beyond to make sure we got to see as much of the animals as we possibly could. I would definitely recommend Dan as your tour guide and driver for there is nothing on this trip I feel like we missed out on because of his knowledge, efficiency, hospitality, and excellent communication.",
  },
];

export default function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, []); // Empty dependency array

  return (
    <section className="bg-surface w-full py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
          {/* Left Side - Wildlife video preview */}
          <WildlifeVideoPanel
            imageSrc="/images/hero/safari-4.webp"
            videoSrc="/videos/cheetah-panel.mp4"
            alt="Wildlife on safari in Kenya"
            eyebrow="Out in the Wild"
            caption="See what our travelers experienced"
          />

          {/* Right Side - Testimonials */}
          <div>
            <div className="mb-6">
              <span className="label-caps text-primary">Traveler Stories</span>
              <h2 className="text-headline-md text-on-surface mt-2">
                What It's Actually Like Out There
              </h2>
            </div>

            {/* Single Testimonial Card */}
            <Card>
              {/* Quote Icon + Stars share a row to keep the card compact */}
              <div className="mb-5 flex items-center justify-between">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                  <Quote size={20} />
                </div>
                <div className="flex gap-1">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <h3 className="text-headline-sm text-on-surface mb-3 line-clamp-2">
                "{testimonials[currentTestimonial].headline}"
              </h3>

              {/* Min height keeps the card from collapsing on the shorter reviews */}
              <p className="text-body-md text-on-surface-variant mb-6 min-h-40 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>

              {/* Author Info */}
              <div>
                <h4 className="text-on-surface text-lg font-bold">
                  {testimonials[currentTestimonial].name}
                </h4>
                <p className="text-on-surface-variant text-sm">
                  {testimonials[currentTestimonial].location}
                </p>
              </div>

              {/* Dots Navigation */}
              <div className="mt-6 flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTestimonial ? "bg-primary w-8" : "bg-outline-variant w-2"
                    }`}
                  />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
