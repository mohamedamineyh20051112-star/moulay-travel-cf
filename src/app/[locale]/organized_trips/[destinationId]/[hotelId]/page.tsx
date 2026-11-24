'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Phone,
  ArrowLeft,
  Camera,
  Utensils,
  Info,
  BedDouble,
  ChevronLeft,
  Heart,
  Star,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import DynamicForm from '@/components/DynamicForm';
import { defaultFormsConfig } from '@/data/defaultForms';
import { normalizeDestination, sanitizeExternalUrl } from '@/lib/normalize';
import { useCurrencyStore, formatConvertedPrice, convertDzdToEur } from '@/store/useCurrencyStore';
import { useSiteContact, buildWhatsAppUrl } from '@/lib/useSiteContact';
import { useAutoTranslate } from '@/lib/translateClient';
import { resolveItemFeatures } from '@/data/serviceFeatures';
import FeatureIcon from '@/components/FeatureIcon';

function LocalizedText({ value, locale }: { value: any; locale: 'ar' | 'fr' | 'en' }) {
  const arVal = typeof value === 'string' ? value : value?.ar || value?.fr || value?.en || '';
  const explicit =
    typeof value === 'string'
      ? value
      : locale === 'en'
        ? value?.en || value?.fr
        : locale === 'fr'
          ? value?.fr
          : value?.ar;
  const translated = useAutoTranslate(arVal, locale, explicit);
  return <>{translated}</>;
}

