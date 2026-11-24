'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Car, Settings, Fuel, Users, Phone, CalendarCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { convertDzdToEur, parseNumericPrice, useCurrencyStore } from '@/store/useCurrencyStore';
import { buildWhatsAppUrl, useSiteContact } from '@/lib/useSiteContact';
import { resolveItemFeatures } from '@/data/serviceFeatures';
import FeatureIcon from '@/components/FeatureIcon';
import DynamicForm from '@/components/DynamicForm';
import { defaultFormsConfig } from '@/data/defaultForms';
import { useAutoTranslate } from '@/lib/translateClient';

interface CarItem {
  id: string;
  brand?: string;
  nameAr?: string;
  nameFr?: string;
  nameEn?: string;
  year?: string | number;
  gearbox?: string;
  fuel?: string;
  doors?: string | number;
  seats?: string | number;
  startingPrice?: string | number;
  discountPrice?: string | number;
  isInstallment?: boolean;
  images?: string[];
  featuresConfigured?: boolean;
  enabledFeatures?: string[];
  customFeatures?: Array<{ id: string; ar: string; fr?: string; en?: string }>;
}

function CarCard({
  item,
  index,
  locale,
  currency,
  dzdPerEur,
  whatsappNumber,
  onBook,
}: {
  item: CarItem;
  index: number;
  locale: string;
  currency: 'DZD' | 'EUR';
  dzdPerEur: number;
  whatsappNumber: string;
  onBook: (car: CarItem, resolvedTitle: string) => void;
}) {
  const isRtl = locale === 'ar';
  const baseDzd = parseNumericPrice(item.startingPrice);
  const discountDzd = parseNumericPrice(item.discountPrice);
  const hasDiscount = discountDzd > 0 && baseDzd > discountDzd;
  const finalDzd = hasDiscount ? baseDzd - discountDzd : baseDzd;
  const baseEur = convertDzdToEur(baseDzd, dzdPerEur);
  const autoEur = convertDzdToEur(finalDzd, dzdPerEur);

  const rawPrimary = item.nameAr || item.nameFr || '';
  const explicitTarget =
    locale === 'en' ? item.nameEn || item.nameFr : locale === 'fr' ? item.nameFr : item.nameAr;
  const translatedTitle = useAutoTranslate(rawPrimary, locale, explicitTarget);
  const displayTitle = translatedTitle || item.nameFr || item.nameAr || '';
  const fullCarLabel = [item.brand, displayTitle].filter(Boolean).join(' ').trim();

  const features = resolveItemFeatures('cars', item, locale);

  const waMsg = isRtl
    ? `السلام عليكم، أود الاستفسار عن كراء سيارة: ${fullCarLabel}`
    : locale === 'en'
      ? `Hello, I would like to inquire about renting: ${fullCarLabel}`
      : `Bonjour, je voudrais me renseigner concernant la location de : ${fullCarLabel}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.35) }}
      whileHover={{ y: -4 }}
      className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#23262d] via-[#1c1f26] to-[#111318] text-white shadow-xl hover:shadow-2xl border border-white/10 hover:border-gold/40 transition-all duration-300 flex flex-col justify-between p-5 sm:p-6"
    >
      {/* Top Row: Photo + Model & Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
        {/* Car Photo */}
        <div className="sm:col-span-5 relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/15">
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={fullCarLabel}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <Car className="w-14 h-14" />
            </div>
          )}
          {item.brand && (
            <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/15">
              {item.brand}
            </span>
          )}
          {hasDiscount && (
            <span className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow">
              {isRtl ? 'تخفيض' : locale === 'en' ? 'PROMO' : 'PROMO'}
            </span>
          )}
          {item.isInstallment && (
            <span className="absolute bottom-2.5 right-2.5 bg-gold text-[#111318] text-[10px] font-black px-2 py-0.5 rounded-md shadow">
              {isRtl ? 'تقسيط' : locale === 'en' ? 'Installment' : 'Facilité'}
            </span>
          )}
        </div>

        {/* Car Details + Price Badges */}
        <div className="sm:col-span-7 flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-2xl sm:text-3xl font-black tracking-wide uppercase text-white group-hover:text-gold transition-colors truncate">
                {displayTitle}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-semibold mt-0.5 uppercase tracking-wider">
                {item.gearbox ? `(${item.gearbox})` : ''} {item.year ? `• ${item.year}` : ''}
              </p>
            </div>

            {/* Circular Yellow/Gold EUR Badge (auto-converted from DZD!) */}
            {autoEur > 0 && (
              <div className="w-16 h-16 rounded-full bg-[#facc15] text-[#111318] flex flex-col items-center justify-center shrink-0 shadow-[0_0_20px_rgba(250,204,21,0.35)] font-black leading-none">
                {hasDiscount && baseEur > 0 && (
                  <span className="text-[10px] line-through opacity-70 leading-none" dir="ltr">
                    {baseEur}€
                  </span>
                )}
                <span className={hasDiscount ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} dir="ltr">
                  {autoEur}€
                </span>
                <span className="text-[10px] font-bold opacity-80">
                  /{isRtl ? 'يوم' : locale === 'en' ? 'day' : 'j'}
                </span>
              </div>
            )}
          </div>

          {/* Bold Red/Crimson Price Ribbon (respects currency toggle) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-baseline gap-2 bg-[#c81e2b] text-white px-4 py-2 rounded-xl shadow-md">
              {hasDiscount && (
                <span className="text-xs line-through opacity-75" dir="ltr">
                  {currency === 'EUR' && baseEur > 0
                    ? `${baseEur} €`
                    : `${baseDzd.toLocaleString('fr-DZ')} ${isRtl ? 'د.ج' : 'DA'}`}
                </span>
              )}
              <span className="text-xl sm:text-2xl font-black tracking-tight" dir="ltr">
                {currency === 'EUR' && autoEur > 0
                  ? `${autoEur} €`
                  : `${finalDzd.toLocaleString('fr-DZ')} ${isRtl ? 'د.ج' : 'DA'}`}
              </span>
              <span className="text-xs font-bold opacity-90">
                /{isRtl ? 'يوم' : locale === 'en' ? 'day' : 'jour'}
              </span>
            </div>
          </div>

          {/* Specs + Admin Controlled Service Features Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs text-gray-200">
            {item.fuel && (
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Fuel className="w-3.5 h-3.5 text-gold" /> {item.fuel}
              </span>
            )}
            {item.gearbox && (
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Settings className="w-3.5 h-3.5 text-gold" /> {item.gearbox}
              </span>
            )}
            {item.seats && (
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Users className="w-3.5 h-3.5 text-gold" /> {item.seats}{' '}
                {isRtl ? 'مقاعد' : locale === 'en' ? 'Seats' : 'Places'}
              </span>
            )}
            {features.map((feat) => (
              <span
                key={feat.id}
                className="inline-flex items-center gap-1 bg-gold/15 border border-gold/30 text-gold-light px-2.5 py-1 rounded-lg"
              >
                <FeatureIcon name={feat.icon} className="w-3.5 h-3.5 text-gold" />
                {feat.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Direct Action Buttons Outside Card ("من برا") */}
      <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <button
          type="button"
          onClick={() => onBook(item, fullCarLabel)}
          className="flex-1 bg-gold hover:bg-[#eab308] text-[#111318] font-black py-3 px-5 rounded-xl shadow-lg hover:shadow-gold/30 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <CalendarCheck className="w-5 h-5" />
          <span>{isRtl ? 'احجز الآن' : locale === 'en' ? 'Book Now' : 'Réserver maintenant'}</span>
        </button>

        <a
          href={buildWhatsAppUrl(whatsappNumber, waMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-initial bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold py-3 px-5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Phone className="w-4 h-4" />
          <span>{isRtl ? 'واتساب' : 'WhatsApp'}</span>
        </a>
      </div>
    </motion.div>
  );
}

export default function CarsPage({ params: { locale } }: { params: { locale: string } }) {
  const [items, setItems] = useState<CarItem[]>([]);
  const [bookingModalCar, setBookingModalCar] = useState<{ item: CarItem; label: string } | null>(
    null
  );
  const { currency, dzdPerEur } = useCurrencyStore();
  const siteContact = useSiteContact();
  const isRtl = locale === 'ar';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'cars'));
        setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CarItem));
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, []);

  const carFormConfig = bookingModalCar
    ? {
        ...defaultFormsConfig['cars'],
        title: {
          ar: `حجز سيارة: ${bookingModalCar.label}`,
          fr: `Réservation : ${bookingModalCar.label}`,
          en: `Car Booking: ${bookingModalCar.label}`,
        },
        fields: defaultFormsConfig['cars'].fields.map((f: any) =>
          f.id === 'carName' ? { ...f, defaultValue: bookingModalCar.label } : f
        ),
      }
    : null;

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Responsive Top Hero Banner: Full-width Landscape Desktop + Mobile Vertical */}
      <div className="w-full bg-[#0f172a] shadow-md border-b border-gray-200 overflow-hidden">
        {/* Full-Width Desktop Landscape Banner */}
        <div className="hidden md:block w-full">
          <img
            src="/car-banner-desktop.jpg"
            alt="Location de voitures Moulay Travel"
            className="w-full h-auto max-h-[580px] object-cover object-center"
          />
        </div>

        {/* Mobile Vertical Banner (Preserved cleanly as requested) */}
        <div className="relative block md:hidden w-full h-[62vh] min-h-[400px] max-h-[540px]">
          <img
            src="/car-banner-mobile.jpg"
            alt="Location de voitures Moulay Travel Mobile"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/35 to-black/30" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white text-center">
            <span className="inline-block bg-orange-500 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow">
              {isRtl
                ? 'تأجير السيارات — وهران'
                : locale === 'en'
                  ? 'Car Rental — Oran'
                  : 'Location de voitures — Oran'}
            </span>
            <h1 className="text-3xl font-black leading-tight drop-shadow-md">
              {isRtl
                ? 'تشكيلتنا الفاخرة للإيجار'
                : locale === 'en'
                  ? 'Your Mobility, Our Priority'
                  : 'Votre Mobilité, Notre Priorité'}
            </h1>
            <p className="text-sm text-gray-200 mt-2">
              {isRtl
                ? 'أسطول حديث • توصيل للمطار • أسعار شفافة'
                : locale === 'en'
                  ? 'Recent Fleet • Airport Delivery • Transparent Rates'
                  : 'Flotte récente • Livraison aéroport • Tarifs transparents'}
            </p>
          </div>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="container mx-auto px-4 max-w-7xl pt-12 md:pt-16">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight"
          >
            {isRtl ? 'تشكيلتنا الفاخرة' : locale === 'en' ? 'Our Fleet Collection' : 'Notre Collection'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg"
          >
            {isRtl
              ? 'احجز سيارتك مباشرة أو تواصل معنا عبر واتساب بأسعار واضحة بالدينار واليورو.'
              : locale === 'en'
                ? 'Book directly or reach us via WhatsApp with transparent daily rates in DZD and EUR.'
                : 'Réservez directement ou contactez-nous sur WhatsApp avec conversion automatique en Euro.'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {items.map((item, index) => (
            <CarCard
              key={item.id}
              item={item}
              index={index}
              locale={locale}
              currency={currency}
              dzdPerEur={dzdPerEur}
              whatsappNumber={siteContact.whatsapp}
              onBook={(car, label) => setBookingModalCar({ item: car, label })}
            />
          ))}
        </div>
      </div>

      {/* Inline Car Booking Modal */}
      <AnimatePresence>
        {bookingModalCar && carFormConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setBookingModalCar(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl my-8"
            >
              <button
                type="button"
                onClick={() => setBookingModalCar(null)}
                aria-label="Close"
                className="sticky top-4 z-20 float-left bg-white text-gray-800 hover:bg-red-50 hover:text-red-600 p-2.5 rounded-full shadow-lg border border-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <DynamicForm
                config={carFormConfig}
                locale={locale}
                formId={`car_${bookingModalCar.item.id}`}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
