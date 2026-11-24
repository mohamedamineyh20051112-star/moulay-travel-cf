'use client';
import { normalizeDestination } from '@/lib/normalize';
import { useAutoTranslate } from '@/lib/translateClient';
import { useCurrencyStore, formatConvertedPrice } from '@/store/useCurrencyStore';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Building2, ChevronRight, Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

function VIPDestinationCard({
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.08, 0.35) }}
      whileHover={{ y: -6 }}
    >
      <Link href={`/${locale}/vip_trips/${dest.id}`} className="block group">
        <div className="relative h-[320px] md:h-[420px] rounded-[2rem] overflow-hidden bg-[#121622] border border-amber-400/25 group-hover:border-amber-300/70 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] group-hover:shadow-[0_25px_70px_-10px_rgba(212,175,55,0.28)] transition-all duration-500">
          {dest.image ? (
            <img
              src={dest.image}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1b2234] to-[#0a0d14] flex items-center justify-center">
              <Crown className="w-16 h-16 text-amber-400/30" />
            </div>
          )}

          {/* Luxury Gradient & Rim Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-[#07090e]/45 to-black/20" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2rem] pointer-events-none" />

          {/* Top Bar: VIP Badge + Hotels Count */}
          <div className="absolute top-5 left-5 right-5 flex items-center justify-between gap-2 z-10">
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#d4af37] to-[#f3d98b] text-[#090b10] px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-lg">
              <Crown className="w-3.5 h-3.5" />
              VIP
            </span>

            <div className="bg-black/60 border border-amber-300/30 text-amber-100 backdrop-blur-md px-4 py-1.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg">
              <Building2 className="w-4 h-4 text-amber-300" />
              {count}{' '}
              {locale === 'ar'
                ? 'عروض حصرية'
                : locale === 'en'
                  ? 'VIP Offers'
                  : 'Offres VIP'}
            </div>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex justify-between items-end gap-4 z-10">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {flagSrc && (
                  <img
                    src={flagSrc}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-7 h-5 rounded object-cover border border-white/30 shadow shrink-0"
                  />
                )}
                <h3 className="text-2xl md:text-3xl font-black text-white drop-shadow-md truncate group-hover:text-amber-200 transition-colors">
                  {displayName}
                </h3>
              </div>

              {displayCountry && (
                <p className="text-gray-300 font-medium text-sm mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {displayCountry}
                </p>
              )}

              {effectiveStartPrice > 0 && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-amber-300/30 rounded-xl px-3.5 py-1.5 mt-1">
                  <span className="text-xs text-amber-100/80 font-medium">
                    {locale === 'ar' ? 'ابتداءً من' : locale === 'en' ? 'From' : 'À partir de'}
                  </span>
                  <span className="text-amber-300 font-black text-base md:text-lg" dir="ltr">
                    {formatConvertedPrice(effectiveStartPrice, currency, dzdPerEur, locale, null)}
                  </span>
                </div>
              )}
            </div>

            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b58926] text-[#090b10] flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300 shrink-0">
              <ChevronRight className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function VIPTripsDestinations() {
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
      const [destSnap, legacySnap, hotelsSnap] = await Promise.all([
        getDocs(collection(db, 'services_destinations')),
        getDocs(collection(db, 'vip_trips_destinations')),
        getDocs(collection(db, 'vip_trips_hotels')),
      ]);

      const destMap = new Map<string, any>();
      legacySnap.docs.forEach((d) => destMap.set(d.id, normalizeDestination(d)));
      destSnap.docs.forEach((d) => destMap.set(d.id, normalizeDestination(d)));

      const counts: Record<string, number> = {};
      const mins: Record<string, number> = {};

      hotelsSnap.docs.forEach((d) => {
        const data = d.data();
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

      const visibleDestinations = Array.from(destMap.values()).filter((dest) => counts[dest.id] > 0);
      setDestinations(visibleDestinations);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="bg-[#07090e] min-h-screen flex flex-col relative overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Ambient Champagne Gold Spotlight */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-gradient-to-b from-[#d4af37]/15 via-amber-500/5 to-transparent blur-3xl" />

      <main className="flex-grow pt-10 pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-14 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-300/30 text-amber-300 font-bold text-xs md:text-sm tracking-widest uppercase mb-4"
            >
              <Sparkles className="w-4 h-4" />
              {locale === 'ar'
                ? 'تجربة سفر ملكية واستثنائية'
                : locale === 'en'
                  ? 'PRIVATE ROYAL COLLECTION'
                  : 'COLLECTION PRIVÉE D’EXCEPTION'}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 tracking-tight"
            >
              {locale === 'ar'
                ? 'رحلات وإقامات VIP'
                : locale === 'en'
                  ? 'VIP Destinations'
                  : 'Nos Destinations VIP'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-gray-400 max-w-2xl mx-auto mt-4 text-base md:text-lg"
            >
              {locale === 'ar'
                ? 'باقات فاخرة مختارة بعناية مع خدمة مرافقة خاصة، نقل راقٍ وأرقى المنتجعات العالمية.'
                : locale === 'en'
                  ? 'Handpicked luxury escapes with private transfers, elite resorts, and 24/7 concierge care.'
                  : 'Des séjours d’exception soigneusement sélectionnés avec transferts privés et conciergerie VIP.'}
            </motion.p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              [1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-[340px] md:h-[420px] bg-[#121622] border border-amber-400/10 rounded-[2rem] animate-pulse"
                />
              ))
            ) : destinations.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400 text-lg bg-[#10141f] rounded-3xl border border-amber-400/15">
                {locale === 'ar'
                  ? 'لا توجد وجهات VIP متاحة حالياً'
                  : locale === 'en'
                    ? 'No VIP destinations available at the moment'
                    : 'Aucune destination VIP disponible pour le moment'}
              </div>
            ) : (
              destinations.map((dest, index) => (
                <VIPDestinationCard
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
