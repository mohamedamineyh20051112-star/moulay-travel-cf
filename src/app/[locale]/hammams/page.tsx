'use client';
import { normalizeDestination } from '@/lib/normalize';
import { useAutoTranslate } from '@/lib/translateClient';
import { useCurrencyStore, formatConvertedPrice } from '@/store/useCurrencyStore';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Building2, ChevronRight, Waves } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

function HammamDestinationCard({
  dest,
  count,
  minPriceDzd,
  locale,
  index,
}: {
  dest: any;
  count: number;
  minPriceDzd: number;
  locale: 'ar' | 'fr' | 'en';
  index: number;
}) {
  const isRtl = locale === 'ar';
  const { currency, dzdPerEur } = useCurrencyStore();

  const displayName = useAutoTranslate(
    dest.nameAr,
    locale,
    locale === 'en' ? dest.nameEn || dest.nameFr : locale === 'fr' ? dest.nameFr : dest.nameAr
  );
  const displayCountry = useAutoTranslate(
    dest.countryAr,
    locale,
    locale === 'en' ? dest.countryEn || dest.countryFr : locale === 'fr' ? dest.countryFr : dest.countryAr
  );

  const effectiveStartPrice = minPriceDzd > 0 ? minPriceDzd : Number(dest.startingPrice || 0);
  const flagSrc = dest.countryCode ? `/flags/${String(dest.countryCode).toLowerCase()}.svg` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.48, delay: Math.min(index * 0.08, 0.35) }}
      whileHover={{ y: -5 }}
    >
      <Link href={`/${locale}/hammams/${dest.id}`} className="block group">
        <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#e5d5b5]">
          {dest.image ? (
            <img
              src={dest.image}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f0e8d5]">
              <Waves className="w-16 h-16 text-[#c59a3f]/50" />
            </div>
          )}

          <div className="absolute top-6 right-6 bg-[#1d2e4a]/90 text-white backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
            <Building2 className="w-4 h-4 text-[#d4af37]" />
            {count}{' '}
            {locale === 'ar'
              ? 'حمامات ومنتجعات'
              : locale === 'en'
                ? 'Spas & Resorts'
                : 'Centres Thermaux'}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {flagSrc && (
                  <img
                    src={flagSrc}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-7 h-5 rounded object-cover border border-white/40 shadow shrink-0"
                  />
                )}
                <h3 className="text-3xl font-bold text-white drop-shadow-md truncate">{displayName}</h3>
              </div>
              {displayCountry && (
                <p className="text-gray-300 font-medium mb-1">{displayCountry}</p>
              )}
              {effectiveStartPrice > 0 && (
                <p className="text-gold font-bold text-lg" dir="ltr">
                  <span className="text-sm font-medium text-white/85 mr-1.5" dir={isRtl ? 'rtl' : 'ltr'}>
                    {locale === 'ar' ? 'ابتداءً من' : locale === 'en' ? 'From' : 'À partir de'}
                  </span>
                  {formatConvertedPrice(effectiveStartPrice, currency, dzdPerEur, locale, null)}
                </p>
              )}
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
              <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HammamsDestinations() {
  const locale = useLocale() as 'ar' | 'fr' | 'en';
  const isRtl = locale === 'ar';

  const [destinations, setDestinations] = useState<any[]>([]);
  const [hotelsCount, setHotelsCount] = useState<Record<string, number>>({});
  const [minPrices, setMinPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [destSnapshot1, destSnapshot2, hotelsSnapshot] = await Promise.all([
        getDocs(collection(db, 'services_destinations')),
        getDocs(collection(db, 'hammams_destinations')),
        getDocs(collection(db, 'hammams')),
      ]);

      const destsDataMap = new Map<string, any>();
      destSnapshot2.docs.forEach((doc) => {
        destsDataMap.set(doc.id, normalizeDestination(doc));
      });
      destSnapshot1.docs.forEach((doc) => {
        destsDataMap.set(doc.id, normalizeDestination(doc));
      });

      const counts: Record<string, number> = {};
      const mins: Record<string, number> = {};
      hotelsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        const destId = data.destinationId;
        if (!destId) return;
        counts[destId] = (counts[destId] || 0) + 1;
        const base = Number(data.price || 0);
        const disc = Number(data.discountPrice || 0);
        const eff = disc > 0 && base > disc ? base - disc : base;
        if (eff > 0 && (!mins[destId] || eff < mins[destId])) {
          mins[destId] = eff;
        }
      });

      setHotelsCount(counts);
      setMinPrices(mins);

      const visibleDestinations = Array.from(destsDataMap.values()).filter((dest) => counts[dest.id] > 0);
      setDestinations(visibleDestinations);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f5ef] flex flex-col min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      <main className="flex-grow pt-10 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary font-bold text-base md:text-lg mb-3 inline-flex items-center gap-2 bg-primary/5 border border-[#dfc999] px-4 py-1.5 rounded-full"
            >
              <Waves className="w-4 h-4 text-[#c59a3f]" />
              {locale === 'ar'
                ? 'استجمام وعلاج بالمياه المعدنية'
                : locale === 'en'
                  ? 'Thermal Spas & Relaxation'
                  : 'Détente & Bien-être Thermal'}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-[#3a2410] tracking-tight"
            >
              {locale === 'ar'
                ? 'الحمامات والمنتجعات'
                : locale === 'en'
                  ? 'Spas & Wellness'
                  : 'Centres Thermaux'}
            </motion.h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
              ))
            ) : destinations.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500 text-lg">
                {locale === 'ar'
                  ? 'لا توجد وجهات متاحة حالياً'
                  : locale === 'en'
                    ? 'No destinations currently available'
                    : 'Aucune destination disponible pour le moment'}
              </div>
            ) : (
              destinations.map((dest, index) => (
                <HammamDestinationCard
                  key={dest.id}
                  dest={dest}
                  count={hotelsCount[dest.id] || 0}
                  minPriceDzd={minPrices[dest.id] || 0}
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
