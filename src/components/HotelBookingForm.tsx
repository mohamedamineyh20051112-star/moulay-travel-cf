"use client";

import { useState, useRef, useEffect } from "react";
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building, MapPin, Calendar, Home, Tag, ChevronLeft, Heart, 
  Info, Coffee, CheckCircle, Phone, ArrowLeft, Send, Users, BedDouble, User, Mail 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { buildWhatsAppUrl, useSiteContact } from "@/lib/useSiteContact";

const formTranslations = {
  fr: {
    personalInfo: "Informations Personnelles",
    name: "Nom et prénom",
    phone: "Téléphone / WhatsApp",
    email: "E-mail",
    ville: "Ville / wilaya",
    nationalite: "Nationalité",
    destinationTitle: "Destination et séjour",
    destination: "Destination souhaitée",
    hotelSouhaite: "Hôtel souhaité",
    dateArrivee: "Date d'arrivée",
    dateDepart: "Date de départ",
    duration: "Durée du séjour",
    flexibleDates: "Dates flexibles",
    travelersTitle: "Nombre de voyageurs",
    numTravelers: "Nombre de voyageurs",
    adult: "Adulte",
    child: "Enfant (2-11 ans)",
    baby: "Bébé (-2 ans)",
    roomDetails: "Détails des chambres",
    roomType: "Type de chambre",
    roomOptions: ["Chambre Single", "Chambre Double", "Chambre Triple", "Chambre Quadruple", "Chambre Familiale", "Chambre Collective", "Suite"],
    hotelType: "Type d'établissement",
    hotelOptions: ["Hôtel", "Complexe touristique", "Appartement", "Villa"],
    category: "Catégorie souhaitée",
    categoryOptions: ["Économique", "Standard", "Luxe"],
    pensionType: "Type de pension",
    pensionOptions: ["Sans repas", "Petit-déjeuner", "Demi-pension", "Pension complète", "All inclusive"],
    preferencesTitle: "Préférences et Autres",
    preferences: ["Lit double", "Lits séparés", "Chambre communicante", "Vue mer", "Vue ville", "Étage élevé", "Accessible", "Transfert aéroport"],
    other: "Autre",
    promoLabel: "Code Promo (Optionnel)",
    promoPlaceholder: "Votre code promo",
    promoDesc: "Votre réservation sera liée au marketeur",
    submit: "Envoyer ma demande",
    secure: "Vos données sont sécurisées.",
    successTitle: "Demande envoyée !",
    requestNumber: "Numéro de demande :",
    successMsg: "Notre équipe vérifiera la disponibilité et vous contactera sur WhatsApp ou e-mail afin de confirmer et finaliser votre réservation.",
    newRequest: "Nouvelle demande",
    errorCon: "Erreur de connexion.",
    errorOccured: "Erreur lors de la réservation."
  },
    ar: {
    personalInfo: "المعلومات الشخصية",
    name: "الاسم واللقب",
    phone: "رقم الهاتف / واتساب",
    email: "البريد الإلكتروني",
    ville: "المدينة / الولاية",
    nationalite: "الجنسية",
    destinationTitle: "الوجهة والإقامة",
    destination: "الوجهة المطلوبة",
    hotelSouhaite: "الفندق المطلوب",
    dateArrivee: "تاريخ الوصول",
    dateDepart: "تاريخ المغادرة",
    duration: "مدة الإقامة",
    flexibleDates: "تواريخ مرنة (أيام)",
    travelersTitle: "عدد المسافرين",
    numTravelers: "عدد المسافرين",
    adult: "بالغ",
    child: "طفل (2-11 سنة)",
    baby: "رضيع (أقل من سنتين)",
    roomDetails: "تفاصيل الغرف",
    roomType: "نوع الغرفة",
    roomOptions: ["غرفة فردية", "غرفة مزدوجة", "غرفة ثلاثية", "غرفة رباعية", "غرفة عائلية", "غرفة جماعية", "جناح"],
    hotelType: "نوع الإقامة",
    hotelOptions: ["فندق", "منتجع سياحي", "شقة", "فيلا"],
    category: "الفئة المطلوبة",
    categoryOptions: ["اقتصادية", "عادية", "فاخرة"],
    pensionType: "نوع الوجبات",
    pensionOptions: ["بدون وجبات", "إفطار", "نصف إقامة", "إقامة كاملة", "شامل كلياً"],
    preferencesTitle: "تفضيلات أخرى",
    preferences: ["سرير مزدوج", "أسرة منفصلة", "غرف متصلة", "إطلالة على البحر", "إطلالة على المدينة", "طابق علوي", "مجهزة لذوي الاحتياجات الخاصة", "نقل من المطار"],
    other: "أخرى",
    promoLabel: "رمز المسوق (اختياري)",
    promoPlaceholder: "رمز المسوق الخاص بك",
    promoDesc: "سيتم ربط حجزك بالمسوق الذي وجهك",
    submit: "إرسال الطلب",
    secure: "بياناتك محمية وآمنة.",
    successTitle: "تم إرسال الطلب بنجاح!",
    requestNumber: "رقم الطلب:",
    successMsg: "سيقوم فريقنا بالتحقق من التوفر والتواصل معك قريباً لتأكيد الحجز.",
    newRequest: "طلب جديد",
    errorCon: "خطأ في الاتصال.",
    errorOccured: "حدث خطأ أثناء الإرسال."
  },
  en: {
    personalInfo: "Personal Information",
    name: "Full Name",
    phone: "Phone / WhatsApp",
    email: "Email Address",
    ville: "City / State",
    nationalite: "Nationality",
    destinationTitle: "Destination and Stay",
    destination: "Desired Destination",
    hotelSouhaite: "Desired Hotel",
    dateArrivee: "Arrival Date",
    dateDepart: "Departure Date",
    duration: "Duration of stay",
    flexibleDates: "Flexible dates",
    travelersTitle: "Number of Travelers",
    numTravelers: "Number of travelers",
    adult: "Adult",
    child: "Child (2-11 yrs)",
    baby: "Infant (-2 yrs)",
    roomDetails: "Room Details",
    roomType: "Room Type",
    roomOptions: ["Single Room", "Double Room", "Triple Room", "Quadruple Room", "Family Room", "Collective Room", "Suite"],
    hotelType: "Establishment Type",
    hotelOptions: ["Hotel", "Tourist Resort", "Apartment", "Villa"],
    category: "Desired Category",
    categoryOptions: ["Economy", "Standard", "Luxury"],
    pensionType: "Board Type",
    pensionOptions: ["No meals", "Breakfast", "Half Board", "Full Board", "All inclusive"],
    preferencesTitle: "Preferences and Others",
    preferences: ["Double bed", "Twin beds", "Connecting room", "Sea view", "City view", "High floor", "Accessible", "Airport transfer"],
    other: "Other",
    promoLabel: "Promo Code (Optional)",
    promoPlaceholder: "Your promo code",
    promoDesc: "Your booking will be linked to the marketer",
    submit: "Submit Request",
    secure: "Your data is safe and secure.",
    successTitle: "Request Submitted!",
    requestNumber: "Request Number:",
    successMsg: "Our team will check availability and contact you via WhatsApp or email to confirm and finalize your booking.",
    newRequest: "New Request",
    errorCon: "Connection Error.",
    errorOccured: "An error occurred while submitting."
  }
};

