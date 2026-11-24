'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Phone,
  ArrowLeft,
  Camera,
  Utensils,
  Info,
  ChevronLeft,
  Star,
  Waves,
  Home,
  Link as LinkIcon,
  Coins,
  Sun,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import DynamicForm from '@/components/DynamicForm';
import { defaultFormsConfig } from '@/data/defaultForms';
import { normalizeDestination, sanitizeExternalUrl } from '@/lib/normalize';
import { convertDzdToEur, formatConvertedPrice, useCurrencyStore } from '@/store/useCurrencyStore';
import { useSiteContact, buildWhatsAppUrl } from '@/lib/useSiteContact';
import { useAutoTranslate } from '@/lib/translateClient';
import { resolveItemFeatures } from '@/data/serviceFeatures';
import FeatureIcon from '@/components/FeatureIcon';

export default function HammamDetailsPage({
  params,
}: {
  params: { locale: string; destinationId: string; hammamId: string };
}) {
  const locale = (params.locale === 'en' ? 'en' : params.locale === 'fr' ? 'fr' : 'ar') as
    | 'ar'
    | 'fr'
    | 'en';
  const isRtl = locale === 'ar';
  const { currency, dzdPerEur } = useCurrencyStore();
  const { whatsapp } = useSiteContact();

  const [destination, setDestination] = useState<any>(null);
  const [hammam, setHammam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'details' | 'form'>('details');

  const topRef = useRef<HTMLDivElement>(null);

  const hammamName = useAutoTranslate(
    hammam?.nameAr,
    locale,
    locale === 'en' ? hammam?.nameEn || hammam?.nameFr : locale === 'fr' ? hammam?.nameFr : hammam?.nameAr
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
  const typeLabel = useAutoTranslate(
    hammam?.typeAr || 'محطة معدنية / منتجع',
    locale,
    locale === 'en' ? hammam?.typeEn || hammam?.typeFr : locale === 'fr' ? hammam?.typeFr : hammam?.typeAr
  );
  const descriptionText = useAutoTranslate(
    hammam?.descriptionAr,
    locale,
    locale === 'en'
      ? hammam?.descriptionEn || hammam?.descriptionFr
      : locale === 'fr'
        ? hammam?.descriptionFr
        : hammam?.descriptionAr
  );

  const scrollToTop = () => {
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let destDoc = await getDoc(doc(db, 'services_destinations', params.destinationId));
        if (!destDoc.exists()) {
          destDoc = await getDoc(doc(db, 'hammams_destinations', params.destinationId));
        }
        if (destDoc.exists()) setDestination(normalizeDestination(destDoc));

        const hammamDoc = await getDoc(doc(db, 'hammams', params.hammamId));
        if (hammamDoc.exists()) setHammam(normalizeDestination(hammamDoc));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.destinationId, params.hammamId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-32" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  if (!hammam) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-32" dir={isRtl ? 'rtl' : 'ltr'}>
        <p className="text-xl text-gray-500">
          {isRtl ? 'الحمام غير موجود' : locale === 'en' ? 'Resort not found' : 'Hôtel introuvable'}
        </p>
      </div>
    );
  }

  const basePrice = Number(hammam.price || 0);
  const discount = Number(hammam.discountPrice || 0);
  const hasDiscount = discount > 0 && basePrice > discount;
  const finalDzd = hasDiscount ? basePrice - discount : basePrice;
  const baseEur = convertDzdToEur(basePrice, dzdPerEur);
  const finalEur = convertDzdToEur(finalDzd, dzdPerEur);
  const safeMapsUrl = sanitizeExternalUrl(hammam.googleMapsLink);

  const formConfig = JSON.parse(JSON.stringify(defaultFormsConfig['hammams']));
  formConfig.title = {
    ar: `حجز: ${hammamName}`,
    fr: `Réservation : ${hammamName}`,
    en: `Booking: ${hammamName}`,
  };

  if (formConfig.fields) {
    formConfig.fields.unshift({
      id: 'selected_trip',
      type: 'text',
      label: { ar: 'المنتجع / الحمام المختار', fr: 'Établissement sélectionné', en: 'Selected Resort' },
      required: true,
      defaultValue: `${hammamName} - ${destName}`,
      readOnly: true,
    });
  }

  const waText = isRtl
    ? `السلام عليكم، أود الاستفسار عن: ${hammamName} (${destName})...`
    : `Bonjour, je voudrais me renseigner concernant : ${hammamName} (${destName})...`;

  if (view === 'form') {
    return (
      <div className="pt-28 pb-20 bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
        <div ref={topRef} className="max-w-3xl mx-auto px-4 relative">
          <button
            type="button"
            onClick={() => {
              setView('details');
              scrollToTop();
            }}
            className="mb-6 flex items-center gap-2 text-gray-500 hover:text-primary transition font-bold"
          >
            <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            {isRtl ? 'العودة للتفاصيل' : locale === 'en' ? 'Back to details' : 'Retour aux détails'}
          </button>
          <DynamicForm formId={`hammams_${hammam.id}`} config={formConfig} locale={locale} />
        </div>
      </div>
    );
  }

  const roomList =
    Array.isArray(hammam.roomPrices) && hammam.roomPrices.length > 0
      ? hammam.roomPrices
      : Array.isArray(hammam.rooms)
        ? hammam.rooms
        : [];

  const enabledFeatures = resolveItemFeatures('hammams', hammam, locale);

  return (
    <div className="pt-20 md:pt-28 pb-32 min-h-screen bg-[#f5f1e8] px-3 sm:px-6" dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        ref={topRef}
        className="max-w-5xl mx-auto bg-[#fdfaf2] rounded-[2rem] border-2 border-[#dfc999] shadow-2xl overflow-hidden relative pb-24"
      >
        {/* Top Luxury Brochure Header */}
        <div className="px-5 sm:px-8 pt-6 pb-5 border-b border-[#e5d5b5] relative flex items-center justify-between gap-3">
          <Link
            href={`/${locale}/hammams/${destination?.id || params.destinationId}`}
            className="p-2.5 sm:p-3 bg-white rounded-full shadow-sm border border-[#e5d5b5] hover:bg-[#faf3e0] transition shrink-0"
          >
            <ChevronLeft className={`w-5 h-5 sm:w-6 sm:h-6 text-[#3a210c] ${isRtl ? 'rotate-180' : ''}`} />
          </Link>

          <div className="text-center flex-1 min-w-0">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-8 h-[1.5px] bg-[#c59a3f]" />
              <Sun className="w-5 h-5 text-[#c59a3f]" />
              <span className="w-8 h-[1.5px] bg-[#c59a3f]" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1d2e4a] truncate">
              {hammamName}
            </h1>
            {Number(hammam.stars) > 0 && (
              <div className="flex justify-center text-[#c59a3f] mt-1 gap-0.5">
                {[...Array(Number(hammam.stars))].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            )}
            <p className="text-xs sm:text-sm text-[#7c6548] font-semibold mt-1">
              {isRtl ? 'بطاقة وصفية • استجمام وضيافة' : locale === 'en' ? 'Descriptive Sheet • Wellness & Hospitality' : 'Fiche descriptive • Détente & Hospitalité'}
            </p>
          </div>

          <div className="w-10 sm:w-12 shrink-0" />
        </div>

        {/* Main Responsive Split: Hero Photo + Golden Info Pills (Desktop 2-col, Mobile stacked) */}
        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Photo */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl overflow-hidden aspect-[16/10] shadow-lg relative bg-[#ede5d4] border-2 border-[#e5d5b5]">
              {hammam.images?.length > 0 ? (
                <img src={hammam.images[0]} alt={hammamName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#c59a3f]/50">
                  <Camera className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          {/* Info Pills Stack (matching reference right column) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="flex items-center bg-white rounded-2xl border border-[#e5d5b5] p-2.5 shadow-sm gap-3">
              <div className="w-10 h-10 rounded-full bg-[#b8892d] text-white flex items-center justify-center shrink-0">
                <Waves className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#8a735c] uppercase">{isRtl ? 'النوع' : 'Type'}</p>
                <p className="text-sm font-extrabold text-[#2b1808] truncate">{typeLabel}</p>
              </div>
            </div>

            <div className="flex items-center bg-white rounded-2xl border border-[#e5d5b5] p-2.5 shadow-sm gap-3">
              <div className="w-10 h-10 rounded-full bg-[#b8892d] text-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#8a735c] uppercase">{isRtl ? 'الولاية / الوجهة' : 'Wilaya'}</p>
                <p className="text-sm font-extrabold text-[#2b1808] truncate">{hammam.state || destName}</p>
              </div>
            </div>

            {(hammam.municipality || hammam.area) && (
              <div className="flex items-center bg-white rounded-2xl border border-[#e5d5b5] p-2.5 shadow-sm gap-3">
                <div className="w-10 h-10 rounded-full bg-[#b8892d] text-white flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#8a735c] uppercase">
                    {isRtl ? 'البلدية / المنطقة' : locale === 'en' ? 'Area' : 'Commune'}
                  </p>
                  <p className="text-sm font-extrabold text-[#2b1808] truncate">
                    {hammam.municipality || hammam.area}
                  </p>
                </div>
              </div>
            )}

            {safeMapsUrl && (
              <a
                href={safeMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center bg-white hover:bg-[#faf3e0] rounded-2xl border border-[#e5d5b5] p-2.5 shadow-sm gap-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#b8892d] text-white flex items-center justify-center shrink-0">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-[#8a735c] uppercase">Google Maps</p>
                  <p className="text-sm font-bold text-blue-600 underline truncate">{hammamName}</p>
                </div>
              </a>
            )}

            {finalDzd > 0 && (
              <div className="flex items-center bg-gradient-to-r from-[#f7ecd2] to-[#fdf6e3] rounded-2xl border-2 border-[#c59a3f] p-3 shadow-sm gap-3">
                <div className="w-11 h-11 rounded-full bg-[#b8892d] text-white flex items-center justify-center shrink-0">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#6e5224] flex items-center gap-2">
                    <span>{isRtl ? 'ابتداءً من' : locale === 'en' ? 'Starting from' : 'À partir de'}</span>
                    {hasDiscount && (
                      <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                        {isRtl ? 'تخفيض' : 'PROMO'}
                      </span>
                    )}
                  </p>
                  {hasDiscount && (
                    <p className="text-xs text-gray-500 line-through font-semibold" dir="ltr">
                      {formatConvertedPrice(basePrice, currency, dzdPerEur, locale, null)}
                    </p>
                  )}
                  <p className={`text-xl sm:text-2xl font-black ${hasDiscount ? 'text-emerald-700' : 'text-[#2b1808]'}`} dir="ltr">
                    {formatConvertedPrice(finalDzd, currency, dzdPerEur, locale, null)}
                  </p>
                  {hasDiscount && currency === 'DZD' && finalEur > 0 && (
                    <p className="text-xs font-bold text-gray-600" dir="ltr">
                      {baseEur > 0 && <span className="line-through opacity-75 mr-1.5">{baseEur} €</span>}
                      <span className="text-emerald-700 font-black">{finalEur} €</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3 Photo Sub-Gallery Cards (matching reference 1000048879.jpg) */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                img: hammam.roomImages?.[0] || hammam.images?.[1],
                label: isRtl ? 'الغرف والإقامة' : locale === 'en' ? 'Comfort Rooms' : 'CHAMBRES TOUT CONFORT',
              },
              {
                img: hammam.foodImages?.[0] || hammam.images?.[2],
                label: isRtl ? 'المطعم والخدمات' : locale === 'en' ? 'Restaurant & Lounge' : 'RESTAURANT & DÉTENTE',
              },
              {
                img: hammam.images?.[1] || hammam.images?.[0],
                label: isRtl ? 'المسابح والحمامات' : locale === 'en' ? 'Pools & Thermal Baths' : 'PISCINE & THERMES',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="rounded-2xl overflow-hidden border border-[#e5d5b5] bg-white shadow-sm"
              >
                <div className="aspect-[16/10] bg-[#ede5d4] overflow-hidden">
                  {card.img ? (
                    <img src={card.img} alt={card.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c59a3f]/40">
                      <Camera className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="bg-[#234328] text-white text-center py-2 px-3 text-xs font-extrabold tracking-wider uppercase">
                  {card.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggleable Golden NOS SERVICES & PRESTATIONS Icon Strip */}
        {enabledFeatures.length > 0 && (
          <div className="px-5 sm:px-8 py-6 border-y border-[#e5d5b5] bg-white/60">
            <div className="flex justify-center mb-6">
              <span className="inline-flex items-center gap-2 bg-[#234328] text-white px-6 py-2 rounded-full text-xs sm:text-sm font-black tracking-widest uppercase shadow">
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
                {isRtl ? 'خدماتنا ومرافقنا' : locale === 'en' ? 'OUR SERVICES & AMENITIES' : 'NOS SERVICES & PRESTATIONS'}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 justify-items-center">
              {enabledFeatures.map((feat) => (
                <div key={feat.id} className="flex flex-col items-center text-center gap-2">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#d4af37] via-[#b8892d] to-[#8f6619] text-white flex items-center justify-center shadow-md ring-4 ring-[#f5ecd4]">
                    <FeatureIcon name={feat.icon} className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-[#2b1808] leading-tight">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Details */}
        <div className="p-5 sm:p-8 space-y-8">
          {descriptionText && (
            <div className="bg-white p-6 rounded-2xl border border-[#e5d5b5] shadow-sm text-gray-700 leading-relaxed whitespace-pre-line">
              <h4 className="text-[#3a210c] font-bold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#c59a3f]" />{' '}
                {isRtl ? 'لمحة عن العرض' : locale === 'en' ? 'Overview' : "Aperçu de l'offre"}
              </h4>
              {descriptionText}
            </div>
          )}

          {/* Pricing Table with automatic DZD -> EUR calculation */}
          {roomList.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-[#3a210c] mb-4 text-center flex items-center justify-center gap-2">
                <span className="w-8 h-[1px] bg-[#c59a3f]" />
                {isRtl ? 'أسعار الخدمات والغرف' : locale === 'en' ? 'Rates & Services' : 'Tarifs et Prestations'}
                <span className="w-8 h-[1px] bg-[#c59a3f]" />
              </h3>
              <div className="bg-white rounded-2xl overflow-hidden border border-[#e5d5b5] shadow-md">
                <table className="w-full text-center text-sm sm:text-base">
                  <thead className="bg-[#f5ecd4] text-[#3a210c]">
                    <tr>
                      <th className="py-3.5 px-4 font-bold">{isRtl ? 'النوع' : locale === 'en' ? 'Service' : 'Prestation'}</th>
                      <th className="py-3.5 px-4 font-bold border-s border-[#e5d5b5]">
                        {isRtl ? 'السعر (دج)' : 'Prix (DZD)'}
                      </th>
                      <th className="py-3.5 px-4 font-bold border-s border-[#e5d5b5]">
                        {isRtl ? 'السعر (€)' : 'Prix (€)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 font-semibold">
                    {roomList.map((room: any, idx: number) => {
                      const dzdVal = Number(room.priceDzd || 0);
                      const eurVal = convertDzdToEur(dzdVal, dzdPerEur);
                      return (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-[#fdfaf2]">
                          <td className="py-3.5 px-4">
                            {locale === 'en'
                              ? room.typeEn || room.typeFr || room.typeAr
                              : locale === 'fr'
                                ? room.typeFr || room.typeAr
                                : room.typeAr || room.typeFr}
                          </td>
                          <td className="py-3.5 px-4 border-s border-[#e5d5b5]" dir="ltr">
                            {dzdVal > 0 ? `${dzdVal.toLocaleString('fr-DZ')} ${isRtl ? 'د.ج' : 'DA'}` : '-'}
                          </td>
                          <td className="py-3.5 px-4 border-s border-[#e5d5b5]" dir="ltr">
                            {eurVal > 0 ? `${eurVal.toLocaleString('fr-FR')} €` : '-'}
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
          {Array.isArray(hammam.program) && hammam.program.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-[#e5d5b5] shadow-sm">
              <h4 className="text-[#3a210c] font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#c59a3f]" /> {isRtl ? 'برنامج الرحلة' : locale === 'en' ? 'Program' : 'Programme'}
              </h4>
              <ul className="space-y-3">
                {hammam.program.map((p: any, idx: number) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-full bg-[#c59a3f] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="bg-[#fdfaf2] p-3 rounded-xl flex-1 border border-[#e5d5b5]/60 text-sm text-gray-700 font-medium">
                      {typeof p === 'string'
                        ? p
                        : locale === 'en'
                          ? p.en || p.fr || p.ar || ''
                          : locale === 'fr'
                            ? p.fr || p.ar || ''
                            : p.ar || p.fr || ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions */}
        <div className="fixed md:absolute bottom-0 left-0 w-full bg-white border-t border-[#e5d5b5] p-3.5 sm:p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.06)] z-50 md:rounded-b-[2rem]">
          <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
            <a
              href={buildWhatsAppUrl(whatsapp, waText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md text-sm md:text-base"
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
              className="flex-1 bg-[#b8892d] hover:bg-[#9e701c] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-md text-sm md:text-base"
            >
              <Calendar className="w-5 h-5" />
              {isRtl ? 'احجز الآن' : locale === 'en' ? 'Book Now' : 'Réserver Maintenant'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
