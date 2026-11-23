'use client';
import { normalizeDestination, normalizeDestinations } from '@/lib/normalize';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Building2, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function OrganizedTripsDestinations() {
  const locale = useLocale() as 'ar' | 'fr' | 'en';
  const isRtl = locale === 'ar';
  const t = useTranslations('Services');
  
  const [destinations, setDestinations] = useState<any[]>([]);
  const [hotelsCount, setHotelsCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch destinations from both collections for legacy support
      const destSnapshot1 = await getDocs(collection(db, 'services_destinations'));
      const destSnapshot2 = await getDocs(collection(db, 'hammams_destinations'));
      
      const destsDataMap = new Map();
      destSnapshot1.docs.forEach(doc => {
        destsDataMap.set(doc.id, normalizeDestination(doc));
      });
      destSnapshot2.docs.forEach(doc => {
        if (!destsDataMap.has(doc.id)) {
          destsDataMap.set(doc.id, normalizeDestination(doc));
        }
      });
      const destsData = Array.from(destsDataMap.values());
      setDestinations(destsData);

      // Fetch hammams to get counts
      const hotelsSnapshot = await getDocs(collection(db, 'hammams'));
      const counts: Record<string, number> = {};
      hotelsSnapshot.docs.forEach(doc => {
        const destId = doc.data().destinationId;
        if (destId) {
          counts[destId] = (counts[destId] || 0) + 1;
        }
      });
      setHotelsCount(counts);

      // Filter out destinations with 0 hammams
      const visibleDestinations = destsData.filter(dest => counts[dest.id] > 0);
      setDestinations(visibleDestinations);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      <main className="flex-grow pt-8 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary font-caveat text-2xl md:text-3xl mb-4"
            >
              Voyagez avec Moulay Travel
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight"
            >
              {locale === 'ar' ? 'الحمامات' : locale === 'fr' ? 'Nos destinations' : 'Our Destinations'}
            </motion.h1>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {isLoading ? (
              [1, 2, 3, 4].map(n => (
                <div key={n} className="h-80 bg-gray-200 rounded-3xl animate-pulse"></div>
              ))
            ) : destinations.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500 text-lg">
                لا توجد وجهات متاحة حالياً
              </div>
            ) : (
              destinations.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/${locale}/hammams/${dest.id}`} className="block group">
                    <div className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden bg-gray-100 shadow-md">
                      {dest.image ? (
                        <img 
                          src={dest.image} 
                          alt={locale === 'fr' && dest.nameFr ? dest.nameFr : dest.nameAr} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Badge for Hotels count */}
                      <div className="absolute top-6 right-6 bg-navy-900/90 text-white backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
                        <Building2 className="w-4 h-4" />
                        {hotelsCount[dest.id] || 0} {locale === 'fr' ? 'HÔTELS' : 'فنادق'}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-between items-end">
                        <div>
                          <h3 className="text-3xl font-bold text-white drop-shadow-md mb-2">
                            {locale === 'fr' && dest.nameFr ? dest.nameFr : dest.nameAr}
                          </h3>
                          {(dest.countryAr || dest.countryFr) && (
                            <p className="text-gray-300 font-medium mb-1">
                              {locale === 'fr' && dest.countryFr ? dest.countryFr : dest.countryAr}
                            </p>
                          )}
                          {dest.startingPrice > 0 && (
                            <p className="text-gold font-bold text-lg">
                              {locale === 'ar' ? 'ابتداءا من' : 'À partir de'} {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(dest.startingPrice).replace('DZD', 'د.ج')}
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
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
