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
  Crown,
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

function LocalizedRowText({
  value,
  locale,
}: {
  value: any;
  locale: 'ar' | 'fr' | 'en';
}) {
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

export default function VIPTripsHotelDetails({
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
        destDoc = await getDoc(doc(db, 'vip_trips_destinations', params.destinationId));
      }
      if (destDoc.exists()) setDestination(normalizeDestination(destDoc));

      const hotelDoc = await getDoc(doc(db, 'vip_trips_hotels', params.hotelId));
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
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center pt-20" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center pt-20 text-gray-300" dir={isRtl ? 'rtl' : 'ltr'}>
        <p className="text-xl font-bold">
          {isRtl
            ? 'العرض غير موجود'
            : locale === 'en'
              ? 'Offer not found'
              : 'Offre introuvable'}
        </p>
      </div>
    );
  }

  const formConfig = JSON.parse(JSON.stringify(defaultFormsConfig['vip_trips']));
  formConfig.title = {
    ar: `حجز VIP: ${hotelName}`,
    fr: `Réservation VIP: ${hotelName}`,
    en: `VIP Booking: ${hotelName}`,
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
      ? `السلام عليكم، أود الاستفسار عن عرض VIP: ${hotelName}${destName ? ` (${destName})` : ''}`
      : locale === 'en'
        ? `Hello, I would like to inquire about the VIP offer: ${hotelName}${destName ? ` (${destName})` : ''}`
        : `Bonjour, je souhaite obtenir des renseignements sur l'offre VIP : ${hotelName}${destName ? ` (${destName})` : ''}`;

  if (view === 'form') {
    return (
      <div className="pt-10 md:pt-16 pb-20 min-h-screen bg-[#07090e]" dir={isRtl ? 'rtl' : 'ltr'}>
        <div ref={topRef} className="max-w-3xl mx-auto px-4 relative">
          <button
            onClick={() => {
              setView('details');
              scrollToTop();
            }}
            className="mb-6 inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition font-bold bg-[#121622] px-4 py-2 rounded-full border border-amber-400/30"
          >
            <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            {isRtl
              ? 'العودة لتفاصيل العرض'
              : locale === 'en'
                ? 'Back to offer details'
                : 'Retour aux détails'}
          </button>
          <DynamicForm formId={`vip_trips_${hotel.id}`} config={formConfig} locale={locale} />
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
  const features = resolveItemFeatures('vip_trips', hotel, locale);
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
    <div
      className="pt-8 md:pt-12 pb-32 min-h-screen bg-[#07090e] relative overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Ambient Gold Radial Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#d4af37]/15 via-amber-500/5 to-transparent blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        ref={topRef}
        className="max-w-5xl mx-auto px-4 relative z-10"
      >
        <div className="bg-gradient-to-b from-[#121623] to-[#0b0e16] rounded-[2rem] border border-amber-400/30 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] overflow-hidden pb-24 md:pb-28 relative">
          {/* Header */}
          <div className="p-5 sm:p-6 flex items-center justify-between border-b border-amber-400/20 bg-black/25 backdrop-blur-md">
            <Link
              href={`/${locale}/vip_trips/${destination?.id || params.destinationId}`}
              className="p-3 bg-white/5 hover:bg-amber-400/20 border border-white/10 rounded-full text-amber-200 transition"
            >
              <ChevronLeft className={`w-6 h-6 ${isRtl ? 'rotate-180' : ''}`} />
            </Link>

            <div className="text-center px-3 min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase text-amber-300 mb-1">
                <Crown className="w-3.5 h-3.5" /> VIP CONCIERGE
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white truncate">{hotelName}</h1>
              {Number(hotel.stars) > 0 && (
                <div className="flex justify-center gap-0.5 text-amber-300 mt-1.5">
                  {[...Array(Math.min(Number(hotel.stars), 7))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLiked((prev) => !prev)}
              aria-label="Favorite"
              className={`p-3 rounded-full border transition ${
                liked
                  ? 'bg-red-500/20 border-red-400/40 text-red-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Hero Photo + Thumbnails */}
          <div className="px-5 sm:px-8 pt-6">
            <div
              onClick={() => hotel.images?.[0] && setLightboxImg(hotel.images[0])}
              className="rounded-3xl overflow-hidden h-[280px] sm:h-[380px] md:h-[430px] shadow-2xl relative bg-[#181d2b] border border-amber-400/20 cursor-pointer group"
            >
              {hotel.images && hotel.images.length > 0 ? (
                <>
                  <img
                    src={hotel.images[0]}
                    alt={hotelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-amber-200 border border-amber-300/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <Camera className="w-4 h-4" />
                    {isRtl ? 'انقر للتكبير' : locale === 'en' ? 'Tap to enlarge' : 'Agrandir'}
                  </span>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-300/30">
                  <Crown className="w-16 h-16" />
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
                    className="w-20 h-20 rounded-xl overflow-hidden border border-amber-400/25 hover:border-amber-300 shrink-0 transition-transform hover:scale-105"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Facts Strip (NO Omra fields) */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-5 mt-5 border border-amber-400/20 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-gray-100 font-semibold">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-300" />
                <span>
                  {destName}
                  {hotel.zone ? ` • ${hotel.zone}` : ''}
                </span>
              </div>

              {Number(hotel.days) > 0 && (
                <>
                  <div className="w-px h-5 bg-white/15 hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-300" />
                    <span>
                      {hotel.days}{' '}
                      {isRtl ? 'أيام' : locale === 'en' ? 'Days' : 'Jours'}
                    </span>
                  </div>
                </>
              )}

              {safeMapsUrl && (
                <>
                  <div className="w-px h-5 bg-white/15 hidden sm:block" />
                  <a
                    href={safeMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-amber-300 hover:text-amber-200 hover:underline"
                  >
                    <MapPin className="w-4 h-4" />
                    {isRtl
                      ? 'الموقع على الخريطة'
                      : locale === 'en'
                        ? 'View on Map'
                        : 'Voir sur la carte'}
                  </a>
                </>
              )}

              {effectivePriceDzd > 0 && (
                <>
                  <div className="w-px h-5 bg-white/15 hidden sm:block" />
                  <div className="flex flex-wrap items-center gap-2 text-amber-300 font-black text-lg" dir="ltr">
                    <span className="text-xs font-semibold text-gray-300" dir={isRtl ? 'rtl' : 'ltr'}>
                      {isRtl ? 'ابتداءً من:' : locale === 'en' ? 'From:' : 'À partir de:'}
                    </span>
                    {discount > 0 && basePrice > discount && (
                      <span className="text-xs text-gray-400 line-through font-semibold">
                        {formatConvertedPrice(basePrice, currency, dzdPerEur, locale, null)}
                      </span>
                    )}
                    <span>
                      {formatConvertedPrice(effectivePriceDzd, currency, dzdPerEur, locale, null)}
                    </span>
                    {discount > 0 && basePrice > discount && currency === 'DZD' && convertDzdToEur(effectivePriceDzd, dzdPerEur) > 0 && (
                      <span className="text-xs text-amber-100/80 font-bold">
                        ({convertDzdToEur(basePrice, dzdPerEur) > 0 && <span className="line-through opacity-75 mr-1">{convertDzdToEur(basePrice, dzdPerEur)} €</span>}
                        <span className="text-amber-300">{convertDzdToEur(effectivePriceDzd, dzdPerEur)} €</span>)
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Details Content */}
          <div className="p-5 sm:p-8 space-y-8">
            {/* Description */}
            {descriptionText && (
              <div className="bg-white/[0.04] p-6 rounded-2xl border border-white/10 text-gray-200 leading-relaxed whitespace-pre-line">
                <h3 className="text-amber-300 font-bold mb-3 flex items-center gap-2 text-lg">
                  <Info className="w-5 h-5" />
                  {isRtl
                    ? 'لمحة عن هذه التجربة الفاخرة'
                    : locale === 'en'
                      ? 'Experience Overview'
                      : "Aperçu de l'expérience"}
                </h3>
                <p className="text-gray-300 leading-7">{descriptionText}</p>
              </div>
            )}

            {/* Toggleable VIP Features Grid */}
            {features.length > 0 && (
              <div>
                <h3 className="text-xl font-black text-white mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  {isRtl
                    ? 'مزايا وخدمات الباقة الحصرية'
                    : locale === 'en'
                      ? 'Exclusive VIP Privileges'
                      : 'Privilèges & Services Inclus'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                  {features.map((feat) => (
                    <div
                      key={feat.id}
                      className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-400/10 to-white/[0.03] border border-amber-300/25 text-amber-100 shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                        <FeatureIcon name={feat.icon} className="w-4 h-4" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold leading-snug">{feat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Sub-Gallery Cards (render only categories with uploaded photos) */}
            {(() => {
              const subGalleryTiles = [
                {
                  title: isRtl ? 'الأجنحة والغرف' : locale === 'en' ? 'Suites & Rooms' : 'Suites & Chambres',
                  icon: BedDouble,
                  img: hotel.roomImages?.[0],
                },
                {
                  title: isRtl ? 'المطعم والضيافة' : locale === 'en' ? 'Fine Dining' : 'Restauration',
                  icon: Utensils,
                  img: hotel.foodImages?.[0],
                },
                {
                  title: isRtl ? 'مرافق المنتجع' : locale === 'en' ? 'Resort & Views' : 'Plus de photos',
                  icon: Camera,
                  img: hotel.images?.[1],
                },
              ].filter((tile) => Boolean(tile.img));

              if (subGalleryTiles.length === 0) return null;
              const colsClass =
                subGalleryTiles.length === 1
                  ? 'grid-cols-1 max-w-md mx-auto'
                  : subGalleryTiles.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-3';

              return (
                <div className={`grid ${colsClass} gap-4`}>
                  {subGalleryTiles.map((tile, idx) => {
                    const Icon = tile.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => tile.img && setLightboxImg(tile.img)}
                        className="rounded-2xl overflow-hidden border border-amber-400/20 bg-white/[0.03] cursor-pointer group"
                      >
                        <div className="h-36 bg-[#181d2b] overflow-hidden relative">
                          <img
                            src={tile.img}
                            alt={tile.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="py-2.5 px-3 text-center text-xs font-bold text-amber-200 flex items-center justify-center gap-1.5">
                          <Icon className="w-4 h-4 text-amber-300" />
                          {tile.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Pricing Table (Auto-calculated EUR from DZD) */}
            {roomList.length > 0 && (
              <div>
                <h3 className="text-xl font-black text-white mb-4 text-center flex items-center justify-center gap-3">
                  <span className="w-10 h-[1px] bg-amber-400/50" />
                  {isRtl
                    ? 'أسعار الغرف والأجنحة'
                    : locale === 'en'
                      ? 'Room & Suite Rates'
                      : 'Tarifs des Chambres & Suites'}
                  <span className="w-10 h-[1px] bg-amber-400/50" />
                </h3>
                <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-amber-400/25 shadow-xl">
                  <table className="w-full text-center text-sm sm:text-base">
                    <thead className="bg-amber-400/15 text-amber-200">
                      <tr>
                        <th className="py-4 px-4 sm:px-6 font-bold">
                          {isRtl ? 'النوع' : locale === 'en' ? 'Suite Type' : 'Type de Chambre'}
                        </th>
                        <th className="py-4 px-4 sm:px-6 font-bold border-s border-amber-400/20">
                          {isRtl ? 'السعر (د.ج)' : 'DZD'}
                        </th>
                        <th className="py-4 px-4 sm:px-6 font-bold border-s border-amber-400/20">
                          {isRtl ? 'السعر (€)' : 'EUR (€)'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-200 font-semibold">
                      {roomList.map((room: any, idx: number) => {
                        const dzdVal = Number(room.priceDzd || 0);
                        const autoEur = convertDzdToEur(dzdVal, dzdPerEur);
                        return (
                          <tr
                            key={idx}
                            className="border-t border-white/10 hover:bg-white/[0.04] transition"
                          >
                            <td className="py-4 px-4 sm:px-6">
                              <LocalizedRowText
                                value={{
                                  ar: room.typeAr,
                                  fr: room.typeFr,
                                  en: room.typeEn,
                                }}
                                locale={locale}
                              />
                            </td>
                            <td className="py-4 px-4 sm:px-6 border-s border-white/10 text-white" dir="ltr">
                              {dzdVal > 0 ? `${dzdVal.toLocaleString('fr-DZ')} ${isRtl ? 'د.ج' : 'DA'}` : '-'}
                            </td>
                            <td className="py-4 px-4 sm:px-6 border-s border-white/10 text-amber-300" dir="ltr">
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

            {/* VIP Step-by-Step Program */}
            {Array.isArray(hotel.program) && hotel.program.length > 0 && (
              <div className="bg-white/[0.03] p-6 rounded-2xl border border-amber-400/20">
                <h4 className="text-amber-300 font-bold mb-5 flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  {isRtl
                    ? 'برنامج الرحلة اليومي'
                    : locale === 'en'
                      ? 'Luxury Itinerary'
                      : 'Programme du Voyage'}
                </h4>
                <ul className="space-y-4">
                  {hotel.program.map((p: any, idx: number) => (
                    <li key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b58926] text-[#090b10] flex items-center justify-center font-black text-sm shrink-0">
                          {idx + 1}
                        </div>
                        {idx !== hotel.program.length - 1 && (
                          <div className="w-0.5 flex-1 bg-amber-400/30 mt-2" />
                        )}
                      </div>
                      <div className="bg-white/[0.04] p-4 rounded-xl flex-1 border border-white/10 text-gray-200 leading-relaxed">
                        <LocalizedRowText value={p} locale={locale} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trip Schedule Table */}
            {Array.isArray(hotel.schedules) && hotel.schedules.length > 0 && (
              <div>
                <h3 className="text-xl font-black text-white mb-4 text-center flex items-center justify-center gap-3">
                  <span className="w-8 h-[1px] bg-amber-400/50" />
                  {isRtl
                    ? 'جدول مواعيد الرحلات'
                    : locale === 'en'
                      ? 'Flight & Departure Schedule'
                      : 'Calendrier des Départs'}
                  <span className="w-8 h-[1px] bg-amber-400/50" />
                </h3>
                <div className="bg-white/[0.03] rounded-2xl overflow-hidden border border-amber-400/25 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-center min-w-[720px] text-sm">
                      <thead className="bg-amber-400/15 text-amber-200 whitespace-nowrap">
                        <tr>
                          <th className="py-3.5 px-4 font-bold">{isRtl ? 'الإقلاع' : locale === 'en' ? 'Departure' : 'Départ'}</th>
                          <th className="py-3.5 px-4 font-bold">{isRtl ? 'تاريخ الذهاب' : locale === 'en' ? 'Outbound' : 'Date Aller'}</th>
                          <th className="py-3.5 px-4 font-bold">{isRtl ? 'نوع الرحلة' : locale === 'en' ? 'Flight Type' : 'Type Vol'}</th>
                          <th className="py-3.5 px-4 font-bold">{isRtl ? 'شركة الطيران' : locale === 'en' ? 'Airline' : 'Compagnie'}</th>
                          <th className="py-3.5 px-4 font-bold">{isRtl ? 'تاريخ الرجوع' : locale === 'en' ? 'Return' : 'Date Retour'}</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-200 font-medium whitespace-nowrap">
                        {hotel.schedules.map((sch: any, idx: number) => (
                          <tr key={idx} className="border-t border-white/10 hover:bg-white/[0.04]">
                            <td className="py-4 px-4"><LocalizedRowText value={sch.departLoc} locale={locale} /></td>
                            <td className="py-4 px-4" dir="ltr">{sch.departDate || '-'}</td>
                            <td className="py-4 px-4"><LocalizedRowText value={sch.flightType} locale={locale} /></td>
                            <td className="py-4 px-4"><LocalizedRowText value={sch.airline} locale={locale} /></td>
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
          <div className="fixed md:absolute bottom-0 inset-x-0 w-full bg-[#0c0f18]/95 backdrop-blur-lg border-t border-amber-400/30 p-3.5 sm:p-4 shadow-2xl z-40 md:rounded-b-[2rem]">
            <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
              <a
                href={buildWhatsAppUrl(whatsapp, waText)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg text-sm md:text-base"
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
                className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#f3d98b] hover:brightness-110 text-[#090b10] py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition shadow-lg text-sm md:text-base"
              >
                <Crown className="w-5 h-5" />
                {isRtl
                  ? 'احجز عرض VIP'
                  : locale === 'en'
                    ? 'Book VIP Now'
                    : 'Réserver VIP'}
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
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
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
              className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-amber-400/30 shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
