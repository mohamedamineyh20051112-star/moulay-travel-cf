import Hero from "@/components/Hero";
import ServicesGrid from "@/components/ServicesGrid";
import WhyChooseUs from "@/components/WhyChooseUs";
import PartnersCarousel from "@/components/PartnersCarousel";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import LocationMap from "@/components/LocationMap";
import WorldClock from "@/components/WorldClock";

export default function Home({ params: { locale } }: { params: { locale: string } }) {
  return (
    <>
      <Hero locale={locale} />
      <ServicesGrid locale={locale} />
      <WhyChooseUs />
      <PartnersCarousel />
      <WorldClock />
      <ReviewsCarousel />
      <LocationMap />
    </>
  );
}
