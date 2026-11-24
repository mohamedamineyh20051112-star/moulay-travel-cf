'use client';
import { normalizeDestination } from '@/lib/normalize';
import { useAutoTranslate } from '@/lib/translateClient';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Building2, ChevronRight, Compass } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

function OrganizedDestinationCard({
  dest,
  count,
  locale,
  index,
}: {
  dest: any;
  count: number;
  locale: 'ar' | 'fr' | 'en';
  index: number;
}) {
  const isRtl = locale === 'ar';

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

  const flagSrc = dest.countryCode ? `/flags/${String(dest.countryCode).toLowerCase()}.svg` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.35) }}
      whileHover={{ y: -6 }}
    >
      <Link href={`/${locale}/organized_trips/${dest.id}`} className="block group">
        <div className="relative h-[310px] md:h-[400px] rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-200/80 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-500">
          {dest.image ? (
            <img
              src={dest.image}
              alt={displayName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
              <MapPin className="w-16 h-16 text-gray-300" />
            </div>
          )}

          {/* Top Bar */}
          <div className="absolute top-5 left-5 right-5 flex justify-between items-center z-10">
            <span className="inline-flex items-center gap-1.5 bg-white/90 text-primary backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-md">
              <Compass className="w-3.5 h-3.5 text-gold" />
              {locale === 'ar'
                ? 'رحلة منظمة'
                : locale === 'en'
                  ? 'Guided Trip'
                  : 'Voyage Organisé'}
            </span>

            <div className="bg-primary/90 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg">
              <Building2 className="w-4 h-4 text-gold" />
              {count}{' '}
              {locale === 'ar'
                ? 'فنادق وبرامج'
                : locale === 'en'
                  ? 'Offers'
                  : 'Hôtels'}
            </div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

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
                    className="w-7 h-5 rounded object-cover border border-white/40 shadow shrink-0"
                  />
                )}
                <h3 className="text-2xl md:text-3xl font-black text-white drop-shadow-md truncate group-hover:text-gold transition-colors">
                  {displayName}
                </h3>
              </div>

              {displayCountry && (
                <p className="text-gray-200 font-medium text-sm mb-2">{displayCountry}</p>
              )}
            </div>

            <div className="w-11 h-11 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center text-white group-hover:bg-primary group-hover:border-primary transition-all shrink-0">
              <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function OrganizedTripsDestinations() {
  const locale = useLocale() as 'ar' | 'fr' | 'en';
  const isRtl = locale === 'ar';

  const [destinations, setDestinations] = useState<any[]>([]);
  const [hotelsCount, setHotelsCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [destSnap, legacySnap, hotelsSnap] = await Promise.all([
        getDocs(collection(db, 'services_destinations')),
        getDocs(collection(db, 'organized_trips_destinations')),
        getDocs(collection(db, 'organized_trips_hotels')),
      ]);

      const destMap = new Map<string, any>();
      legacySnap.docs.forEach((d) => destMap.set(d.id, normalizeDestination(d)));
      destSnap.docs.forEach((d) => destMap.set(d.id, normalizeDestination(d)));

      const counts: Record<string, number> = {};

      hotelsSnap.docs.forEach((d) => {
        const data = d.data();
        const destId = data.destinationId;
        if (!destId) return;
        counts[destId] = (counts[destId] || 0) + 1;
      });

      setHotelsCount(counts);

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
      className="bg-gradient-to-b from-[#f8f6f0] via-white to-[#f8f6f0] min-h-screen flex flex-col"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <main className="flex-grow pt-10 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-14 md:mb-16">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary font-bold text-base md:text-lg mb-3 inline-flex items-center gap-2 bg-primary/5 border border-primary/15 px-4 py-1.5 rounded-full"
            >
              <Compass className="w-4 h-4 text-gold" />
              {locale === 'ar'
                ? 'اكتشف العالم بأفضل الأسعار والخدمات'
                : locale === 'en'
                  ? 'Discover the world at the best value'
                  : 'Découvrez le monde aux meilleurs prix'}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight"
            >
              {locale === 'ar'
                ? 'الرحلات المنظمة'
                : locale === 'en'
                  ? 'Organized Trips'
                  : 'Voyages Organisés'}
            </motion.h1>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="h-80 bg-gray-200 rounded-[2rem] animate-pulse" />
              ))
            ) : destinations.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500 text-lg bg-white rounded-3xl border border-gray-200">
                {locale === 'ar'
                  ? 'لا توجد وجهات متاحة حالياً'
                  : locale === 'en'
                    ? 'No destinations currently available'
                    : 'Aucune destination disponible pour le moment'}
              </div>
            ) : (
              destinations.map((dest, index) => (
                <OrganizedDestinationCard
                  key={dest.id}
                  dest={dest}
                  count={hotelsCount[dest.id] || 0}
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