export default function HotelBookingForm({ locale }: { locale: string }) {
  const { userData } = useAuth();
  const siteContact = useSiteContact();
  const t = formTranslations[locale as keyof typeof formTranslations] || formTranslations.ar;
  const isRtl = locale === "ar";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [requestId, setRequestId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  useEffect(() => {
    if (submitStatus === "success" || showForm) {
      scrollToTop();
    }
  }, [submitStatus, showForm]);

  const [formData, setFormData] = useState({
    nom: "", telephone: "", email: "", ville: "", nationalite: "",
    destination: "", hotelSouhaite: "", dateArrivee: "", dateDepart: "",
    duree: "", datesFlexibles: "",
    adultes: 1, enfants: 0, bebes: 0,
    typeChambre: "", typeEtablissement: "", categorie: "", typePension: "",
    autre: "", preferences: [] as string[], promo_code: ""
  });

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        nom: userData.name || prev.nom,
        telephone: userData.phone || prev.telephone,
        email: userData.email || prev.email,
      }));
    }
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferenceToggle = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter(p => p !== pref)
        : [...prev.preferences, pref]
    }));
  };

  const handleTravelerChange = (type: "adultes" | "enfants" | "bebes", delta: number) => {
    setFormData(prev => {
      const newValue = prev[type] + delta;
      if (newValue < 0) return prev;
      if (type === "adultes" && newValue < 1) return prev;
      return { ...prev, [type]: newValue };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "preferences") {
          fd.append(key, (value as string[]).join(", "));
        } else {
          fd.append(key, value.toString());
        }
      });

      const response = await fetch("/api/booking-hotels", {
        method: "POST",
        body: fd
      });

      const result = await response.json();

      if (result.success) {
        try {
          await addDoc(collection(db, "bookings"), {
            type: "hotel",
            requestId: result.requestId,
            promoCode: formData.promo_code ? formData.promo_code.toString().trim() : "",
            createdAt: new Date().toISOString(),
            status: "pending"
          });
        } catch(e) { console.error("Firestore log error:", e) }
        setRequestId(result.requestId);
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const TravelerCounter = ({ label, value, type }: { label: string, value: number, type: "adultes" | "enfants" | "bebes" }) => (
    <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
      <span className="font-semibold text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button 
          type="button" 
          onClick={() => handleTravelerChange(type, -1)}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gold hover:text-white transition-colors"
        >-</button>
        <span className="w-6 text-center font-bold">{value}</span>
        <button 
          type="button" 
          onClick={() => handleTravelerChange(type, 1)}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gold hover:text-white transition-colors"
        >+</button>
      </div>
    </div>
  );

  if (!showForm && submitStatus !== "success") {
    return (
      <div ref={topRef} dir={isRtl ? "rtl" : "ltr"} className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto my-8 text-center">
        <Building size={64} className="text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-primary mb-4">
          {isRtl ? "طلب حجز فندق" : locale === "en" ? "HOTEL QUOTE REQUEST" : "DEMANDE DE DEVIS HÔTEL"}
        </h2>
        <div className="w-16 h-1 bg-gold rounded-full mx-auto mb-6"></div>
        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
          {isRtl
            ? "يرجى ملء هذه الاستمارة لكي يتمكن فريقنا من البحث عن أفضل الخيارات لك. سنرد عليك بأسرع وقت عبر الواتساب."
            : locale === "en"
            ? "Please fill out this form so our team can find the best options for you. We will reply quickly via WhatsApp."
            : "Merci de remplir ce formulaire pour que notre équipe recherche les meilleures options. On vous répondra rapidement via WhatsApp."
          }
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white hover:bg-gold py-4 px-8 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 text-lg"
          >
            <Send size={20} className={isRtl ? "transform rotate-180" : ""} />
            {isRtl ? "طلب تسعيرة / حجز" : locale === "en" ? "Request Booking / Quote" : "Demander une réservation"}
          </button>
          <a
            href={buildWhatsAppUrl(
              siteContact.whatsapp,
              isRtl
                ? "مرحباً، أود الاستفسار حول حجز فندق..."
                : locale === "en"
                  ? "Hello, I would like to inquire about hotel booking..."
                  : "Bonjour, je voudrais me renseigner concernant la réservation d'hôtel..."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white hover:bg-green-600 py-4 px-8 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2 text-lg"
          >
            <Phone size={20} />
            {isRtl ? "تواصل معنا (واتساب)" : locale === "en" ? "Contact Us (WhatsApp)" : "Contactez-nous (WhatsApp)"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className={`w-full max-w-2xl mx-auto my-8 ${isRtl ? "text-right" : "text-left"}`} dir={isRtl ? "rtl" : "ltr"}>
      {submitStatus === "idle" && (
        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {isRtl ? "استمارة حجز فندق" : locale === "en" ? "Hotel Booking" : "Réservation d\'Hôtel"}
            </h1>
            <p className="text-gray-500">{t.secure}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                <User className="text-gold w-6 h-6" /> {t.personalInfo}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.name} *</label>
                  <input required type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.phone} *</label>
                  <input required type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" dir="ltr" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.email}</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.ville}</label>
                  <input type="text" name="ville" value={formData.ville} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.nationalite}</label>
                  <input type="text" name="nationalite" value={formData.nationalite} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
                </div>
              </div>
            </div>

            {/* 2. Destination */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6 mt-8">
                <MapPin className="text-gold w-6 h-6" /> {t.destinationTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.destination} *</label>
                  <input required type="text" name="destination" value={formData.destination} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.hotelSouhaite}</label>
                  <input type="text" name="hotelSouhaite" value={formData.hotelSouhaite} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.dateArrivee}</label>
                  <input type="date" name="dateArrivee" value={formData.dateArrivee} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.dateDepart}</label>
                  <input type="date" name="dateDepart" value={formData.dateDepart} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.duration}</label>
                  <input type="text" name="duree" value={formData.duree} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.flexibleDates}</label>
                  <input type="text" name="datesFlexibles" value={formData.datesFlexibles} onChange={handleChange} placeholder="+3 jours" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
                </div>
              </div>
            </div>

            {/* 3. Travelers & Rooms */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6 mt-8">
                <Users className="text-gold w-6 h-6" /> {t.travelersTitle}
              </h2>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <TravelerCounter label={t.adult} value={formData.adultes} type="adultes" />
                <TravelerCounter label={t.child} value={formData.enfants} type="enfants" />
                <TravelerCounter label={t.baby} value={formData.bebes} type="bebes" />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6 mt-8">
                <BedDouble className="text-gold w-6 h-6" /> {t.roomDetails}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.roomType}</label>
                  <select name="typeChambre" value={formData.typeChambre} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none appearance-none">
                    <option value="">--</option>
                    {t.roomOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.hotelType}</label>
                  <select name="typeEtablissement" value={formData.typeEtablissement} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none appearance-none">
                    <option value="">--</option>
                    {t.hotelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.category}</label>
                  <select name="categorie" value={formData.categorie} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none appearance-none">
                    <option value="">--</option>
                    {t.categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t.pensionType}</label>
                  <select name="typePension" value={formData.typePension} onChange={handleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none appearance-none">
                    <option value="">--</option>
                    {t.pensionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 4. Preferences & Promo */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6 mt-8">
                <Tag className="text-gold w-6 h-6" /> {t.preferencesTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.preferences.map((pref) => (
                  <label key={pref} onClick={() => handlePreferenceToggle(pref)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formData.preferences.includes(pref) ? "bg-gold/10 border-gold" : "bg-gray-50 border-gray-200 hover:border-gold/50"}`}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${formData.preferences.includes(pref) ? "bg-gold border-gold" : "bg-white border-gray-300"}`}>
                      {formData.preferences.includes(pref) && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{pref}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">{t.other}</label>
                <input type="text" name="autre" value={formData.autre} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none" />
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 mt-6">
                <label className="block text-sm font-semibold text-gray-800 mb-2">{t.promoLabel}</label>
                <input type="text" name="promo_code" value={formData.promo_code} onChange={handleChange} placeholder={t.promoPlaceholder} className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold/50 outline-none transition-all uppercase font-bold" dir="ltr" />
                <p className="text-xs text-gray-500 mt-2 font-medium">{t.promoDesc}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button type="submit" disabled={isSubmitting} className="w-full py-4 px-6 bg-gold hover:bg-yellow-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-3 text-lg">
                {isSubmitting ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <><Send size={20} className={isRtl ? "transform rotate-180" : ""} /> {t.submit}</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {submitStatus === "success" && (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 text-center max-w-lg mx-auto animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">{t.successTitle}</h3>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 font-mono text-xl font-bold text-gray-700">
            {t.requestNumber} {requestId}
          </div>
          <p className="text-gray-600 mb-8 leading-relaxed">{t.successMsg}</p>
          <button onClick={() => { setSubmitStatus("idle"); setShowForm(false); }} className="text-gold font-bold hover:underline">
            {t.newRequest}
          </button>
        </div>
      )}
    </div>
  );
}
