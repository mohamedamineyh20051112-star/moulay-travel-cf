'use client';
import { normalizeDestination } from '@/lib/normalize';
import { useAutoTranslate } from '@/lib/translateClient';
import { useCurrencyStore, formatConvertedPrice, convertDzdToEur } from '@/store/useCurrencyStore';
import { resolveItemFeatures } from '@/data/serviceFeatures';
import FeatureIcon from '@/components/FeatureIcon';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Image as ImageIcon, Star, Crown, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

function VIPHotelCard({
  hotel,
  destName,
  currentDestId,
  locale,
  index,
}: {
  hotel: any;
  destName: string;
  currentDestId: string;
  locale: 'ar' | 'fr' | 'en';
  index: number;
}) {
  const isRtl = locale === 'ar';
  const { currency, dzdPerEur } = useCurrencyStore();

  const hotelName = useAutoTranslate(
    hotel.nameAr,
    locale,
    locale === 'en' ? hotel.nameEn || hotel.nameFr : locale === 'fr' ? hotel.nameFr : hotel.nameAr
  );
  const totalImages =
    (hotel.images?.length || 0) + (hotel.roomImages?.length || 0) + (hotel.foodImages?.length || 0);
  const features = resolveItemFeatures('vip_trips', hotel, locale).slice(0, 4);

  const basePrice = Number(hotel.price || 0);
  const discount = Number(hotel.discountPrice || 0);
  const hasDiscount = discount > 0 && basePrice > discount;
  const finalDzd = hasDiscount ? basePrice - discount : basePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.48, delay: Math.min(index * 0.08, 0.35) }}
      whileHover={{ y: -6 }}
      className="bg-gradient-to-b from-[#151a28] to-[#0d1018] rounded-[2rem] overflow-hidden border border-amber-400/25 hover:border-amber-300/75 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.85)] hover:shadow-[0_25px_60px_-12px_rgba(212,175,55,0.28)] transition-all duration-300 flex flex-col group"
    >
      <Link
        href={`/${locale}/vip_trips/${currentDestId}/${hotel.id}`}
        className="block relative h-[270px] overflow-hidden bg-[#0a0d14]"
      >
        {hotel.images && hotel.images[0] ? (
          <img
            src={hotel.images[0]}
            alt={hotelName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Crown className="w-12 h-12 text-amber-400/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1018] via-black/15 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-gradient-to-r from-[#d4af37] to-[#f3d98b] text-[#090b10] px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase shadow">
              VIP
            </span>
            {Number(hotel.stars) > 0 && (
              <div className="bg-black/65 border border-amber-300/30 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-0.5">
                {[...Array(Math.min(Number(hotel.stars), 7))].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                ))}
              </div>
            )}
          </div>

          {totalImages > 0 && (
            <div className="bg-black/65 border border-white/15 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0">
              <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
              {totalImages}
            </div>
          )}
        </div>

        {/* Bottom Overlay Pill */}
        {(hotel.zone || destName) && (
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-amber-100/90 font-semibold">
            <span className="inline-flex items-center gap-1.5 bg-black/55 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full truncate max-w-[75%]">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">{hotel.zone ? `${hotel.zone} • ${destName}` : destName}</span>
            </span>
            {Number(hotel.days) > 0 && (
              <span className="inline-flex items-center gap-1 bg-black/55 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full shrink-0">
                <Clock className="w-3 h-3 text-amber-300" />
                {hotel.days}{' '}
                {locale === 'ar' ? 'أيام' : locale === 'en' ? 'Days' : 'Jours'}
              </span>
            )}
          </div>
        )}
      </Link>

      <div className="p-6 flex flex-col flex-grow text-white">
        <Link href={`/${locale}/vip_trips/${currentDestId}/${hotel.id}`}>
          <h3 className="text-xl font-black text-white mb-3 group-hover:text-amber-200 transition-colors line-clamp-2">
            {hotelName}
          </h3>
        </Link>

        {/* Toggleable Feature Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {features.map((feat) => (
            <span
              key={feat.id}
              className="inline-flex items-center gap-1.5 bg-amber-400/10 text-amber-200 border border-amber-300/20 text-xs px-2.5 py-1 rounded-full font-medium"
            >
              <FeatureIcon name={feat.icon} className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>{feat.label}</span>
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5 border-t border-white/10 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] text-amber-200/70 font-semibold mb-1 uppercase tracking-wider">
              {locale === 'ar' ? 'ابتداءً من' : locale === 'en' ? 'Starting from' : 'À partir de'}
            </p>
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-gray-400 line-through text-xs font-medium" dir="ltr">
                  {formatConvertedPrice(basePrice, currency, dzdPerEur, locale, null)}
                </span>
                <span className="text-amber-300 font-black text-2xl" dir="ltr">
                  {formatConvertedPrice(finalDzd, currency, dzdPerEur, locale, null)}
                </span>
                {currency === 'DZD' && convertDzdToEur(finalDzd, dzdPerEur) > 0 && (
                  <span className="text-xs text-gray-300 font-bold" dir="ltr">
                    <span className="line-through opacity-70 mr-1">{convertDzdToEur(basePrice, dzdPerEur)} €</span>
                    <span className="text-amber-200">{convertDzdToEur(finalDzd, dzdPerEur)} €</span>
                  </span>
                )}
              </div>
            ) : (
              <p className="text-2xl font-black text-amber-300" dir="ltr">
                {finalDzd > 0
                  ? formatConvertedPrice(finalDzd, currency, dzdPerEur, locale, null)
                  : locale === 'ar'
                    ? 'عند الطلب'
                    : locale === 'en'
                      ? 'On Request'
                      : 'Sur demande'}
              </p>
            )}
          </div>

          <Link
            href={`/${locale}/vip_trips/${currentDestId}/${hotel.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-[#f3d98b] text-[#090b10] font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform"
          >
            <span>{locale === 'ar' ? 'اكتشف العرض' : locale === 'en' ? 'Explore' : 'Découvrir'}</span>
            <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function VIPTripsHotels({
  params,
}: {
  params: { locale: string; destinationId: string };
}) {
  const locale = params.locale as 'ar' | 'fr' | 'en';
  const isRtl = locale === 'ar';

  const [destination, setDestination] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.destinationId]);

  const fetchData = async () => {
    try {
      let destDoc = await getDoc(doc(db, 'services_destinations', params.destinationId));
      if (!destDoc.exists()) {
        destDoc = await getDoc(doc(db, 'vip_trips_destinations', params.destinationId));
      }
      if (destDoc.exists()) {
        setDestination(normalizeDestination(destDoc));
      }

      const q = query(collection(db, 'vip_trips_hotels'), where('destinationId', '==', params.destinationId));
      const hotelsSnapshot = await getDocs(q);
      setHotels(hotelsSnapshot.docs.map((d) => normalizeDestination(d)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const destName = useAutoTranslate(
    destination?.nameAr,
    locale,
    locale === 'en'
      ? destination?.nameEn || destination?.nameFr
      : locale === 'fr'
        ? destination?.nameFr
        : destination?.nameAr
  );

  const currentDestId = destination?.id || params.destinationId;
  const flagSrc = destination?.countryCode ? `/flags/${String(destination.countryCode).toLowerCase()}.svg` : null;

  return (
    <div
      className="bg-[#07090e] flex flex-col min-h-screen relative overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[380px] bg-gradient-to-b from-[#d4af37]/15 via-amber-500/5 to-transparent blur-3xl" />

      <main className="flex-grow pt-8 pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 font-medium">
            <Link href={`/${locale}`} className="hover:text-amber-300 transition-colors">
              {locale === 'ar' ? 'الرئيسية' : locale === 'en' ? 'Home' : 'Accueil'}
            </Link>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            <Link href={`/${locale}/vip_trips`} className="hover:text-amber-300 transition-colors">
              {locale === 'ar' ? 'رحلات VIP' : locale === 'en' ? 'VIP Trips' : 'Destinations VIP'}
            </Link>
            {destination && (
              <>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                <span className="text-amber-200 font-bold">{destName}</span>
              </>
            )}
          </div>

          {/* Header */}
          <div className="mb-12 border-b border-amber-400/20 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold text-xs tracking-widest uppercase mb-3">
                <Sparkles className="w-4 h-4" />
                {locale === 'ar'
                  ? 'عروض النخبة الحصرية'
                  : locale === 'en'
                    ? 'EXCLUSIVE VIP SELECTION'
                    : 'SÉLECTION EXCLUSIVE VIP'}
              </span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight"
              >
                {locale === 'ar'
                  ? 'إقامات ورحلات VIP'
                  : locale === 'en'
                    ? 'Exclusive VIP Offers'
                    : 'Nos offres VIP exclusives'}
              </motion.h1>
            </div>

            {destination && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-3 bg-[#121622] border border-amber-400/30 px-4 py-2.5 rounded-2xl text-amber-100 font-bold shadow-lg self-start md:self-auto"
              >
                {flagSrc ? (
                  <img
                    src={flagSrc}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-7 h-5 rounded object-cover border border-white/25"
                  />
                ) : (
                  <MapPin className="w-5 h-5 text-amber-300" />
                )}
                <span className="text-lg">{destName}</span>
              </motion.div>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-[#121622] rounded-[2rem] overflow-hidden border border-amber-400/10 animate-pulse"
                >
                  <div className="h-[260px] bg-white/5" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : hotels.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400 text-lg bg-[#10141f] rounded-3xl border border-amber-400/15">
                {locale === 'ar'
                  ? 'لا توجد فنادق أو برامج متاحة حالياً لهذه الوجهة'
                  : locale === 'en'
                    ? 'No VIP packages currently available for this destination.'
                    : 'Aucune offre VIP disponible pour cette destination.'}
              </div>
            ) : (
              hotels.map((hotel, index) => (
                <VIPHotelCard
                  key={hotel.id}
                  hotel={hotel}
                  destName={destName}
                  currentDestId={currentDestId}
                  locale={locale}
                  index={index}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
