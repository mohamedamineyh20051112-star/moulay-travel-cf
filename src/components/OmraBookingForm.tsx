import { useState, useRef, useEffect } from "react";
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, MapPin, Calendar, Home, Tag, ChevronLeft, Heart, 
  Info, Coffee, Bus, Camera, CheckCircle, Phone, ArrowLeft, 
  Send, FileText, CreditCard, HeartPulse, Car, Users, BedDouble, Utensils, User, Mail,
  Sparkles, X
} from "lucide-react";

import { useCurrencyStore, formatConvertedPrice } from "@/store/useCurrencyStore";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContact, buildWhatsAppUrl } from "@/lib/useSiteContact";
import { useAutoTranslate } from "@/lib/translateClient";
import { sanitizeExternalUrl } from "@/lib/normalize";
import { resolveItemFeatures } from "@/data/serviceFeatures";
import FeatureIcon from "@/components/FeatureIcon";

function pickLocText(val: any, locale: string): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (locale === 'en') return val.en || val.fr || val.ar || '';
  if (locale === 'fr') return val.fr || val.ar || '';
  return val.ar || val.fr || '';
}

function OmraLocalized({ value, locale }: { value: any; locale: string }) {
  const arVal = typeof value === 'string' ? value : value?.ar || value?.fr || value?.en || '';
  const explicit =
    typeof value === 'string'
      ? value
      : locale === 'en'
        ? value?.en || value?.fr
        : locale === 'fr'
          ? value?.fr
          : value?.ar;
  const text = useAutoTranslate(arVal, locale, explicit);
  return <>{text}</>;
}

// --- Mock Data for Hotels ---
const HOTELS: any[] = [];

// --- Translations for the Form ---
const formTranslations = {
  fr: {
    personalInfo: "Informations Personnelles",
    name: "Nom et prénom",
    phone: "Téléphone / WhatsApp",
    city: "Ville / wilaya",
    travelersTitle: "Nombre de voyageurs",
    adult: "Adulte (+12 ans)",
    child: "Enfant (2-11 ans)",
    childBed: "Lit",
    baby: "Bébé (-2 ans)",
    withBed: "Avec lit",
    withoutBed: "Sans lit",
    roomType: "Type de chambre",
    select: "Sélectionnez...",
    roomOptions: ["Chambre collective", "Chambre quadruple", "Chambre triple", "Chambre double", "Chambre individuelle"],
    pensionType: "Type de pension",
    pensionOptions: ["Sans repas", "Petit-déjeuner", "Demi-pension", "Pension complète"],
    stayDetails: "Détails du Séjour",
    period: "Période souhaitée",
    duration: "Durée (jours)",
    transfer: "Type de transfert",
    transferOptions: ["Collectif", "Privé", "VIP", "Peu importe"],
    healthFinal: "Etat de santé et finalisation",
    healthStatus: "Etat de santé des voyageurs",
    healthOptions: [
      "Aucun problème de santé",
      "Maladie sans traitement particulier",
      "Maladie nécessitant un traitement spécifique",
      "Besoin d'une assistance spéciale",
      "Besoin d'un suivi ou rendez-vous médical"
    ],
    healthOther: "Autre situation de santé à signaler",
    dossier: "Joindre le dossier traduit en anglais (pdf)",
    passeport: "Passeport et documents des voyageurs",
    payment: "Mode de paiement souhaité pour confirmation",
    paymentOptions: ["Paiement en ligne", "Paiement au bureau", "Virement bancaire", "BaridiMob/ CCP", "Autre mode de paiement"],
    email: "E-mail",
    submit: "Envoyer ma demande",
    secure: "Vos données sont sécurisées.",
    successTitle: "Demande envoyée !",
    requestNumber: "Numéro de demande :",
    successMsg: "Notre équipe vérifiera la disponibilité et vous contactera sur WhatsApp.",
    newRequest: "Nouvelle demande",
    errorCon: "Erreur de connexion.",
    errorOccured: "Erreur lors de la réservation."
  },
  ar: {
    personalInfo: "المعلومات الشخصية",
    name: "الاسم واللقب",
    phone: "رقم الهاتف / واتساب",
    city: "المدينة / الولاية",
    travelersTitle: "عدد المسافرين",
    adult: "بالغ (+12 سنة)",
    child: "طفل (2-11 سنة)",
    childBed: "سرير",
    baby: "رضيع (أقل من سنتين)",
    withBed: "بسرير",
    withoutBed: "بدون سرير",
    roomType: "نوع الغرفة",
    select: "اختر...",
    roomOptions: ["غرفة جماعية", "غرفة رباعية", "غرفة ثلاثية", "غرفة مزدوجة", "غرفة فردية"],
    pensionType: "نوع الوجبات",
    pensionOptions: ["بدون وجبات", "إفطار", "نصف إقامة", "إقامة كاملة"],
    stayDetails: "تفاصيل الإقامة",
    period: "الفترة المطلوبة",
    duration: "المدة (أيام)",
    transfer: "نوع النقل",
    transferOptions: ["جماعي", "خاص", "VIP", "أي نوع"],
    healthFinal: "الحالة الصحية والدفع",
    healthStatus: "الحالة الصحية للمسافرين",
    healthOptions: [
      "لا توجد مشاكل صحية",
      "مرض بدون علاج خاص",
      "مرض يتطلب علاج خاص",
      "بحاجة لمساعدة خاصة",
      "بحاجة لمتابعة طبية"
    ],
    healthOther: "حالة صحية أخرى يرجى ذكرها",
    dossier: "إرفاق الملف مترجم للإنجليزية (pdf)",
    passeport: "جواز السفر ومستندات المسافرين",
    payment: "طريقة الدفع المفضلة",
    paymentOptions: ["دفع إلكتروني", "الدفع في المكتب", "تحويل بنكي", "بريدي موب / CCP", "طريقة أخرى"],
    email: "البريد الإلكتروني",
    submit: "إرسال الطلب",
    secure: "بياناتك محمية وآمنة.",
    successTitle: "تم إرسال الطلب بنجاح!",
    requestNumber: "رقم الطلب:",
    successMsg: "سيقوم فريقنا بالتحقق من التوفر والتواصل معك قريباً.",
    newRequest: "طلب جديد",
    errorCon: "خطأ في الاتصال.",
    errorOccured: "حدث خطأ أثناء الإرسال."
  },
  en: {
    personalInfo: "Personal Information",
    name: "Full Name",
    phone: "Phone / WhatsApp",
    city: "City / State",
    travelersTitle: "Number of travelers",
    adult: "Adult (+12 years)",
    child: "Child (2-11 years)",
    childBed: "Bed",
    baby: "Infant (-2 years)",
    withBed: "With bed",
    withoutBed: "Without bed",
    roomType: "Room Type",
    select: "Select...",
    roomOptions: ["Collective Room", "Quadruple Room", "Triple Room", "Double Room", "Single Room"],
    pensionType: "Board Type",
    pensionOptions: ["No meals", "Breakfast", "Half Board", "Full Board"],
    stayDetails: "Stay Details",
    period: "Preferred Period",
    duration: "Duration (days)",
    transfer: "Transfer Type",
    transferOptions: ["Shared", "Private", "VIP", "Any"],
    healthFinal: "Health & Payment",
    healthStatus: "Travelers Health Status",
    healthOptions: [
      "No health issues",
      "Illness without special treatment",
      "Illness requiring specific treatment",
      "Need special assistance",
      "Need medical follow-up"
    ],
    healthOther: "Other health condition to report",
    dossier: "Attach dossier translated to English (pdf)",
    passeport: "Passport and traveler documents",
    payment: "Preferred Payment Method",
    paymentOptions: ["Online Payment", "Office Payment", "Bank Transfer", "BaridiMob / CCP", "Other"],
    email: "Email Address",
    submit: "Submit Request",
    secure: "Your data is safe and secure.",
    successTitle: "Request Submitted!",
    requestNumber: "Request Number:",
    successMsg: "Our team will check availability and contact you shortly.",
    newRequest: "New Request",
    errorCon: "Connection Error.",
    errorOccured: "An error occurred while submitting."
  }
};

