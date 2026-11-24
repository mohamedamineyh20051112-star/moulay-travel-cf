'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Settings, Calendar, ChevronRight, Phone, ImageIcon, Fuel, Users } from 'lucide-react';
import DynamicForm from '@/components/DynamicForm';
import { defaultFormsConfig } from '@/data/defaultForms';
import { formatConvertedPrice, parseNumericPrice, useCurrencyStore } from '@/store/useCurrencyStore';
import { buildWhatsAppUrl, useSiteContact } from '@/lib/useSiteContact';
import { resolveItemFeatures } from '@/data/serviceFeatures';
import FeatureIcon from '@/components/FeatureIcon';
import { useAutoTranslate } from '@/lib/translateClient';

export default function CarDetailsPage({
  params,
}: {
  params: { locale: string; carId: string };
}) {
  const locale = params.locale;
  const isRtl = locale === 'ar';
  const [item, setItem] = useState<any>(null);
  const [view, setView] = useState<'details' | 'form'>('details');
  const { currency, dzdPerEur } = useCurrencyStore();
  const siteContact = useSiteContact();

  useEffect(() => {
    const fetchItem = async () => {
      const snap = await getDoc(doc(db, 'cars', params.carId));
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
    };
    fetchItem();
  }, [params.carId]);

  const translatedName = useAutoTranslate(
    item?.nameAr || item?.nameFr || '',
    locale,
    locale === 'en' ? item?.nameEn || item?.nameFr : locale === 'fr' ? item?.nameFr : item?.nameAr
  );

  if (!item) {
    return (
      <div className="min-h-screen pt-32 text-center font-bold text-gray-500">
        {isRtl ? 'جاري التحميل...' : locale === 'en' ? 'Loading...' : 'Chargement...'}
      </div>
    );
  }

  const itemName = translatedName || item.nameFr || item.nameAr || '';
  const carFullName = [item.brand, itemName].filter(Boolean).join(' ').trim();

  const baseDzd = parseNumericPrice(item.startingPrice);
  const discountDzd = parseNumericPrice(item.discountPrice);
  const finalDzd = discountDzd > 0 ? Math.max(0, baseDzd - discountDzd) : baseDzd;
  const features = resolveItemFeatures('cars', item, locale);

  const formConfig = {
    ...defaultFormsConfig['cars'],
    title: {
      ar: `حجز سيارة: ${carFullName}`,
      fr: `Réservation : ${carFullName}`,
      en: `Car Booking: ${carFullName}`,
    },
    fields: defaultFormsConfig['cars'].fields.map((f: any) =>
      f.id === 'carName' ? { ...f, defaultValue: carFullName } : f
    ),
  };

  const tWhatsapp = isRtl ? 'واتساب' : 'WhatsApp';
  const tReserve = isRtl ? 'احجز الآن' : locale === 'en' ? 'Book Now' : 'Réserver maintenant';

  const waText = isRtl
    ? `مرحباً، أود الاستفسار عن سيارة ${carFullName}`
    : locale === 'en'
      ? `Hello, I would like to inquire about ${carFullName}`
      : `Bonjour, je voudrais me renseigner concernant la voiture ${carFullName}`;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {view === 'details' ? (
            <>
              {item.images && item.images.length > 0 && (
                <div className="h-[38vh] md:h-[52vh] relative bg-gray-900 flex flex-col justify-end overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={carFullName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />
                  <div className="relative z-20 p-6 md:p-10 text-white">
                    {item.brand && (
                      <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur rounded-full mb-3 font-bold border border-white/30 text-sm">
                        {item.brand}
                      </div>
                    )}
                    <h1 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-lg">
                      {itemName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-gray-200 font-medium">
                      {item.year && (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur">
                          <Calendar className="w-4 h-4 text-gold" /> <span>{item.year}</span>
                        </div>
                      )}
                      {item.gearbox && (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur">
                          <Settings className="w-4 h-4 text-gold" /> <span>{item.gearbox}</span>
                        </div>
                      )}
                      {item.fuel && (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur">
                          <Fuel className="w-4 h-4 text-gold" /> <span>{item.fuel}</span>
                        </div>
                      )}
                      {item.seats && (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg backdrop-blur">
                          <Users className="w-4 h-4 text-gold" /> <span>{item.seats}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-10 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-6">
                    {features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {features.map((feat) => (
                          <span
                            key={feat.id}
                            className="inline-flex items-center gap-2 bg-gray-100 border border-gray-200 text-gray-800 px-3.5 py-2 rounded-xl text-sm font-semibold"
                          >
                            <FeatureIcon name={feat.icon} className="w-4 h-4 text-gold" />
                            {feat.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {item.images && item.images.length > 1 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <ImageIcon className="w-6 h-6 text-primary" />
                          {isRtl ? 'معرض الصور' : locale === 'en' ? 'Gallery' : 'Galerie'}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {item.images.slice(1).map((img: string, i: number) => (
                            <div
                              key={i}
                              className="rounded-xl overflow-hidden h-44 bg-gray-100 border border-gray-200 group"
                            >
                              <img
                                src={img}
                                alt={carFullName}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm space-y-2">
                    <p className="text-sm text-gray-500 font-semibold">
                      {isRtl
                        ? 'السعر يبدأ من (لليوم)'
                        : locale === 'en'
                          ? 'Starting from (per day)'
                          : 'À partir de (par jour)'}
                    </p>
                    {discountDzd > 0 && baseDzd > discountDzd && (
                      <div className="text-sm text-gray-400 line-through" dir="ltr">
                        {formatConvertedPrice(baseDzd, currency, dzdPerEur, locale)}
                      </div>
                    )}
                    <div className="text-3xl font-black text-primary" dir="ltr">
                      {formatConvertedPrice(finalDzd, currency, dzdPerEur, locale)}
                    </div>
                  </div>
                </div>

                {/* Non-overlapping Footer Action Bar */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setView('form');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 bg-primary hover:bg-gold text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all"
                  >
                    {tReserve}
                  </button>
                  <a
                    href={buildWhatsAppUrl(siteContact.whatsapp, waText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{tWhatsapp}</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 md:p-10">
              <button
                type="button"
                onClick={() => setView('details')}
                className="mb-6 flex items-center gap-2 text-primary hover:text-gold font-bold transition-colors"
              >
                <ChevronRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
                {isRtl
                  ? 'العودة للتفاصيل'
                  : locale === 'en'
                    ? 'Back to details'
                    : 'Retour aux détails'}
              </button>
              <DynamicForm config={formConfig} locale={locale} formId={`car_${item.id}`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
