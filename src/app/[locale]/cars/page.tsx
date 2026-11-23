'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Car, ChevronRight, Settings, Fuel, Users, Phone } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { convertDzdToEur, parseNumericPrice, useCurrencyStore } from '@/store/useCurrencyStore';

interface CarItem {
  id: string;
  brand?: string;
  nameAr?: string;
  nameFr?: string;
  year?: string | number;
  gearbox?: string;
  fuel?: string;
  doors?: string | number;
  seats?: string | number;
  startingPrice?: string | number;
  discountPrice?: string | number;
  images?: string[];
}

export default function CarsPage({ params: { locale } }: { params: { locale: string } }) {
  const [items, setItems] = useState<CarItem[]>([]);
  const { currency, dzdPerEur } = useCurrencyStore();
  const isRtl = locale === 'ar';

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'cars'));
        setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as CarItem));
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f5f7] pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Responsive Top Hero Banner: Desktop (16:9 / wide) + Mobile (Vertical 9:16) */}
      <div className="w-full bg-[#0f172a] shadow-md border-b border-gray-200 overflow-hidden">
        {/* Desktop Banner */}
        <div className="hidden md:block w-full max-w-7xl mx-auto">
          <img
            src="/car-banner-desktop.jpg"
            alt="Location de voitures Moulay Travel"
            className="w-full max-h-[540px] object-contain mx-auto bg-white"
          />
        </div>

        {/* Mobile Vertical Banner */}
        <div className="relative block md:hidden w-full h-[62vh] min-h-[400px] max-h-[540px]">
          <img
            src="/car-banner-mobile.jpg"
            alt="Location de voitures Moulay Travel Mobile"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/35 to-black/30" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white text-center">
            <span className="inline-block bg-orange-500 text-white text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow">
              {isRtl ? 'تأجير السيارات — وهران' : locale === 'en' ? 'Car Rental — Oran' : 'Location de voitures — Oran'}
            </span>
            <h1 className="text-3xl font-black leading-tight drop-shadow-md">
              {isRtl ? 'تشكيلتنا الفاخرة للإيجار' : locale === 'en' ? 'Your Mobility, Our Priority' : 'Votre Mobilité, Notre Priorité'}
            </h1>
            <p className="text-sm text-gray-200 mt-2">
              {isRtl
                ? 'أسطول حديث • توصيل للمطار • أسعار شفافة'
                : locale === 'en'
                  ? 'Recent Fleet • Airport Delivery • Transparent Rates'
                  : 'Flotte récente • Livraison aéroport • Tarifs transparents'}
            </p>
          </div>
        </div>
      </div>

      {/* Cars Grid — Sleek Dark Metallic Responsive Cards matching reference */}
      <div className="container mx-auto px-4 max-w-7xl pt-12 md:pt-16">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight"
          >
            {isRtl ? 'تشكيلتنا الفاخرة' : locale === 'en' ? 'Our Fleet Collection' : 'Notre Collection'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg"
          >
            {isRtl
              ? 'اختر سيارتك المثالية بأسعار واضحة بالدينار واليورو حسب سعر الصرف اليومي.'
              : locale === 'en'
                ? 'Choose your ideal vehicle with transparent daily rates in DZD and EUR.'
                : 'Découvrez notre collection de voitures de location avec conversion automatique en Euro.'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {items.map((item, index) => {
            const baseDzd = parseNumericPrice(item.startingPrice);
            const discountDzd = parseNumericPrice(item.discountPrice);
            const finalDzd = discountDzd > 0 && baseDzd > discountDzd ? baseDzd - discountDzd : baseDzd;
            const autoEur = convertDzdToEur(finalDzd, dzdPerEur);
            const title =
              locale === 'ar'
                ? item.nameAr || item.nameFr || ''
                : item.nameFr || item.nameAr || '';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.08, 0.4) }}
                className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#23262d] via-[#1c1f26] to-[#111318] text-white shadow-xl hover:shadow-2xl border border-white/10 transition-all duration-300"
              >
                <Link href={`/${locale}/cars/${item.id}`} className="block p-5 sm:p-6">
                  {/* Top Row: Photo + Model & Pricing */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    {/* Car Photo */}
                    <div className="sm:col-span-5 relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/15">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Car className="w-14 h-14" />
                        </div>
                      )}
                      {item.brand && (
                        <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/15">
                          {item.brand}
                        </span>
                      )}
                    </div>

                    {/* Car Details + Price Badges */}
                    <div className="sm:col-span-7 flex flex-col justify-between gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-2xl sm:text-3xl font-black tracking-wide uppercase text-white group-hover:text-gold transition-colors truncate">
                            {title}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-300 font-semibold mt-0.5 uppercase tracking-wider">
                            {item.gearbox ? `(${item.gearbox})` : ''} {item.year ? `• ${item.year}` : ''}
                          </p>
                        </div>

                        {/* Circular Yellow/Gold EUR Badge (auto-converted from DZD!) */}
                        {autoEur > 0 && (
                          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#facc15] text-[#111318] flex flex-col items-center justify-center shrink-0 shadow-[0_0_20px_rgba(250,204,21,0.35)] font-black leading-none">
                            <span className="text-lg sm:text-xl" dir="ltr">{autoEur}€</span>
                            <span className="text-[10px] font-bold opacity-80">/{isRtl ? 'يوم' : locale === 'en' ? 'day' : 'j'}</span>
                          </div>
                        )}
                      </div>

                      {/* Bold Red/Crimson Price Ribbon (respects currency toggle) */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-baseline gap-2 bg-[#c81e2b] text-white px-4 py-2 rounded-xl shadow-md">
                          {discountDzd > 0 && baseDzd > discountDzd && (
                            <span className="text-xs line-through opacity-75" dir="ltr">
                              {baseDzd.toLocaleString('fr-DZ')}
                            </span>
                          )}
                          <span className="text-xl sm:text-2xl font-black tracking-tight" dir="ltr">
                            {currency === 'EUR' && autoEur > 0
                              ? `${autoEur} €`
                              : `${finalDzd.toLocaleString('fr-DZ')} ${isRtl ? 'د.ج' : 'DA'}`}
                          </span>
                          <span className="text-xs font-bold opacity-90">
                            /{isRtl ? 'يوم' : locale === 'en' ? 'day' : 'jour'}
                          </span>
                        </div>
                      </div>

                      {/* Specs Pills */}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-300">
                        {item.fuel && (
                          <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                            <Fuel className="w-3.5 h-3.5 text-gold" /> {item.fuel}
                          </span>
                        )}
                        {item.gearbox && (
                          <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                            <Settings className="w-3.5 h-3.5 text-gold" /> {item.gearbox}
                          </span>
                        )}
                        {item.seats && (
                          <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                            <Users className="w-3.5 h-3.5 text-gold" /> {item.seats}{' '}
                            {isRtl ? 'مقاعد' : locale === 'en' ? 'Seats' : 'Places'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-gray-100 group-hover:text-gold transition-colors">
                      {isRtl ? 'احجز الآن' : locale === 'en' ? 'BOOK NOW' : 'RÉSERVER MAINTENANT'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-full bg-gold/90 text-[#111318] flex items-center justify-center shadow group-hover:bg-gold transition-colors">
                        <Phone className="w-4 h-4" />
                      </span>
                      <span className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-gold group-hover:text-[#111318] transition-colors">
                        <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
