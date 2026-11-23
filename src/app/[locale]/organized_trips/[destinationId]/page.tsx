'use client';
import { normalizeDestination, normalizeDestinations } from '@/lib/normalize';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Users, ChevronRight, Image as ImageIcon, Star } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function OrganizedTripsHotels({ params }: { params: { locale: string, destinationId: string } }) {
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
      // Fetch destination info from services_destinations, fallback to organized_trips_destinations
      let destDoc = await getDoc(doc(db, 'services_destinations', params.destinationId));
      if (!destDoc.exists()) {
        destDoc = await getDoc(doc(db, 'organized_trips_destinations', params.destinationId));
      }
      if (destDoc.exists()) {
        setDestination(normalizeDestination(destDoc));
      }

      // Fetch hotels
      const q = query(collection(db, 'organized_trips_hotels'), where('destinationId', '==', params.destinationId));
      const hotelsSnapshot = await getDocs(q);
      const hotelsData = hotelsSnapshot.docs.map(doc => normalizeDestination(doc));
      setHotels(hotelsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => { 
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(amount).replace('DZD', 'د.ج'); 
  };

  const currentDestId = destination?.id || params.destinationId;

  return (
    <div className="bg-gray-50 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
      <main className="flex-grow pt-8 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'الرئيسية' : 'Accueil'}
            </Link>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            <Link href={`/${locale}/organized_trips`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'الرحلات المنظمة' : 'Nos destinations'}
            </Link>
            {destination && (
              <>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                <span className="text-gray-900">
                  {locale === 'fr' && destination.nameFr ? destination.nameFr : destination.nameAr}
                </span>
              </>
            )}
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
            >
              {locale === 'ar' ? 'الرحلات الأكثر شعبية' : 'Voyages les plus populaires'}
            </motion.h1>
            {destination && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-500 mt-4 text-xl"
              >
                {locale === 'fr' && destination.nameFr ? destination.nameFr : destination.nameAr}
              </motion.p>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-[250px] bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : hotels.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500 text-lg">
                لا توجد فنادق أو برامج متاحة حالياً لهذه الوجهة
              </div>
            ) : (
              hotels.map((hotel, index) => {
                const totalImages = (hotel.images?.length || 0) + (hotel.roomImages?.length || 0) + (hotel.foodImages?.length || 0);
                return (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col"
                  >
                    <Link href={`/${locale}/organized_trips/${currentDestId}/${hotel.id}`} className="block relative h-[250px] overflow-hidden group">
                      {hotel.images && hotel.images[0] ? (
                        <img 
                          src={hotel.images[0]} 
                          alt={hotel.nameAr} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Image count badge */}
                      {totalImages > 0 && (
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {totalImages}
                        </div>
                      )}
                    </Link>

                    <div className="p-6 flex flex-col flex-grow">
                      <Link href={`/${locale}/organized_trips/${currentDestId}/${hotel.id}`}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary transition-colors">
                          {locale === 'fr' && hotel.nameFr ? hotel.nameFr : hotel.nameAr}
                        </h3>
                      </Link>
                      
                      {hotel.stars > 0 && (
                        <div className="flex text-gold mb-2">
                          {[...Array(hotel.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-gray-500 text-sm font-medium mb-6">
                        <MapPin className="w-4 h-4" />
                        <span>{locale === 'fr' && destination?.nameFr ? destination.nameFr : destination?.nameAr}</span>
                      </div>

                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">{locale === 'ar' ? 'يبدأ من:' : 'À partir de:'}</p>
                        {hotel.discountPrice ? (
                          <div className="flex flex-col mb-6">
                            <span className="text-gray-400 line-through text-sm">
                              {formatCurrency(hotel.price)}
                            </span>
                            <span className="text-green-600 font-bold text-2xl">
                              {formatCurrency(Number(hotel.price) - Number(hotel.discountPrice))}
                            </span>
                          </div>
                        ) : (
                          <p className="text-2xl font-black text-gray-900 mb-6">
                            {formatCurrency(hotel.price)}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                            <Users className="w-5 h-5" />
                            <span>--</span>
                          </div>
                          
                          <Link 
                            href={`/${locale}/organized_trips/${currentDestId}/${hotel.id}`}
                            className="flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
                          >
                            {locale === 'ar' ? 'احجز الآن' : 'Réserver'}
                            <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
