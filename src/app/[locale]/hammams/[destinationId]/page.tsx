'use client';
import { normalizeDestination } from '@/lib/normalize';
import { motion } from 'framer-motion';
import {
  MapPin,
  ChevronRight,
  Image as ImageIcon,
  Waves,
  Home,
  Link as LinkIcon,
  Coins,
  Utensils,
  Sun,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { formatConvertedPrice, useCurrencyStore } from '@/store/useCurrencyStore';

export default function HammamsDestinationList({
  params,
}: {
  params: { locale: string; destinationId: string };
}) {
  const locale = params.locale as 'ar' | 'fr' | 'en';
  const isRtl = locale === 'ar';
  const { currency, dzdPerEur } = useCurrencyStore();

  const [destination, setDestination] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let destDoc = await getDoc(doc(db, 'services_destinations', params.destinationId));
        if (!destDoc.exists()) {
          destDoc = await getDoc(doc(db, 'hammams_destinations', params.destinationId));
        }
        if (destDoc.exists()) {
          setDestination(normalizeDestination(destDoc));
        }

        const q = query(collection(db, 'hammams'), where('destinationId', '==', params.destinationId));
        const hotelsSnapshot = await getDocs(q);
        setHotels(hotelsSnapshot.docs.map((d) => normalizeDestination(d)));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.destinationId]);

  const currentDestId = destination?.id || params.destinationId;

  return (
    <div className="bg-[#f8f5ef] flex flex-col min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
      <main className="flex-grow pt-8 pb-24">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
            <Link href={`/${locale}`} className="hover:text-primary transition-colors">
              {isRtl ? 'الرئيسية' : locale === 'en' ? 'Home' : 'Accueil'}
            </Link>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            <Link href={`/${locale}/hammams`} className="hover:text-primary transition-colors">
              {isRtl ? 'الحمامات والمنتجعات' : locale === 'en' ? 'Wellness & Spas' : 'Centres Thermaux'}
            </Link>
            {destination && (
              <>
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                <span className="text-gray-900 font-bold">
                  {locale !== 'ar' && destination.nameFr ? destination.nameFr : destination.nameAr}
                </span>
              </>
            )}
          </div>

          {/* Header */}
          <div className="mb-12 border-b border-[#e5d5b5] pb-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-[#3a2410] tracking-tight"
            >
              {isRtl ? 'الحمامات والمنتجعات' : locale === 'en' ? 'Thermal Spas & Resorts' : 'Centres Thermaux & Resorts'}
            </motion.h1>
            {destination && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[#7c6548] mt-3 text-lg sm:text-xl flex items-center gap-2 font-semibold"
              >
                <MapPin className="w-5 h-5 text-[#c59a3f]" />
                {locale !== 'ar' && destination.nameFr ? destination.nameFr : destination.nameAr}
              </motion.p>
            )}
          </div>

          {/* Outer Luxury Brochure Cards Grid (matching reference 1000048876.jpg) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-[28px] overflow-hidden shadow-sm border border-[#e5d5b5] animate-pulse p-5">
                  <div className="h-[220px] bg-gray-200 rounded-2xl mb-4" />
                  <div className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-10 bg-gray-200 rounded-full" />
                    <div className="h-10 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))
            ) : hotels.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500 text-lg">
                {isRtl
                  ? 'لا توجد حمامات أو منتجعات متاحة حالياً لهذه الوجهة'
                  : locale === 'en'
                    ? 'No spas or resorts currently available for this destination.'
                    : 'Aucun centre thermal ou hôtel disponible pour cette destination.'}
              </div>
            ) : (
              hotels.map((hotel, index) => {
                const name = locale !== 'ar' && hotel.nameFr ? hotel.nameFr : hotel.nameAr;
                const typeLabel =
                  locale !== 'ar' && hotel.typeFr
                    ? hotel.typeFr
                    : hotel.typeAr ||
                      (isRtl ? 'محطة معدنية / منتجع' : locale === 'en' ? 'Thermal Resort' : 'Station thermale / Hôtel');
                const wilaya =
                  hotel.state || (locale !== 'ar' && destination?.nameFr ? destination.nameFr : destination?.nameAr);
                const commune = hotel.municipality || hotel.area || '';
                const finalDzd =
                  hotel.discountPrice && Number(hotel.price) > Number(hotel.discountPrice)
                    ? Number(hotel.price) - Number(hotel.discountPrice)
                    : Number(hotel.price || 0);

                const servicesSummary: string[] = [];
                if (hotel.hasFood) {
                  servicesSummary.push(
                    locale !== 'ar' && hotel.foodTypeFr
                      ? hotel.foodTypeFr
                      : hotel.foodTypeAr || (isRtl ? 'إطعام' : 'Restaurant')
                  );
                }
                if (hotel.hasTransport) {
                  servicesSummary.push(isRtl ? 'النقل متوفر' : locale === 'en' ? 'Transport' : 'Transport inclus');
                }
                servicesSummary.push(isRtl ? 'استجمام وعلاج' : locale === 'en' ? 'Wellness & Spa' : 'Détente & Bien-être');

                return (
                  <motion.div
                    key={hotel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.08, 0.35) }}
                    className="bg-[#fdfaf2] rounded-[28px] overflow-hidden shadow-md hover:shadow-xl border-2 border-[#dfc999] transition-all duration-300 flex flex-col p-4 sm:p-5"
                  >
                    {/* Top Decorative Header */}
                    <div className="flex flex-col items-center text-center pb-3 pt-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="w-10 h-[1.5px] bg-[#c59a3f]" />
                        <Sun className="w-6 h-6 text-[#c59a3f]" strokeWidth={1.8} />
                        <span className="w-10 h-[1.5px] bg-[#c59a3f]" />
                      </div>
                      <h3 className="text-2xl font-black text-[#3a210c] leading-tight px-2">{name}</h3>
                      <p className="text-xs font-semibold text-[#8a735c] mt-1 tracking-wide">
                        {isRtl ? 'بطاقة وصفية' : locale === 'en' ? 'Descriptive Sheet' : 'Fiche descriptive'}
                      </p>
                    </div>

                    {/* Photo */}
                    <Link
                      href={`/${locale}/hammams/${currentDestId}/${hotel.id}`}
                      className="block relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 shadow-sm border border-[#e5d5b5] shrink-0 group"
                    >
                      {hotel.images?.[0] ? (
                        <img
                          src={hotel.images[0]}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#f0e8d5] flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-[#c59a3f]/40" />
                        </div>
                      )}
                    </Link>

                    {/* Pill Info Rows */}
                    <div className="flex flex-col space-y-2.5 mb-5 flex-grow">
                      <div className="flex items-center bg-white rounded-full border border-[#e5d5b5] p-1.5 pe-4 shadow-sm gap-3">
                        <div className="bg-[#b8892d] w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                          <Waves className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-xs sm:text-sm min-w-0 truncate">
                          <span className="font-extrabold text-[#2b1808]">
                            {isRtl ? 'النوع' : 'Type'} :{' '}
                          </span>
                          <span className="font-medium text-gray-700">{typeLabel}</span>
                        </div>
                      </div>

                      {wilaya && (
                        <div className="flex items-center bg-white rounded-full border border-[#e5d5b5] p-1.5 pe-4 shadow-sm gap-3">
                          <div className="bg-[#b8892d] w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-xs sm:text-sm min-w-0 truncate">
                            <span className="font-extrabold text-[#2b1808]">
                              {isRtl ? 'الولاية' : 'Wilaya'} :{' '}
                            </span>
                            <span className="font-medium text-gray-700">{wilaya}</span>
                          </div>
                        </div>
                      )}

                      {commune && (
                        <div className="flex items-center bg-white rounded-full border border-[#e5d5b5] p-1.5 pe-4 shadow-sm gap-3">
                          <div className="bg-[#b8892d] w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                            <Home className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-xs sm:text-sm min-w-0 truncate">
                            <span className="font-extrabold text-[#2b1808]">
                              {isRtl ? 'البلدية' : locale === 'en' ? 'Area' : 'Commune'} :{' '}
                            </span>
                            <span className="font-medium text-gray-700">{commune}</span>
                          </div>
                        </div>
                      )}

                      {hotel.googleMapsLink && (
                        <div className="flex items-center bg-white rounded-full border border-[#e5d5b5] p-1.5 pe-4 shadow-sm gap-3">
                          <div className="bg-[#b8892d] w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                            <LinkIcon className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-xs sm:text-sm min-w-0 truncate">
                            <span className="font-extrabold text-[#2b1808]">Google Maps : </span>
                            <a
                              href={hotel.googleMapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              {name}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center bg-white rounded-full border border-[#e5d5b5] p-1.5 pe-4 shadow-sm gap-3">
                        <div className="bg-[#b8892d] w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                          <Utensils className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-xs sm:text-sm min-w-0 truncate">
                          <span className="font-extrabold text-[#2b1808]">
                            {isRtl ? 'الخدمات' : 'Services'} :{' '}
                          </span>
                          <span className="font-medium text-gray-700">{servicesSummary.join(' • ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Golden Price Bar (clickable to inner details + auto DZD->EUR) */}
                    <Link
                      href={`/${locale}/hammams/${currentDestId}/${hotel.id}`}
                      className="flex items-center justify-between bg-white hover:bg-[#faf3e0] rounded-full border-2 border-[#c59a3f] p-1.5 pe-4 shadow-sm mt-auto transition-colors group"
                    >
                      <div className="bg-[#b8892d] w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <Coins className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex items-center gap-1.5 text-sm sm:text-base font-black text-[#2b1808]">
                        <span>{isRtl ? 'ابتداءً من' : locale === 'en' ? 'From' : 'À partir de'} :</span>
                        <span className="text-[#9e701c]" dir="ltr">
                          {formatConvertedPrice(finalDzd, currency, dzdPerEur, locale, hotel.priceEuro)}
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-[#b8892d] shrink-0 ${isRtl ? 'rotate-180' : ''}`}
                      />
                    </Link>
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