export default function OrganizedTripsHotelDetails({
  params,
}: {
  params: { locale: string; destinationId: string; hotelId: string };
}) {
  const locale = (params.locale === 'en' ? 'en' : params.locale === 'fr' ? 'fr' : 'ar') as
    | 'ar'
    | 'fr'
    | 'en';
  const isRtl = locale === 'ar';

  const { currency, dzdPerEur } = useCurrencyStore();
  const { whatsapp } = useSiteContact();

  const [destination, setDestination] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'details' | 'form'>('details');
  const [liked, setLiked] = useState(false);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    fetchData();
  }, [params.destinationId, params.hotelId]);

  const fetchData = async () => {
    try {
      let destDoc = await getDoc(doc(db, 'services_destinations', params.destinationId));
      if (!destDoc.exists()) {
        destDoc = await getDoc(doc(db, 'organized_trips_destinations', params.destinationId));
      }
      if (destDoc.exists()) setDestination(normalizeDestination(destDoc));

      const hotelDoc = await getDoc(doc(db, 'organized_trips_hotels', params.hotelId));
      if (hotelDoc.exists()) setHotel(normalizeDestination(hotelDoc));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const hotelName = useAutoTranslate(
    hotel?.nameAr,
    locale,
    locale === 'en' ? hotel?.nameEn || hotel?.nameFr : locale === 'fr' ? hotel?.nameFr : hotel?.nameAr
  );
  const destName = useAutoTranslate(
    destination?.nameAr,
    locale,
    locale === 'en'
      ? destination?.nameEn || destination?.nameFr
      : locale === 'fr'
        ? destination?.nameFr
        : destination?.nameAr
  );
  const descriptionText = useAutoTranslate(
    hotel?.descriptionAr,
    locale,
    locale === 'en'
      ? hotel?.descriptionEn || hotel?.descriptionFr
      : locale === 'fr'
        ? hotel?.descriptionFr
        : hotel?.descriptionAr
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-32 bg-[#f8f6f0]" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-32 bg-[#f8f6f0]" dir={isRtl ? 'rtl' : 'ltr'}>
        <p className="text-xl text-gray-500 font-bold">
          {isRtl
            ? 'الفندق غير موجود'
            : locale === 'en'
              ? 'Offer not found'
              : 'Hôtel introuvable'}
        </p>
      </div>
    );
  }

  const formConfig = JSON.parse(JSON.stringify(defaultFormsConfig['organized_trips']));
  formConfig.title = {
    ar: `حجز رحلة منظمة: ${hotelName}`,
    fr: `Réservation: ${hotelName}`,
    en: `Booking: ${hotelName}`,
  };

  if (formConfig.fields) {
    formConfig.fields.unshift({
      id: 'selected_trip',
      type: 'text',
      label: { ar: 'الرحلة المختارة', fr: 'Voyage sélectionné', en: 'Selected Trip' },
      required: true,
      defaultValue: destName ? `${hotelName} - ${destName}` : hotelName,
      readOnly: true,
    });
  }

  const waText =
    locale === 'ar'
      ? `السلام عليكم، أود الاستفسار عن رحلة منظمة: ${hotelName}${destName ? ` إلى ${destName}` : ''}`
      : locale === 'en'
        ? `Hello, I would like information about the organized trip: ${hotelName}${destName ? ` (${destName})` : ''}`
        : `Bonjour, je voudrais me renseigner concernant le voyage organisé : ${hotelName}${destName ? ` (${destName})` : ''}`;

  if (view === 'form') {
    return (
      <div className="pt-10 md:pt-16 pb-20 bg-[#f8f6f0] min-h-screen" dir={isRtl ? 'rtl' : 'ltr'}>
        <div ref={topRef} className="max-w-3xl mx-auto px-4 relative">
          <button
            onClick={() => {
              setView('details');
              scrollToTop();
            }}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary transition font-bold bg-white px-4 py-2 rounded-full border shadow-sm"
          >
            <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            {isRtl
              ? 'العودة لتفاصيل العرض'
              : locale === 'en'
                ? 'Back to offer details'
                : 'Retour aux détails'}
          </button>
          <DynamicForm formId={`organized_trips_${hotel.id}`} config={formConfig} locale={locale} />
        </div>
      </div>
    );
  }

  const roomList =
    Array.isArray(hotel.roomPrices) && hotel.roomPrices.length > 0
      ? hotel.roomPrices
      : Array.isArray(hotel.rooms)
        ? hotel.rooms
        : [];
  const features = resolveItemFeatures('organized_trips', hotel, locale);
  const safeMapsUrl = sanitizeExternalUrl(hotel.googleMapsLink);

  const basePrice = Number(hotel.price || 0);
  const discount = Number(hotel.discountPrice || 0);
  const effectivePriceDzd = discount > 0 && basePrice > discount ? basePrice - discount : basePrice;

  const galleryThumbs = [
    ...(hotel.images || []),
    ...(hotel.roomImages || []),
    ...(hotel.foodImages || []),
  ].filter(Boolean);

  return (
    <div className="pt-8 md:pt-12 pb-32 min-h-screen bg-[#f8f6f0]" dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        ref={topRef}
        className="max-w-5xl mx-auto px-4"
      >
        <div className="bg-[#fdfbf6] rounded-[2rem] border border-gold/35 shadow-2xl overflow-hidden relative pb-24 md:pb-28">
          {/* Header */}
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-gold/20 bg-white/80 backdrop-blur">
            <Link
              href={`/${locale}/organized_trips/${destination?.id || params.destinationId}`}
              className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50 border border-gray-100 transition"
            >
              <ChevronLeft className={`w-6 h-6 text-primary ${isRtl ? 'rotate-180' : ''}`} />
            </Link>

            <div className="text-center px-3 min-w-0">
              <h1 className="text-xl sm:text-3xl font-black text-primary truncate">{hotelName}</h1>
              {Number(hotel.stars) > 0 && (
                <div className="flex justify-center gap-0.5 text-amber-400 mt-1">
                  {[...Array(Math.min(Number(hotel.stars), 7))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              )}
              <p className="text-gold font-bold text-xs flex items-center justify-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                {isRtl
                  ? 'تفاصيل الرحلة المنظمة'
                  : locale === 'en'
                    ? 'Offer Details'
                    : "Détails de l'offre"}
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLiked((prev) => !prev)}
              aria-label="Favorite"
              className={`p-3 bg-white rounded-full shadow-md border border-gray-100 transition ${
                liked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Hero Image + Thumbnails */}
          <div className="px-5 sm:px-8 pt-6">
            <div
              onClick={() => hotel.images?.[0] && setLightboxImg(hotel.images[0])}
              className="rounded-3xl overflow-hidden h-[280px] sm:h-[380px] md:h-[420px] shadow-lg relative bg-gray-200 cursor-pointer group"
            >
              {hotel.images && hotel.images.length > 0 ? (
                <>
                  <img
                    src={hotel.images[0]}
                    alt={hotelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <span className="absolute bottom-4 right-4 bg-black/55 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-gold" />
                    {isRtl ? 'انقر للتكبير' : locale === 'en' ? 'Tap to enlarge' : 'Agrandir'}
                  </span>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera className="w-12 h-12" />
                </div>
              )}
            </div>

            {galleryThumbs.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pt-3 pb-1">
                {galleryThumbs.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxImg(img)}
                    className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gold/25 hover:border-gold shrink-0 transition-transform hover:scale-105"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 sm:p-5 mt-5 shadow-sm border border-gold/15 flex flex-wrap justify-center items-center gap-5 sm:gap-10 text-gray-700 font-semibold">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" />
                <span>{destName}</span>
              </div>

              {Number(hotel.days) > 0 && (
                <>
                  <div className="w-px h-6 bg-gray-200 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gold" />
                    <span>
                      {hotel.days}{' '}
                      {isRtl ? 'أيام' : locale === 'en' ? 'Days' : 'Jours'}
                    </span>
                  </div>
                </>
              )}

              {safeMapsUrl && (
                <>
                  <div className="w-px h-6 bg-gray-200 hidden sm:block" />
                  <a
                    href={safeMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <MapPin className="w-4 h-4" />
                    {isRtl
                      ? 'عرض الموقع على الخريطة'
                      : locale === 'en'
                        ? 'View on Map'
                        : 'Voir sur la carte'}
                  </a>
                </>
              )}

              {effectivePriceDzd > 0 && (
                <>
                  <div className="w-px h-6 bg-gray-200 hidden sm:block" />
                  <div className="flex flex-wrap items-center gap-2 text-primary font-black text-lg" dir="ltr">
                    <span className="text-xs font-semibold text-gray-500" dir={isRtl ? 'rtl' : 'ltr'}>
                      {isRtl ? 'ابتداءً من:' : locale === 'en' ? 'From:' : 'À partir de:'}
                    </span>
                    {discount > 0 && basePrice > discount && (
                      <span className="text-xs text-gray-400 line-through font-semibold">
                        {formatConvertedPrice(basePrice, currency, dzdPerEur, locale, null)}
                      </span>
                    )}
                    <span className={discount > 0 && basePrice > discount ? 'text-emerald-600' : ''}>
                      {formatConvertedPrice(effectivePriceDzd, currency, dzdPerEur, locale, null)}
                    </span>
                    {discount > 0 && basePrice > discount && currency === 'DZD' && convertDzdToEur(effectivePriceDzd, dzdPerEur) > 0 && (
                      <span className="text-xs text-gray-500 font-bold">
                        ({convertDzdToEur(basePrice, dzdPerEur) > 0 && <span className="line-through opacity-75 mr-1">{convertDzdToEur(basePrice, dzdPerEur)} €</span>}
                        <span className="text-emerald-700">{convertDzdToEur(effectivePriceDzd, dzdPerEur)} €</span>)
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-5 sm:p-8 space-y-8">
            {descriptionText && (
              <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm text-gray-700 leading-relaxed whitespace-pre-line">
                <h3 className="text-primary font-bold mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gold" />
                  {isRtl
                    ? 'لمحة عن العرض'
                    : locale === 'en'
                      ? 'Trip Overview'
                      : "Aperçu de l'offre"}
                </h3>
                <p>{descriptionText}</p>
              </div>
            )}

            {/* Toggleable Features Grid */}
            {features.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-gold" />
                  {isRtl
                    ? 'المميزات والخدمات المشمولة'
                    : locale === 'en'
                      ? 'Included Services & Highlights'
                      : 'Services & Prestations Inclus'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {features.map((feat) => (
                    <div
                      key={feat.id}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-gold/25 shadow-sm text-gray-800"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gold/15 text-gold flex items-center justify-center shrink-0">
                        <FeatureIcon name={feat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold leading-snug">{feat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tabs (Images) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: isRtl ? 'الغرف' : locale === 'en' ? 'Rooms' : 'Chambres',
                  icon: BedDouble,
                  img: hotel.roomImages?.[0],
                },
                {
                  title: isRtl ? 'المطعم' : locale === 'en' ? 'Restaurant' : 'Restaurant',
                  icon: Utensils,
                  img: hotel.foodImages?.[0],
                },
                {
                  title: isRtl ? 'المزيد' : locale === 'en' ? 'More Views' : 'Plus',
                  icon: Camera,
                  img: hotel.images?.[1] || hotel.images?.[0],
                },
              ].map((tile, idx) => {
                const Icon = tile.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => tile.img && setLightboxImg(tile.img)}
                    className="bg-white rounded-2xl p-3 border border-gold/20 shadow-sm cursor-pointer group"
                  >
                    <h4 className="text-primary font-bold text-center flex items-center justify-center gap-1.5 mb-2 text-sm">
                      <Icon className="w-4 h-4 text-gold" /> {tile.title}
                    </h4>
                    <div className="w-full h-28 md:h-32 rounded-xl bg-gray-100 overflow-hidden">
                      {tile.img ? (
                        <img
                          src={tile.img}
                          alt={tile.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Camera className="w-7 h-7" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing Table (Auto-calculated EUR from DZD) */}
            {roomList.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-primary mb-4 text-center flex items-center justify-center gap-2">
                  <span className="w-8 h-[1px] bg-gold" />
                  {isRtl ? 'أسعار الغرف' : locale === 'en' ? 'Room Rates' : 'Prix des Chambres'}
                  <span className="w-8 h-[1px] bg-gold" />
                </h3>
                <div className="bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-md">
                  <table className="w-full text-center text-sm sm:text-base">
                    <thead className="bg-gold/10 text-primary">
                      <tr>
                        <th className="py-4 px-4 sm:px-6 border-b border-gold/20 font-bold w-1/3">
                          {isRtl ? 'نوع الغرفة' : locale === 'en' ? 'Room Type' : 'Type de Chambre'}
                        </th>
                        <th className="py-4 px-4 sm:px-6 border-b border-gold/20 font-bold border-s border-gold/20 w-1/3">
                          {isRtl ? 'السعر (دج)' : 'Prix (DZD)'}
                        </th>
                        <th className="py-4 px-4 sm:px-6 border-b border-gold/20 font-bold border-s border-gold/20 w-1/3">
                          {isRtl ? 'السعر (€)' : 'Prix (€)'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 font-semibold">
                      {roomList.map((room: any, idx: number) => {
                        const dzdVal = Number(room.priceDzd || 0);
                        const autoEur = convertDzdToEur(dzdVal, dzdPerEur);
                        return (
                          <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                            <td className="py-4 px-4 sm:px-6">
                              <LocalizedText
                                value={{
                                  ar: room.typeAr,
                                  fr: room.typeFr,
                                  en: room.typeEn,
                                }}
                                locale={locale}
                              />
                            </td>
                            <td className="py-4 px-4 sm:px-6 border-s border-gold/20 bg-[#fdfdfd]" dir="ltr">
                              {dzdVal > 0 ? `${dzdVal.toLocaleString('fr-DZ')} ${isRtl ? 'د.ج' : 'DA'}` : '-'}
                            </td>
                            <td className="py-4 px-4 sm:px-6 border-s border-gold/20 bg-[#fdfdfd]" dir="ltr">
                              {autoEur > 0 ? `${autoEur.toLocaleString('fr-FR')} €` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Program */}
            {Array.isArray(hotel.program) && hotel.program.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm">
                <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold" />{' '}
                  {isRtl
                    ? 'برنامج الرحلة'
                    : locale === 'en'
                      ? 'Trip Program'
                      : 'Programme du Voyage'}
                </h4>
                <ul className="space-y-4">
                  {hotel.program.map((p: any, idx: number) => (
                    <li key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        {idx !== hotel.program.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gold/30 mt-2" />
                        )}
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl flex-1 border border-gray-100">
                        <p className="text-gray-700 font-medium leading-relaxed">
                          <LocalizedText value={p} locale={locale} />
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trip Schedule */}
            {Array.isArray(hotel.schedules) && hotel.schedules.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-primary mb-4 text-center flex items-center justify-center gap-2">
                  <span className="w-8 h-[1px] bg-gold" />
                  {isRtl
                    ? 'جدول تواريخ الرحلة'
                    : locale === 'en'
                      ? 'Trip Schedule'
                      : 'Calendrier du Voyage'}
                  <span className="w-8 h-[1px] bg-gold" />
                </h3>
                <div className="bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-md">
                  <div className="overflow-x-auto">
                    <table className="w-full text-center min-w-[800px]">
                      <thead className="bg-gold/10 text-primary whitespace-nowrap">
                        <tr>
                          <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'الإقلاع' : locale === 'en' ? 'Departure' : 'Départ'}</th>
                          <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'تاريخ الذهاب' : locale === 'en' ? 'Outbound' : 'Date Aller'}</th>
                          <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'نوع الرحلة' : locale === 'en' ? 'Flight Type' : 'Type Vol'}</th>
                          <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'الدخول' : locale === 'en' ? 'Entry' : 'Entrée'}</th>
                          <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'نوع الخطوط' : locale === 'en' ? 'Airline' : 'Compagnie'}</th>
                          <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'الخروج' : locale === 'en' ? 'Exit' : 'Sortie'}</th>
                          <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'تاريخ الرجوع' : locale === 'en' ? 'Return' : 'Date Retour'}</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700 font-medium whitespace-nowrap">
                        {hotel.schedules.map((sch: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                            <td className="py-4 px-4"><LocalizedText value={sch.departLoc} locale={locale} /></td>
                            <td className="py-4 px-4" dir="ltr">{sch.departDate || '-'}</td>
                            <td className="py-4 px-4"><LocalizedText value={sch.flightType} locale={locale} /></td>
                            <td className="py-4 px-4"><LocalizedText value={sch.entry} locale={locale} /></td>
                            <td className="py-4 px-4"><LocalizedText value={sch.airline} locale={locale} /></td>
                            <td className="py-4 px-4"><LocalizedText value={sch.exit} locale={locale} /></td>
                            <td className="py-4 px-4" dir="ltr">{sch.returnDate || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="fixed md:absolute bottom-0 left-0 w-full bg-white border-t border-gold/30 p-3.5 sm:p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40 md:rounded-b-[2rem]">
            <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
              <a
                href={buildWhatsAppUrl(whatsapp, waText)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white py-3.5 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg text-sm md:text-lg"
              >
                <Phone className="w-5 h-5" />
                {isRtl ? 'استفسار عبر واتساب' : 'WhatsApp'}
              </a>
              <button
                type="button"
                onClick={() => {
                  setView('form');
                  scrollToTop();
                }}
                className="flex-1 bg-gold hover:bg-yellow-600 text-white py-3.5 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg text-sm md:text-lg"
              >
                <Calendar className="w-5 h-5" />
                {isRtl
                  ? 'احجز الآن'
                  : locale === 'en'
                    ? 'Book Now'
                    : 'Réserver Maintenant'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <button
              type="button"
              onClick={() => setLightboxImg(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImg}
              alt={hotelName}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
