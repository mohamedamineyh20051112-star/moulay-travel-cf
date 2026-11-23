'use client';
import { normalizeDestination, normalizeDestinations } from '@/lib/normalize';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { MapPin, Users, ChevronRight, Image as ImageIcon, Star } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export default function VIPTripsHotels({ params }: { params: { locale: string, destinationId: string } }) {
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
      // Fetch destination info from services_destinations, fallback to vip_trips_destinations
      let destDoc = await getDoc(doc(db, 'services_destinations', params.destinationId));
      if (!destDoc.exists()) {
        destDoc = await getDoc(doc(db, 'vip_trips_destinations', params.destinationId));
      }
      if (destDoc.exists()) {
        setDestination(normalizeDestination(destDoc));
      }

      // Fetch hotels
      const q = query(collection(db, 'vip_trips_hotels'), where('destinationId', '==', params.destinationId));
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
    <div className="bg-gray-50 flex flex-col min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      <main className="flex-grow pt-8 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'الرئيسية' : 'Accueil'}
            </Link>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            <Link href={`/${locale}/vip_trips`} className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'رحلات VIP' : 'Nos Destinations VIP'}
            </Link>
            {destination && (
              <>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                <span className="text-gray-900 font-bold">
                  {locale === 'fr' && destination.nameFr ? destination.nameFr : destination.nameAr}
                </span>
              </>
            )}
          </div>

          {/* Header */}
          <div className="mb-12 border-b border-gray-200 pb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight"
            >
              {locale === 'ar' ? 'وجهات VIP المميزة' : 'Nos offres VIP exclusives'}
            </motion.h1>
            {destination && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mt-4 text-xl flex items-center gap-2"
              >
                <MapPin className="w-5 h-5 text-primary" />
                {locale === 'fr' && destination.nameFr ? destination.nameFr : destination.nameAr}
              </motion.p>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-[260px] bg-gray-200"></div>
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
                    className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-gray-100/50 transition-all duration-300 flex flex-col group"
                  >
                    <Link href={`/${locale}/vip_trips/${currentDestId}/${hotel.id}`} className="block relative h-[260px] overflow-hidden">
                      {hotel.images && hotel.images[0] ? (
                        <img 
                          src={hotel.images[0]} 
                          alt={hotel.nameAr} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        {hotel.stars > 0 && (
                          <div className="bg-white/90 backdrop-blur shadow-sm px-2.5 py-1.5 rounded-lg flex items-center gap-1">
                            {[...Array(hotel.stars)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                          </div>
                        )}
                        {totalImages > 0 && (
                          <div className="bg-black/60 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto">
                            <ImageIcon className="w-3.5 h-3.5" />
                            {totalImages}
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-4">
                        <Link href={`/${locale}/vip_trips/${currentDestId}/${hotel.id}`}>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {locale === 'fr' && hotel.nameFr ? hotel.nameFr : hotel.nameAr}
                          </h3>
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[120px]">
                              {hotel.zone || (locale === 'fr' && destination?.nameFr ? destination.nameFr : destination?.nameAr)}
                            </span>
                          </div>
                          {hotel.distanceToHaram && (
                            <div className="flex items-center gap-1.5 bg-gray-100 px-2 rounded-md text-xs py-0.5 border border-gray-200 text-gray-700">
                              <span dir="ltr">{hotel.distanceToHaram}</span>
                            </div>
                          )}
                          {hotel.days && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                              <span>{hotel.days} {locale === 'ar' ? 'أيام' : 'Jours'}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Optional Info Badges (Food/Transport) */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {hotel.hasFood && (
                          <span className="bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-md font-medium border border-orange-100">
                            {locale === 'fr' && hotel.foodTypeFr ? hotel.foodTypeFr : (hotel.foodTypeAr || (locale === 'ar' ? 'إطعام' : 'Restauration'))}
                          </span>
                        )}
                        {hotel.hasTransport && (
                          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-md font-medium border border-blue-100">
                            {locale === 'ar' ? 'نقل متوفر' : 'Transport inclus'}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider">{locale === 'ar' ? 'السعر يبدأ من' : 'À partir de'}</p>
                          {hotel.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="text-gray-400 line-through text-xs font-medium">
                                {formatCurrency(hotel.price)}
                              </span>
                              <span className="text-gray-900 font-black text-2xl">
                                {formatCurrency(Number(hotel.price) - Number(hotel.discountPrice))}
                              </span>
                            </div>
                          ) : (
                            <p className="text-2xl font-black text-gray-900">
                              {formatCurrency(hotel.price)}
                            </p>
                          )}
                        </div>
                        
                        <Link 
                          href={`/${locale}/vip_trips/${currentDestId}/${hotel.id}`}
                          className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
                        >
                          <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </Link>
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
