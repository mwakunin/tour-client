import Hero from "@/components/public/home/Hero";
import WhyChooseUs from "@/components/public/home/WhyChooseUs";
import FeaturedTours from "@/components/public/home/FeaturedTours";
import FeaturedDestinations from "@/components/public/home/FeaturedDestinations";
import CTASection from "@/components/public/home/CallToAction";
import TourDeals from "@/components/public/home/TourDeals";
import BlogTravelTips from "@/components/public/home/Blog";
import Testimonials from "@/components/public/home/Testimonials";
import FAQPreview from "@/components/public/home/FAQPreview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <FeaturedDestinations />
      <TourDeals />
      <FeaturedTours />
      <Testimonials />
      <FAQPreview />
      <BlogTravelTips />
      <CTASection />
    </>
  );
}
