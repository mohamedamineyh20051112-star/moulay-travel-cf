'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Percent, Phone, Plane, Building2, Car, CheckCircle2, Crown } from 'lucide-react';
import { useCurrencyStore, formatConvertedPrice } from '@/store/useCurrencyStore';
import { useSiteContact, buildWhatsAppUrl } from '@/lib/useSiteContact';
import { useAutoTranslate } from '@/lib/translateClient';

function PromoCard({
  item,
  type,
  locale,
  index,
}: {
  item: any;
  type: 'vip' | 'trip' | 'car' | 'hammam' | 'omra';
  locale: 'ar' | 'fr' | 'en';
  index: number;
}) {
  const isRtl = locale === 'ar';
  const { currency, dzdPerEur } = useCurrencyStore();
  const { whatsapp } = useSiteContact();

  const rawAr =
    type === 'car'
      ? `${item.brand || ''} ${item.model || ''} ${item.nameAr || ''}`.trim()
      : type === 'omra'
        ? item.name?.ar || item.nameAr || ''
        : item.nameAr || '';
  const rawExplicit =
    type === 'omra'
      ? locale === 'en'
        ? item.name?.en || item.name?.fr
        : locale === 'fr'
          ? item.name?.fr
          : item.name?.ar
      : locale === 'en'
        ? item.nameEn || item.nameFr
        : locale === 'fr'
          ? item.nameFr
          : undefined;

  const title = useAutoTranslate(rawAr, locale, rawExplicit);

  const imgSrc =
    type === 'omra'
      ? item.image || item.images?.rooms
      : item.images?.[0] || item.image || null;

  const originalDzd = Number(item.price || item.startingPrice || item.priceStartDzd || 0);
  const discountDzd = Number(item.discountPrice || 0);
  const hasPriceCut = discountDzd > 0 && originalDzd > discountDzd;
  const finalDzd = hasPriceCut ? originalDzd - discountDzd : originalDzd;

  const waMsg =
    locale === 'ar'
      ? `مرحباً، أود الاستفسار عن العرض الترويجي: ${title}`
      : locale === 'en'
        ? `Hello, I would like information about the promotion: ${title}`
        : `Bonjour, je voudrais des renseignements sur l'offre promotionnelle : ${title}`;

  const isVip = type === 'vip';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
      whileHover={{ y: -4 }}
      className={`rounded-3xl p-6 border shadow-sm hover:shadow-xl transition-all flex flex-col ${
        isVip
          ? 'bg-gradient-to-b from-[#151a28] to-[#0d1018] border-amber-400/35 text-white'
          : 'bg-white border-gray-100 text-gray-900'
      }`}
    >
      {imgSrc && (
        <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
          <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {isVip && (
          <span className="bg-amber-400 text-[#090b10] text-xs px-2.5 py-1 rounded-full font-black">
            VIP
          </span>
        )}
        {hasPriceCut && (
          <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            {isRtl ? 'تخفيض' : locale === 'en' ? 'DISCOUNT' : 'PROMO'}
          </span>
        )}
        {item.isInstallment && (
          <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-bold">
            {isRtl ? 'تقسيط متاح' : locale === 'en' ? 'Installments' : 'Paiement facilité'}
          </span>
        )}
      </div>

      <h3 className={`text-xl font-bold mb-3 ${isVip ? 'text-white' : 'text-gray-900'}`}>{title}</h3>

      <div className="mb-6">
        {hasPriceCut ? (
          <div className="flex flex-col">
            <span className="text-gray-400 line-through text-sm" dir="ltr">
              {formatConvertedPrice(originalDzd, currency, dzdPerEur, locale, null)}
            </span>
            <span
              className={`font-black text-2xl ${isVip ? 'text-amber-300' : 'text-emerald-600'}`}
              dir="ltr"
            >
              {formatConvertedPrice(finalDzd, currency, dzdPerEur, locale, null)}
              {type === 'car'
                ? isRtl
                  ? ' / يوم'
                  : locale === 'en'
                    ? ' / day'
                    : ' / jour'
                : ''}
            </span>
          </div>
        ) : finalDzd > 0 ? (
          <span className={`font-black text-xl ${isVip ? 'text-amber-300' : 'text-primary'}`} dir="ltr">
            {formatConvertedPrice(finalDzd, currency, dzdPerEur, locale, null)}
            {type === 'car'
              ? isRtl
                ? ' / يوم'
                : locale === 'en'
                  ? ' / day'
                  : ' / jour'
              : ''}
          </span>
        ) : null}
      </div>

      <div className="mt-auto">
        <a
          href={buildWhatsAppUrl(whatsapp, waMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 rounded-xl font-bold transition-colors shadow-md"
        >
          <Phone className="w-5 h-5" />
          {isRtl ? 'استفسار عبر واتساب' : locale === 'en' ? 'Contact WhatsApp' : 'WhatsApp Direct'}
        </a>
      </div>
    </motion.div>
  );
}

export default function DiscountsPage({ params: { locale: rawLocale } }: { params: { locale: string } }) {
  const locale = (rawLocale === 'en' ? 'en' : rawLocale === 'fr' ? 'fr' : 'ar') as 'ar' | 'fr' | 'en';
  const isRtl = locale === 'ar';
  const { whatsapp } = useSiteContact();

  const [vipTrips, setVipTrips] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [hammams, setHammams] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [omra, setOmra] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vipSnap, carsSnap, hammamsSnap, tripsSnap, omraSnap] = await Promise.all([
          getDocs(collection(db, 'vip_trips_hotels')),
          getDocs(collection(db, 'cars')),
          getDocs(collection(db, 'hammams')),
          getDocs(collection(db, 'organized_trips_hotels')),
          getDocs(collection(db, 'omraHotels')),
        ]);

        const hasDiscount = (d: any) => Number(d.discountPrice || 0) > 0 || Boolean(d.isInstallment);

        setVipTrips(vipSnap.docs.map((d): any => ({ id: d.id, ...d.data() })).filter(hasDiscount));
        setCars(carsSnap.docs.map((d): any => ({ id: d.id, ...d.data() })).filter(hasDiscount));
        setHammams(hammamsSnap.docs.map((d): any => ({ id: d.id, ...d.data() })).filter(hasDiscount));
        setTrips(tripsSnap.docs.map((d): any => ({ id: d.id, ...d.data() })).filter(hasDiscount));
        setOmra(omraSnap.docs.map((d): any => ({ id: d.id, ...d.data() })).filter(hasDiscount));
      } catch (error) {
        console.error('Error loading discounts:', error);
      }
    };
    fetchData();
  }, []);

  const flightWaMsg =
    locale === 'ar'
      ? 'مرحباً، أود الاستفسار عن عروض تذاكر الطيران'
      : locale === 'en'
        ? 'Hello, I would like information about flight ticket offers'
        : 'Bonjour, je voudrais des renseignements sur vos offres de billets d’avion';

  return (
    <div className="min-h-screen bg-gray-50 pt-16 md:pt-24 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-600 rounded-full mb-6">
            <Percent className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            {locale === 'ar'
              ? 'التخفيضات والتقسيط'
              : locale === 'en'
                ? 'Promotions & Installments'
                : 'Promotions et Facilités'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {locale === 'ar'
              ? 'اكتشف جميع عروضنا الخاصة بالتخفيضات والتقسيط. تواصل معنا مباشرة عبر واتساب لحجز عرضك.'
              : locale === 'en'
                ? 'Explore our special discounts and installment offers. Contact us on WhatsApp to book.'
                : 'Découvrez toutes nos offres promotionnelles, contactez-nous directement via WhatsApp.'}
          </p>
        </div>

        {/* Flight Tickets */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
            <Plane className="w-6 h-6 text-primary" />
            {locale === 'ar' ? 'تذاكر الطيران' : locale === 'en' ? 'Flight Tickets' : "Billets d'avion"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Plane className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {locale === 'ar' ? 'حجز تذاكر طيران' : locale === 'en' ? 'Flight Booking' : "Billets d'avion"}
                </h3>
                <p className="text-gray-600 mb-8">
                  {locale === 'ar'
                    ? 'احجز تذاكر الطيران لأي وجهة في العالم بأفضل الأسعار المتاحة وبطرق دفع ميسرة.'
                    : locale === 'en'
                      ? 'Book flights worldwide at the best rates with flexible payment options.'
                      : "Réservez vos billets d'avion au meilleur prix avec facilités."}
                </p>
              </div>
              <a
                href={buildWhatsAppUrl(whatsapp, flightWaMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl font-bold transition-colors shadow-md"
              >
                <Phone className="w-5 h-5" />
                {locale === 'ar' ? 'استفسار وحجز عبر واتساب' : locale === 'en' ? 'Book via WhatsApp' : 'WhatsApp Direct'}
              </a>
            </div>
          </div>
        </div>

        {/* VIP Trips */}
        {vipTrips.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <Crown className="w-6 h-6 text-amber-500" />
              {locale === 'ar' ? 'عروض VIP الحصرية' : locale === 'en' ? 'Exclusive VIP Offers' : 'Offres VIP'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vipTrips.map((vip, idx) => (
                <PromoCard key={vip.id} item={vip} type="vip" locale={locale} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Organized Trips */}
        {trips.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <Building2 className="w-6 h-6 text-primary" />
              {locale === 'ar' ? 'الرحلات المنظمة' : locale === 'en' ? 'Organized Trips' : 'Voyages Organisés'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip, idx) => (
                <PromoCard key={trip.id} item={trip} type="trip" locale={locale} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Cars */}
        {cars.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <Car className="w-6 h-6 text-primary" />
              {locale === 'ar' ? 'السيارات للكراء' : locale === 'en' ? 'Car Rental' : 'Location de Voitures'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car, idx) => (
                <PromoCard key={car.id} item={car} type="car" locale={locale} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Hammams */}
        {hammams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              {locale === 'ar' ? 'السياحة الحموية' : locale === 'en' ? 'Thermal Spas' : 'Centres Thermaux'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hammams.map((h, idx) => (
                <PromoCard key={h.id} item={h} type="hammam" locale={locale} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Omra */}
        {omra.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900">
              <Building2 className="w-6 h-6 text-gold" />
              {locale === 'ar' ? 'فنادق العمرة' : locale === 'en' ? 'Umrah Hotels' : 'Hôtels Omra'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {omra.map((o, idx) => (
                <PromoCard key={o.id} item={o} type="omra" locale={locale} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
