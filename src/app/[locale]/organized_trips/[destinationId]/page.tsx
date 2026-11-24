'use client';
import { normalizeDestination } from '@/lib/normalize';
import { useAutoTranslate } from '@/lib/translateClient';
import { useCurrencyStore, formatConvertedPrice, convertDzdToEur } from '@/store/useCurrencyStore';
import { resolveItemFeatures } from '@/data/serviceFeatures';
import FeatureIcon from '@/components/FeatureIcon';
import { motion } from 'framer-motion';
import { MapPin, ChevronRight, Image as ImageIcon, Star, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

function OrganizedHotelCard({
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
  const shortDesc = useAutoTranslate(
    hotel.descriptionAr,
    locale,
    locale === 'en'
      ? hotel.descriptionEn || hotel.descriptionFr
      : locale === 'fr'
        ? hotel.descriptionFr
        : hotel.descriptionAr
  );

  const totalImages =
    (hotel.images?.length || 0) + (hotel.roomImages?.length || 0) + (hotel.foodImages?.length || 0);
  const features = resolveItemFeatures('organized_trips', hotel, locale).slice(0, 4);

  const basePrice = Number(hotel.price || 0);
  const discount = Number(hotel.discountPrice || 0);
  const hasDiscount = discount > 0 && basePrice > discount;
  const finalDzd = hasDiscount ? basePrice - discount : basePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.48, delay: Math.min(index * 0.08, 0.35) }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-[2rem] overflow-hidden border border-gray-200/80 shadow-[0_12px_35px_-12px_rgba(15,37,68,0.12)] hover:shadow-[0_22px_50px_-12px_rgba(197,154,63,0.25)] hover:border-gold/50 transition-all duration-300 flex flex-col group"
    >
      <Link
        href={`/${locale}/organized_trips/${currentDestId}/${hotel.id}`}
        className="block relative h-[255px] overflow-hidden bg-gray-100"
      >
        {hotel.images && hotel.images[0] ? (
          <img
            src={hotel.images[0]}
            alt={hotelName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-300" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start gap-2">
          {Number(hotel.stars) > 0 && (
            <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow flex items-center gap-0.5">
              {[...Array(Math.min(Number(hotel.stars), 7))].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          )}

          {totalImages > 0 && (
            <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ml-auto">
              <ImageIcon className="w-3.5 h-3.5 text-gold" />
              {totalImages}
            </div>
          )}
        </div>

        {/* Bottom Duration & Location Pill */}
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white font-bold">
          {destName && (
            <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full truncate max-w-[68%]">
              <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="truncate">{destName}</span>
            </span>
          )}
          {Number(hotel.days) > 0 && (
            <span className="inline-flex items-center gap-1 bg-primary/90 backdrop-blur-md px-3 py-1 rounded-full shrink-0">
              <Clock className="w-3 h-3 text-gold" />
              {hotel.days} {locale === 'ar' ? 'أيام' : locale === 'en' ? 'Days' : 'Jours'}
            </span>
          )}
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/${locale}/organized_trips/${currentDestId}/${hotel.id}`}>
          <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {hotelName}
          </h3>
        </Link>

        {shortDesc && (
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {shortDesc}
          </p>
        )}

        {/* Toggleable Features Chips */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {features.map((feat) => (
              <span
                key={feat.id}
                className="inline-flex items-center gap-1.5 bg-[#fdf8ed] text-[#6d4f16] border border-[#e7d4a5] text-xs px-2.5 py-1 rounded-full font-semibold"
              >
                <FeatureIcon name={feat.icon} className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>{feat.label}</span>
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 font-semibold mb-1">
              {locale === 'ar' ? 'ابتداءً من' : locale === 'en' ? 'Starting from' : 'À partir de'}
            </p>
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-gray-400 line-through text-xs" dir="ltr">
                  {formatConvertedPrice(basePrice, currency, dzdPerEur, locale, null)}
                </span>
                <span className="text-emerald-600 font-black text-2xl" dir="ltr">
                  {formatConvertedPrice(finalDzd, currency, dzdPerEur, locale, null)}
                </span>
                {currency === 'DZD' && convertDzdToEur(finalDzd, dzdPerEur) > 0 && (
                  <span className="text-xs text-gray-500 font-bold" dir="ltr">
                    <span className="line-through opacity-75 mr-1">{convertDzdToEur(basePrice, dzdPerEur)} €</span>
                    <span className="text-emerald-700">{convertDzdToEur(finalDzd, dzdPerEur)} €</span>
                  </span>
                )}
              </div>
            ) : (
              <p className="text-2xl font-black text-primary" dir="ltr">
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
            href={`/${locale}/organized_trips/${currentDestId}/${hotel.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary hover:bg-gold text-white font-bold text-xs sm:text-sm transition-colors shadow-md"
          >
            <span>
              {locale === 'ar' ? 'احجز الآن' : locale === 'en' ? 'Book Now' : 'Réserver'}
            </span>
            <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function OrganizedTripsHotels({
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
        destDoc = await getDoc(doc(db, 'organized_trips_destinations', params.destinationId));
      }
      if (destDoc.exists()) {
        setDestination(normalizeDestination(destDoc));
      }

      const q = query(
        collection(db, 'organized_trips_hotels'),
        where('destinationId', '==', params.destinationId)
      );
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
  const flagSrc = destination?.countryCode
    ? `/flags/${String(destination.countryCode).toLowerCase()}.svg`
    : null;

  return (
    <div
      className="bg-gradient-to-b from-[#f8f6f0] via-white to-[#f8f6f0] flex flex-col min-h-screen"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <main className="flex-grow pt-8 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'الرئيسية' : locale === 'en' ? 'Home' : 'Accueil'}
            </Link>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            <Link href={`/${locale}/organized_trips`} className="hover:text-primary transition-colors">
              {locale === 'ar'
                ? 'الرحلات المنظمة'
                : locale === 'en'
                  ? 'Organized Trips'
                  : 'Nos destinations'}
            </Link>
            {destination && (
              <>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                <span className="text-gray-900 font-bold">{destName}</span>
              </>
            )}
          </div>

          {/* Header */}
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest bg-primary/5 border border-primary/15 px-4 py-1.5 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-gold" />
              {locale === 'ar'
                ? 'عروض وبرامج شاملة'
                : locale === 'en'
                  ? 'ALL-INCLUSIVE PACKAGES'
                  : 'VOYAGES CLÉ EN MAIN'}
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
            >
              {locale === 'ar'
                ? 'أجمل الرحلات المنظمة'
                : locale === 'en'
                  ? 'Popular Organized Trips'
                  : 'Voyages les plus populaires'}
            </motion.h1>
            {destination && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2.5 text-gray-700 mt-4 text-xl font-bold bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm"
              >
                {flagSrc ? (
                  <img
                    src={flagSrc}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-6 h-4 rounded object-cover"
                  />
                ) : (
                  <MapPin className="w-5 h-5 text-gold" />
                )}
                <span>{destName}</span>
              </motion.div>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-[2rem] overflow-hidden shadow-sm animate-pulse border">
                  <div className="h-[250px] bg-gray-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : hotels.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500 text-lg bg-white rounded-3xl border border-gray-200">
                {locale === 'ar'
                  ? 'لا توجد فنادق أو برامج متاحة حالياً لهذه الوجهة'
                  : locale === 'en'
                    ? 'No trips or hotels currently available for this destination.'
                    : 'Aucun hôtel ou programme disponible pour cette destination.'}
              </div>
            ) : (
              hotels.map((hotel, index) => (
                <OrganizedHotelCard
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
