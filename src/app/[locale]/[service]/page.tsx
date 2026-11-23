import BookingForm from "@/components/BookingForm";
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale, service } }: { params: { locale: string, service: string } }): Promise<Metadata> {
  const tService = await getTranslations({ locale, namespace: 'Services' });
  let title = tService(`${service}.title` as any);
  let keywords = "Moulay Travel, وكالة سفر";

  if (service === 'umrah') {
    keywords = "عمرة بالتقسيط بدون فوائد, بدون تعامل مع البنك, Moulay Travel, وكالة سفر, وكالة سياحية, رحلات منظمة";
    title = locale === 'ar' ? 'عمرة بالتقسيط بدون فوائد' : 'Omra';
  }

  return {
    title: `${title} | Moulay Travel`,
    keywords: keywords,
  };
}

export default async function ServicePage({ params }: { params: { locale: string, service: string } }) {
  const tService = await getTranslations({ locale: params.locale, namespace: 'Services' });
  const tCommon = await getTranslations({ locale: params.locale, namespace: 'Common' });

  // Validate service
  const validServices = ["promotions", "flights", "hotels", "umrah", "organized_trips", "wellness", "vip", "visas", "car_rental", "insurance", "custom_trips", "payment"];
  
  if (!validServices.includes(params.service)) {
    return <div className="py-32 text-center text-2xl font-bold">404</div>;
  }

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        {/* Service Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 capitalize">
            {tService(`${params.service}.title` as any)}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            {tService(`${params.service}.desc` as any)}
          </p>
        </div>

        {/* The Booking Form */}
        <BookingForm initialService={params.service} locale={params.locale} />
      </div>
    </div>
  );
}