type ViewState = 'list' | 'details' | 'form' | 'success';

export default function OmraBookingForm({ locale }: { locale: string }) {
  const isRtl = locale === 'ar';
  const tForm = formTranslations[locale as keyof typeof formTranslations] || formTranslations.fr;
  
  const { currency, dzdPerEur } = useCurrencyStore();
  const { userData } = useAuth();
  const { whatsapp } = useSiteContact();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const getPrice = (dzd: string | number | undefined) => {
    return formatConvertedPrice(dzd, currency, dzdPerEur, locale, null);
  };

  const [view, setView] = useState<ViewState>('list');
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [dynamicHotels, setDynamicHotels] = useState<any[]>(HOTELS);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'omraHotels'));
        const fetched = querySnapshot.docs.map((doc): any => ({ id: doc.id, ...doc.data() }));
        if (fetched.length > 0) {
          const formatted = fetched.map(h => ({
            ...h,
            priceStartDzd: h.priceStartDzd?.toString(),
            roomPrices: Array.isArray(h.roomPrices) ? h.roomPrices.map((r: any) => ({
              ...r,
              priceDzd: r.priceDzd?.toString(),
            })) : []
          }));
          setDynamicHotels([...HOTELS, ...formatted]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHotels();
  }, []);
  
  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSelectHotel = (hotel: any) => {
    setSelectedHotel(hotel);
    setView('details');
    scrollToTop();
  };

  const handleBookClick = () => {
    setView('form');
    scrollToTop();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    
    const formData = new FormData(e.currentTarget);
    if (selectedHotel) {
      formData.append('hotel', pickLocText(selectedHotel.name, locale));
      formData.append('hotelCode', selectedHotel.code || '');
    }
    
    try {
      const response = await fetch('/api/booking-omra', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        try {
          const promoCode = formData.get('promo_code');
          await addDoc(collection(db, 'bookings'), {
            type: 'omra',
            requestId: result.requestId,
            promoCode: promoCode ? promoCode.toString().trim() : '',
            createdAt: new Date().toISOString(),
            status: 'pending'
          });
        } catch(e) { console.error('Firestore log error:', e) }
        setSuccessId(result.requestId);
        setView('success');
        scrollToTop();
      } else {
        setErrorMsg(result.error || tForm.errorOccured);
      }
    } catch (err) {
      setErrorMsg(tForm.errorCon);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------- VIEW: GRID LIST ----------------
  if (view === 'list') {
    return (
      <div ref={topRef} dir={isRtl ? 'rtl' : 'ltr'} className="max-w-6xl mx-auto my-8">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dynamicHotels.map((hotel) => (
            <motion.div 
              key={hotel.id}
              whileHover={{ y: -4 }}
              className="bg-[#fdfaf6] rounded-[2rem] border border-[#e5d5b5]/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group relative p-3 sm:p-4"
              onClick={() => handleSelectHotel(hotel)}
            >
              {/* Header: Star, Name, Code */}
              <div className="flex flex-col items-center text-center mb-3">
                <div className="flex items-center justify-center mb-1">
                  {[...Array(Math.max(0, parseInt(String(hotel.stars)) || 0))].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#c59a3f] text-[#c59a3f]" />
                  ))}
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#3a2818] mb-1 leading-tight">
                  <OmraLocalized value={hotel.name} locale={locale} />
                </h3>
                {hotel.code && (
                  <p className="text-sm font-semibold text-[#3a2818]/80">
                    {isRtl ? 'رمز العرض :' : locale === 'en' ? 'Offer Code:' : 'Code Offre :'} {hotel.code}
                  </p>
                )}
              </div>

              {/* Square 1:1 Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-4 border border-[#e5d5b5]/40 bg-[#f3ead8]">
                {hotel.image ? (
                  <img 
                    src={hotel.image} 
                    alt={pickLocText(hotel.name, locale) || 'Hotel'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#c59a3f]/40">
                    <Camera className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* Info Grid 1: Location & Distance */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-white rounded-[2rem] p-1.5 pr-3 flex items-center gap-2 border border-[#e5d5b5]">
                  <div className="w-10 h-10 rounded-full bg-[#c59a3f] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                      {isRtl ? 'المنطقة / الموقع:' : locale === 'en' ? 'Zone / Location:' : 'Zone / Emplacement :'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#3a2818] truncate">
                      <OmraLocalized value={hotel.region} locale={locale} />
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-[2rem] p-1.5 pr-3 flex items-center gap-2 border border-[#e5d5b5]">
                  <div className="w-10 h-10 rounded-full bg-[#c59a3f] flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                      {isRtl ? 'المسافة من الحرم:' : locale === 'en' ? 'Distance from Haram:' : 'Distance du Haram :'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#3a2818] truncate">
                      {hotel.distanceMakkah ? (locale !== 'ar' ? String(hotel.distanceMakkah).replace('متر', 'm') : hotel.distanceMakkah) : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Google Maps Link */}
              {sanitizeExternalUrl(hotel.googleMapsLink) && (
                <div className="mb-2">
                  <a 
                    href={sanitizeExternalUrl(hotel.googleMapsLink)!} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-white rounded-[2rem] p-1.5 pr-4 flex items-center gap-2 border border-[#e5d5b5] hover:border-[#c59a3f] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#c59a3f]" />
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="text-xs sm:text-sm font-bold text-[#3a2818] flex items-center gap-1">
                        Google Maps ↗
                      </span>
                      <span className="text-[10px] sm:text-xs text-blue-500 truncate w-full">
                        {sanitizeExternalUrl(hotel.googleMapsLink)}
                      </span>
                    </div>
                  </a>
                </div>
              )}

              {/* Info Grid 2: Transport & Makkah/Madinah */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                {/* Transport / Shuttle */}
                <div className="bg-white rounded-[2rem] p-1.5 pr-3 flex items-center gap-2 border border-[#e5d5b5]">
                  <div className="w-10 h-10 rounded-full bg-[#c59a3f] flex items-center justify-center shrink-0">
                    <Bus className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                      {isRtl ? 'النقل متوفر:' : locale === 'en' ? 'Transport:' : 'Transport disponible :'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#3a2818] truncate">
                      {(() => {
                        const ta = hotel.transportAvailable;
                        if (ta === true || ta === 'true') return true;
                        if (ta === false || ta === 'false') return false;
                        if (ta === null || ta === undefined) return Boolean(hotel.includes?.ar?.includes('النقل') || hotel.includes?.fr?.includes('Transport'));
                        return Boolean(ta);
                      })() 
                        ? (isRtl ? 'نعم' : locale === 'en' ? 'Yes' : 'Oui')
                        : (isRtl ? 'لا' : locale === 'en' ? 'No' : 'Non')}
                    </span>
                  </div>
                </div>

                {/* Shuttle Details */}
                <div className="bg-white rounded-[2rem] p-2 flex flex-col justify-center border border-[#e5d5b5] min-h-[52px]">
                  {hotel.shuttleAvailable ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[10px] sm:text-xs font-semibold text-[#3a2818] line-clamp-2 leading-tight">
                        {pickLocText(hotel.shuttleSchedule, locale) ? (
                          <OmraLocalized value={hotel.shuttleSchedule} locale={locale} />
                        ) : (
                          isRtl ? 'نقل ترددي للفندق' : locale === 'en' ? 'Hotel Shuttle' : 'Navette hôtel'
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-300 shrink-0" />
                      <span className="text-[10px] sm:text-xs text-gray-400">
                         {isRtl ? 'بدون نقل ترددي' : locale === 'en' ? 'No Shuttle' : 'Pas de navette'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Grid 3: Days & Madinah Hotel */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white rounded-[2rem] p-1.5 pr-3 flex items-center gap-2 border border-[#e5d5b5]">
                  <div className="w-10 h-10 rounded-full bg-[#c59a3f] flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                      {isRtl ? 'مكة / المدينة:' : locale === 'en' ? 'Makkah / Madinah:' : 'Mekka / Madina :'}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#3a2818] truncate">
                      {hotel.daysMakkah}/{hotel.daysMadinah}
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-1.5 pr-3 flex items-center gap-2 border border-[#e5d5b5]">
                  <div className="w-10 h-10 rounded-full bg-[#c59a3f] flex items-center justify-center shrink-0">
                    <BedDouble className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                      {isRtl ? 'فندق المدينة:' : locale === 'en' ? 'Madinah Hotel:' : 'Hôtel Madina :'}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#3a2818] line-clamp-2 leading-tight">
                      {pickLocText(hotel.madinahHotel, locale) ? (
                        <OmraLocalized value={hotel.madinahHotel} locale={locale} />
                      ) : (
                        isRtl ? 'غير محدد' : 'N/A'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Toggleable Omra Service Chips */}
              {(() => {
                const feats = resolveItemFeatures('omra', hotel, locale).slice(0, 3);
                if (feats.length === 0) return null;
                return (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {feats.map((feat) => (
                      <span
                        key={feat.id}
                        className="inline-flex items-center gap-1 bg-white border border-[#e5d5b5] text-[#5e4418] px-2.5 py-1 rounded-full text-[11px] font-bold"
                      >
                        <FeatureIcon name={feat.icon} className="w-3 h-3 text-[#c59a3f]" />
                        <span>{feat.label}</span>
                      </span>
                    ))}
                  </div>
                );
              })()}

              {/* Price Footer */}
              <div className="mt-auto bg-[#b38b36] rounded-[2rem] p-1.5 flex items-center justify-between text-white shadow-md hover:bg-[#a37d2f] transition-colors group-hover:scale-[1.02] transform origin-center duration-300">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-1">
                  <Tag className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center justify-center flex-1 gap-2 border-l border-r border-white/20 mx-2 px-2">
                  <span className="text-sm font-medium text-white/90">
                    {isRtl ? 'ابتداءً من :' : locale === 'en' ? 'Starting from :' : 'À partir de :'}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold" dir="ltr">
                    {getPrice(hotel.priceStartDzd)}
                  </span>
                </div>
                <div className="w-10 h-10 flex items-center justify-center shrink-0 mr-1">
                  <ChevronLeft className={`w-6 h-6 ${!isRtl ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }


  // ---------------- VIEW: DETAILS ----------------
  if (view === 'details' && selectedHotel) {
    const selectedName = pickLocText(selectedHotel.name, locale);
    const waText = isRtl 
      ? `السلام عليكم، أود الاستفسار عن ${selectedHotel.name?.ar || selectedName} (رمز: ${selectedHotel.code})...` 
      : locale === 'en'
        ? `Hello, I would like information about ${selectedName} (Code: ${selectedHotel.code})...`
        : `Bonjour, je voudrais me renseigner concernant ${selectedHotel.name?.fr || selectedName} (Code: ${selectedHotel.code})...`;
    const omraFeatures = resolveItemFeatures('omra', selectedHotel, locale);
    const isLiked = !!likedIds[selectedHotel.id];

    return (
      <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        ref={topRef} 
        dir={isRtl ? 'rtl' : 'ltr'} 
        className="max-w-4xl mx-auto my-8 bg-[#fdf8f0] rounded-[2rem] border border-gold/30 shadow-2xl overflow-hidden pb-24 relative"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 flex items-center justify-between gap-3 border-b border-gold/20 relative">
          <button onClick={() => setView('list')} className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition shrink-0">
            <ChevronLeft className={`w-6 h-6 text-primary ${isRtl ? 'rotate-180' : ''}`} />
          </button>
          <div className="text-center min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary truncate">
              <OmraLocalized value={selectedHotel.name} locale={locale} />
            </h2>
            <p className="text-gold font-medium flex items-center justify-center gap-2 mt-1 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              {isRtl ? 'تفاصيل العرض' : locale === 'en' ? 'Offer Details' : "Détails de l'offre"}
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setLikedIds((p) => ({ ...p, [selectedHotel.id]: !p[selectedHotel.id] }))}
            className={`p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition shrink-0 ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Square Hero Image & Banner */}
        <div className="px-6 pt-6">
          <div
            onClick={() => selectedHotel.image && setLightboxImg(selectedHotel.image)}
            className="max-w-md mx-auto w-full aspect-square rounded-3xl overflow-hidden shadow-lg relative border-2 border-gold/25 bg-[#f3ead8] cursor-pointer group"
          >
            {selectedHotel.image ? (
              <>
                <img src={selectedHotel.image} alt={selectedName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <span className="absolute bottom-3 right-3 bg-black/55 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-gold" />
                  {isRtl ? 'انقر للتكبير' : locale === 'en' ? 'Tap to zoom' : 'Agrandir'}
                </span>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#c59a3f]/40">
                <Camera className="w-14 h-14" />
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 mt-5 shadow-sm border border-gold/10 flex flex-wrap justify-center gap-6 md:gap-12 text-gray-700 font-semibold">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" />
              {isRtl ? 'يبعد عن الحرم المكي :' : locale === 'en' ? 'Distance from Haram:' : 'Distance du Haram :'} {selectedHotel.distanceMakkah}
            </div>
            <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" />
              {isRtl ? 'المنطقة :' : locale === 'en' ? 'Region:' : 'Région :'} <OmraLocalized value={selectedHotel.region} locale={locale} />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Square Sub-Gallery Cards */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            <div className="flex flex-col items-center gap-2.5">
              <h4 className="text-gold font-bold text-center text-xs sm:text-sm flex items-center gap-1">
                <Camera className="w-4 h-4"/> {isRtl ? 'صور الغرف' : locale === 'en' ? 'Rooms' : 'Chambres'}
              </h4>
              <div
                onClick={() => selectedHotel.images?.rooms && setLightboxImg(selectedHotel.images.rooms)}
                className="w-full aspect-square rounded-2xl bg-gray-100 shadow-inner overflow-hidden border border-gold/20 cursor-pointer group"
              >
                 {selectedHotel.images?.rooms ? (
                    <img src={selectedHotel.images.rooms} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Camera className="w-6 h-6 opacity-30" /></div>
                 )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2.5">
              <h4 className="text-gold font-bold text-center text-xs sm:text-sm flex items-center gap-1">
                <Utensils className="w-4 h-4"/> {isRtl ? 'المطعم' : 'Restaurant'}
              </h4>
              <div
                onClick={() => selectedHotel.images?.restaurant && setLightboxImg(selectedHotel.images.restaurant)}
                className="w-full aspect-square rounded-2xl bg-gray-100 shadow-inner overflow-hidden border border-gold/20 cursor-pointer group"
              >
                 {selectedHotel.images?.restaurant ? (
                    <img src={selectedHotel.images.restaurant} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Utensils className="w-6 h-6 opacity-30" /></div>
                 )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2.5">
              <h4 className="text-gold font-bold text-center text-xs sm:text-sm flex items-center gap-1">
                <Info className="w-4 h-4"/> {isRtl ? 'الخدمات' : 'Services'}
              </h4>
              <div
                onClick={() => selectedHotel.images?.services && setLightboxImg(selectedHotel.images.services)}
                className="w-full aspect-square rounded-2xl bg-gray-100 shadow-inner overflow-hidden border border-gold/20 cursor-pointer group"
              >
                 {selectedHotel.images?.services ? (
                    <img src={selectedHotel.images.services} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Info className="w-6 h-6 opacity-30" /></div>
                 )}
              </div>
            </div>
          </div>

          {/* Toggleable Omra Services Strip */}
          {omraFeatures.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-gold/20 shadow-sm">
              <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold" />
                {isRtl ? 'الخدمات والمزايا المشمولة' : locale === 'en' ? 'Included Amenities & Services' : 'Services & Prestations Inclus'}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {omraFeatures.map((feat) => (
                  <div key={feat.id} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#fdfaf4] border border-gold/15 text-gray-800 text-xs sm:text-sm font-bold">
                    <div className="w-7 h-7 rounded-lg bg-gold/15 text-gold flex items-center justify-center shrink-0">
                      <FeatureIcon name={feat.icon} className="w-4 h-4" />
                    </div>
                    <span>{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Table (Auto-calculated EUR from DZD) */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4 text-center flex items-center justify-center gap-2">
              <span className="w-8 h-[1px] bg-gold"></span>
              {isRtl ? 'أسعار الغرف' : locale === 'en' ? 'Room Prices' : 'Prix des Chambres'}
              <span className="w-8 h-[1px] bg-gold"></span>
            </h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-md">
              <table className="w-full text-center">
                <thead className="bg-gold/10 text-primary">
                  <tr>
                    <th className="py-4 px-6 border-b border-gold/20 font-bold w-1/2">
                      {isRtl ? 'نوع الغرفة' : locale === 'en' ? 'Room Type' : 'Type de Chambre'}
                    </th>
                    <th className="py-4 px-6 border-b border-gold/20 font-bold border-s border-gold/20">
                      {isRtl ? 'السعر للشخص' : locale === 'en' ? 'Price / Person' : 'Prix par Personne'}
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 font-medium">
                  {(selectedHotel.roomPrices || []).map((room: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                      <td className="py-4 px-6"><OmraLocalized value={room.type} locale={locale} /></td>
                      <td className="py-4 px-6 border-s border-gold/20 bg-[#fdfdfd]" dir="ltr">{getPrice(room.priceDzd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transport */}
            <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm">
              <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                <Bus className="w-5 h-5 text-gold" /> {isRtl ? 'خدمة النقل' : 'Transport'}
              </h4>
              {(() => {
                 const ta = selectedHotel.transportAvailable;
                 let isAvailable = true;
                 if (ta === true || ta === 'true') isAvailable = true;
                 else if (ta === false || ta === 'false') isAvailable = false;
                 else if (selectedHotel.includes?.ar?.includes('النقل') || selectedHotel.includes?.fr?.includes('Transport')) isAvailable = true;
                 else isAvailable = Boolean(ta);
                 
                 return isAvailable ? (
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle className="w-5 h-5"/></div>
                      <div>
                        <p className="font-bold text-gray-800">{isRtl ? 'موجودة' : 'Inclus'}</p>
                        <p className="text-sm text-gray-500 mt-1">{isRtl ? 'نقل من وإلى المطار والفندق' : 'Transfert aéroport-hôtel-aéroport'}</p>
                      </div>
                    </div>
                 ) : (
                    <div className="flex items-start gap-4">
                      <div className="bg-gray-100 p-2 rounded-full text-gray-500"><Bus className="w-5 h-5 opacity-50"/></div>
                      <div>
                        <p className="font-bold text-gray-600">{isRtl ? 'غير متوفر' : 'Non disponible'}</p>
                        <p className="text-sm text-gray-500 mt-1">{isRtl ? 'هذا العرض لا يشمل النقل' : 'Ce forfait n\'inclut pas le transport'}</p>
                      </div>
                    </div>
                 );
              })()}
            </div>

            {/* Food */}
            <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm">
              <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-gold" /> {isRtl ? 'الإطعام' : 'Restauration'}
              </h4>
              {selectedHotel.food ? (
                <div className="flex items-start gap-4">
                  <div className="bg-gold/10 p-2 rounded-full text-gold"><Coffee className="w-5 h-5"/></div>
                  <div>
                    <p className="font-bold text-gray-800"><OmraLocalized value={selectedHotel.food.type} locale={locale} /></p>
                    <p className="text-sm text-gray-500 mt-1">{selectedHotel.food.price} {selectedHotel.food.price !== 'Inclus' && !String(selectedHotel.food.price).includes('مشمول') && (isRtl ? 'دج/يوم' : 'DA/jour')}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">{isRtl ? 'غير متوفر' : locale === 'en' ? 'Not available' : 'Non disponible'}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ziyarat */}
            <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm">
              <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" /> {isRtl ? 'المزارات' : locale === 'en' ? 'Visits (Ziyarat)' : 'Visites (Ziyarat)'}
              </h4>
              <ul className="space-y-3">
                {(Array.isArray(selectedHotel.ziyarat) && selectedHotel.ziyarat.length > 0) ? selectedHotel.ziyarat.map((z: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-gold"></span> <OmraLocalized value={z} locale={locale} />
                  </li>
                )) : <p className="text-gray-500">{isRtl ? 'غير محدد' : locale === 'en' ? 'Not specified' : 'Non spécifié'}</p>}
              </ul>
            </div>

            {/* Program */}
            <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm">
              <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" /> {isRtl ? 'برنامج الرحلة' : locale === 'en' ? 'Trip Program' : 'Programme du Voyage'}
              </h4>
              <ul className="space-y-3">
                {(Array.isArray(selectedHotel.program) && selectedHotel.program.length > 0) ? selectedHotel.program.map((p: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-gold"></span> <OmraLocalized value={p} locale={locale} />
                  </li>
                )) : <p className="text-gray-500">{isRtl ? 'غير محدد' : locale === 'en' ? 'Not specified' : 'Non spécifié'}</p>}
              </ul>
            </div>
          </div>
          
          {/* Trip Schedule */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4 text-center flex items-center justify-center gap-2">
              <span className="w-8 h-[1px] bg-gold"></span>
              {isRtl ? 'جدول تواريخ الرحلة' : locale === 'en' ? 'Trip Schedule' : 'Calendrier du Voyage'}
              <span className="w-8 h-[1px] bg-gold"></span>
            </h3>
            <div className="bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-center min-w-[800px]">
                  <thead className="bg-gold/10 text-primary whitespace-nowrap">
                    <tr>
                      <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'الإقلاع' : locale === 'en' ? 'Departure' : 'Départ'}</th>
                      <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'تاريخ الذهاب' : locale === 'en' ? 'Outbound' : 'Date Aller'}</th>
                      <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'نوع الرحلة' : locale === 'en' ? 'Flight Type' : 'Type Vol'}</th>
                      <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'مدة الرحلة' : locale === 'en' ? 'Duration' : 'Durée'}</th>
                      <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'الدخول' : locale === 'en' ? 'Entry' : 'Entrée'}</th>
                      <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'نوع الخطوط' : locale === 'en' ? 'Airline' : 'Compagnie'}</th>
                      <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'الخروج' : locale === 'en' ? 'Exit' : 'Sortie'}</th>
                      <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'تاريخ الرجوع' : locale === 'en' ? 'Return' : 'Date Retour'}</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 font-medium whitespace-nowrap">
                    {(Array.isArray(selectedHotel.schedule) ? selectedHotel.schedule : []).map((sch: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                        <td className="py-4 px-4"><OmraLocalized value={sch.departLoc} locale={locale} /></td>
                        <td className="py-4 px-4" dir="ltr">{sch.departDate}</td>
                        <td className="py-4 px-4"><OmraLocalized value={sch.flightType} locale={locale} /></td>
                        <td className="py-4 px-4"><OmraLocalized value={sch.duration} locale={locale} /></td>
                        <td className="py-4 px-4"><OmraLocalized value={sch.entry} locale={locale} /></td>
                        <td className="py-4 px-4"><OmraLocalized value={sch.airline} locale={locale} /></td>
                        <td className="py-4 px-4"><OmraLocalized value={sch.exit} locale={locale} /></td>
                        <td className="py-4 px-4" dir="ltr">{sch.returnDate}</td>
                      </tr>
                    ))}
                    {(!selectedHotel.schedule || selectedHotel.schedule.length === 0) && (
                      <tr>
                        <td colSpan={8} className="py-6 text-gray-500">
                          {isRtl ? 'لا توجد رحلات مجدولة حالياً' : locale === 'en' ? 'No scheduled flights yet' : 'Aucun vol programmé actuellement'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="fixed md:absolute bottom-0 left-0 w-full bg-white border-t border-gold/30 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 rounded-b-[2rem]">
          <div className="max-w-4xl mx-auto flex gap-4">
            <a 
              href={buildWhatsAppUrl(whatsapp, waText)}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg text-sm md:text-lg"
            >
              <Phone className="w-5 h-5" />
              {isRtl ? 'استفسار عبر WhatsApp' : locale === 'en' ? 'Contact WhatsApp' : 'Contact via WhatsApp'}
            </a>
            <button 
              onClick={handleBookClick}
              className="flex-1 bg-gold hover:bg-yellow-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg text-sm md:text-lg"
            >
              <Calendar className="w-5 h-5" />
              {isRtl ? 'احجز الآن' : locale === 'en' ? 'Book Now' : 'Réserver Maintenant'}
            </button>
          </div>
        </div>
      </motion.div>

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
              alt={selectedName}
              onClick={(e) => e.stopPropagation()}
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
      </>
    );
  }

  // ---------------- VIEW: FORM ----------------
  if (view === 'form') {
    return (
      <div ref={topRef} dir={isRtl ? 'rtl' : 'ltr'} className="bg-white p-6 md:p-12 rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto my-8 relative">
        <button onClick={() => setView('details')} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-primary transition font-bold">
          <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
          {isRtl ? 'العودة لتفاصيل الفندق' : locale === 'en' ? 'Back to details' : 'Retour aux détails'}
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-4">
            {isRtl ? 'طلب حجز عمرة' : locale === 'en' ? 'Umrah Booking Request' : 'Demande de réservation Omra'}
          </h2>
          <div className="w-16 h-1 bg-gold rounded-full mx-auto mb-4"></div>
          {selectedHotel && (
            <div className="inline-block bg-gold/10 text-primary px-4 py-2 rounded-lg font-bold border border-gold/30">
              <OmraLocalized value={selectedHotel.name} locale={locale} />
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations Personnelles */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-800 border-b pb-2 border-gold/30">{tForm.personalInfo}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2"><User className="h-5 w-5 text-gray-400" /> {tForm.name} <span className="text-red-500">*</span></label>
                <input type="text" name="nom" defaultValue={userData?.name || ""} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-gray-50" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2"><Phone className="h-5 w-5 text-gray-400" /> {tForm.phone} <span className="text-red-500">*</span></label>
                <input type="tel" name="telephone" defaultValue={userData?.phone || ""} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-gray-50" dir="ltr" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2"><MapPin className="h-5 w-5 text-gray-400" /> {tForm.city} <span className="text-red-500">*</span></label>
                <input type="text" name="ville" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Nombre de voyageurs */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-800 border-b pb-2 border-gold/30">{tForm.travelersTitle}</h4>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{tForm.adult} <span className="text-red-500">*</span></label>
                  <input type="number" name="adultes" min="1" defaultValue="1" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none text-center" />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{tForm.child}</label>
                  <input type="number" name="enfants" min="0" defaultValue="0" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none text-center" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{tForm.childBed}</label>
                  <select name="lit_enfant" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none text-center bg-white">
                    <option value="Non">{tForm.withoutBed}</option>
                    <option value="Oui">{tForm.withBed}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{tForm.baby}</label>
                  <input type="number" name="bebes" min="0" defaultValue="0" className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none text-center" />
                </div>
              </div>
            </div>
          </div>

          {/* Détails du Séjour */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-800 border-b pb-2 border-gold/30">{tForm.stayDetails}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2"><BedDouble className="h-5 w-5 text-gray-400" /> {tForm.roomType} <span className="text-red-500">*</span></label>
                <select name="type_chambre" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-white">
                  <option value="">{tForm.select}</option>
                  {tForm.roomOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2"><Calendar className="h-5 w-5 text-gray-400" /> {tForm.period} <span className="text-red-500">*</span></label>
                <input type="text" name="periode" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-white" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2"><Calendar className="h-5 w-5 text-gray-400" /> {tForm.duration} <span className="text-red-500">*</span></label>
                <input type="number" name="duree" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-white" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2"><Utensils className="h-5 w-5 text-gray-400" /> {tForm.pensionType} <span className="text-red-500">*</span></label>
                <select name="type_pension" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-white">
                  <option value="">{tForm.select}</option>
                  {tForm.pensionOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2"><Car className="h-5 w-5 text-gray-400" /> {tForm.transfer} <span className="text-red-500">*</span></label>
                <select name="transfert" required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-white">
                  <option value="">{tForm.select}</option>
                  {tForm.transferOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Etat de Santé et Finalisation */}
          <div className="space-y-6">
            <h4 className="text-xl font-bold text-gray-800 border-b pb-2 border-gold/30">{tForm.healthFinal}</h4>
            
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <label className="block font-semibold text-gray-700 mb-3 flex items-center gap-2"><HeartPulse className="h-5 w-5 text-red-400" /> {tForm.healthStatus}</label>
              <div className="space-y-3">
                {tForm.healthOptions.map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg border border-gray-200 hover:border-gold/50 transition shadow-sm">
                    <input type="radio" name="sante" value={opt} defaultChecked={i === 0} className="w-5 h-5 text-gold focus:ring-gold border-gray-300" />
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <input type="text" name="sante_autre" placeholder={tForm.healthOther} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-white" />
              </div>
            </div>



            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <label className="block font-semibold text-gray-700 mb-3 flex items-center gap-2"><CreditCard className="h-5 w-5 text-blue-500" /> {tForm.payment} <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tForm.paymentOptions.map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-lg border border-gray-200 hover:border-gold/50 transition shadow-sm">
                    <input type="radio" name="paiement" value={opt} defaultChecked={i === 0} className="w-5 h-5 text-gold focus:ring-gold border-gray-300" />
                    <span className="text-gray-700 text-sm font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2"><Mail className="h-5 w-5 text-gray-400" /> {tForm.email}</label>
                <input type="email" name="email" defaultValue={userData?.email || ""} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-gray-50" dir="ltr" />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-gold" />{' '}
                  {isRtl ? 'كود الخصم (اختياري)' : locale === 'en' ? 'Promo Code (Optional)' : 'Code Promo (Optionnel)'}
                </label>
                <input
                  type="text"
                  name="promo_code"
                  placeholder={isRtl ? 'رمز المسوق الخاص بك' : 'CODE PROMO'}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:outline-none bg-gray-50 uppercase"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isRtl
                    ? 'أدخل كود المسوق للحصول على تخفيض'
                    : locale === 'en'
                      ? 'Enter a partner code for a discount'
                      : 'Entrez un code promo pour bénéficier d’une réduction'}
                </p>
              </div>
            </div>
            
          </div>

          {/* Bouton de soumission */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
            <button type="submit" disabled={isSubmitting} className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-gold hover:shadow-xl transform hover:-translate-y-1"}`}>
              {isSubmitting ? (
                <><div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent"></div> {isRtl ? 'جاري الإرسال...' : 'Envoi en cours...'}</>
              ) : (
                <><Send size={20} className={isRtl ? 'transform rotate-180' : ''} /> {tForm.submit}</>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------------- VIEW: SUCCESS ----------------
  if (view === 'success') {
    return (
      <div ref={topRef} dir={isRtl ? 'rtl' : 'ltr'} className="bg-white p-6 md:p-12 rounded-2xl shadow-xl border border-gray-100 max-w-3xl mx-auto my-8 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-primary mb-4">{tForm.successTitle}</h2>
          <p className="text-gray-600 mb-6 text-lg leading-relaxed">
            {tForm.requestNumber} <strong className="text-gold text-xl bg-gold/10 px-2 py-1 rounded">{successId}</strong>
            <br /><br />
            {tForm.successMsg}
          </p>
          <button onClick={() => { setSuccessId(null); setView('list'); setSelectedHotel(null); }} className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-gold transition shadow-md">
            {tForm.newRequest}
          </button>
        </motion.div>
      </div>
    );
  }

  return null;
}




