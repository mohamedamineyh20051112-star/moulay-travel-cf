"use client";

import { useState } from "react";
import { Send, Ship, Calendar, Users, Briefcase, Armchair, Phone, ArrowLeft, ArrowRight, MapPin, Car } from "lucide-react";

const translations = {
  en: {
    title: "QUOTE REQUEST — Boat / Ferry",
    subtitle: "Please fill out this form so our team can find the best sea crossing. We will reply quickly on WhatsApp.",
    tripType: "Trip Type",
    tripOptions: ['One-way', 'Round-trip'],
    departure: "Departure Port / City *",
    destination: "Arrival Port / City *",
    dates: "Travel Dates",
    dateDep: "Preferred Departure Date",
    dateRet: "Preferred Return Date",
    flexibility: "Flexibility",
    flexOptions: ["Fixed dates", "± 1 day", "± 2 days", "± 3 days"],
    timePref: "Time Preference",
    timeOptions: ["Morning", "Afternoon", "Evening", "Night", "No preference"],
    travelers: "Travelers",
    adult: "Number of Adults",
    child: "Number of Children",
    baby: "Number of Infants",
    ages: "Children / Infants Ages",
    agesPlaceholder: "e.g. 6 yrs, 9 yrs, 18 mos",
    vehicle: "Vehicle",
    vehicleQuestion: "Are you traveling with a vehicle? *",
    vehicleNo: "No — Foot passenger",
    vehicleYes: "Yes — With vehicle",
    vehType: "Vehicle Type",
    vehTypeOptions: ["Car", "SUV / 4x4", "Van / Utility", "Motorcycle", "Campervan", "Other"],
    vehModel: "Make and Model",
    vehModelPlaceholder: "e.g. Peugeot 3008",
    vehImm: "License Plate",
    vehFuel: "Fuel Type",
    vehFuelOptions: ["Gasoline", "Diesel", "Hybrid", "Electric", "Other"],
    vehDim: "Vehicle Dimensions",
    vehLen: "Length (m)",
    vehHeight: "Height (m)",
    vehEq: "Extra Equipment",
    vehEqOptions: ["None", "Roof box", "Trailer", "Bike rack"],
    inst: "Onboard Accommodation",
    instType: "Preferred Type",
    instOptions: ["Reclining Seat", "Standard Seat", "Inside Cabin", "Outside Cabin", "Private Cabin", "Family Cabin"],
    contact: "Contact Details",
    name: "Full Name *",
    phone: "Phone / WhatsApp *",
    email: "Email *",
    promo: "Promo Code",
    additional: "Additional Information",
    message: "Message / Special Request",
    submit: "Request My Quote",
    secure: "Your information is secure.",
    back: "Back to options",
    success: "Request sent successfully! Our team will contact you soon.",
    error: "An error occurred while sending your request. Please check your details and try again."
  },
  fr: {
    title: "DEMANDE DE DEVIS — Bateau / Ferry",
    subtitle: "Merci de remplir ce formulaire pour que notre équipe recherche la meilleure traversée. Nous vous répondrons rapidement sur WhatsApp.",
    tripType: "Type de voyage",
    tripOptions: ['Aller simple', 'Aller-retour'],
    departure: "Port / Ville de départ *",
    destination: "Port / Ville d'arrivée *",
    dates: "Dates de voyage",
    dateDep: "Date de départ souhaitée",
    dateRet: "Date de retour souhaitée",
    flexibility: "Flexibilité",
    flexOptions: ["Dates fixes", "± 1 jour", "± 2 jours", "± 3 jours"],
    timePref: "Préférence d'horaire",
    timeOptions: ["Matin", "Après-midi", "Soir", "Nuit", "Sans préférence"],
    travelers: "Voyageurs",
    adult: "Nombre d'adultes",
    child: "Nombre d'enfants",
    baby: "Nombre de bébés",
    ages: "Âge des enfants / bébés",
    agesPlaceholder: "Ex. 6 ans, 9 ans, 18 mois",
    vehicle: "Véhicule",
    vehicleQuestion: "Voyagez-vous avec un véhicule ? *",
    vehicleNo: "Non — Passager sans véhicule",
    vehicleYes: "Oui — Avec véhicule",
    vehType: "Type de véhicule",
    vehTypeOptions: ["Voiture", "SUV / 4x4", "Utilitaire", "Moto", "Camping-car", "Autre"],
    vehModel: "Marque et modèle",
    vehModelPlaceholder: "Ex. Peugeot 3008",
    vehImm: "Immatriculation",
    vehFuel: "Carburant",
    vehFuelOptions: ["Essence", "Diesel", "Hybride", "Électrique", "Autre"],
    vehDim: "Dimensions du véhicule",
    vehLen: "Longueur (m)",
    vehHeight: "Hauteur (m)",
    vehEq: "Équipement supplémentaire",
    vehEqOptions: ["Aucun", "Coffre de toit", "Remorque", "Porte-vélos"],
    inst: "Installation à bord",
    instType: "Type souhaité",
    instOptions: ["Fauteuil", "Place standard", "Cabine intérieure", "Cabine extérieure", "Cabine privée", "Cabine familiale"],
    contact: "Vos coordonnées",
    name: "Nom et prénom *",
    phone: "Téléphone / WhatsApp *",
    email: "E-mail *",
    promo: "Code promoteur",
    additional: "Informations complémentaires",
    message: "Message / demande particulière",
    submit: "Demander mon devis",
    secure: "Vos informations sont sécurisées.",
    back: "Retour aux choix",
    success: "Demande envoyée avec succès! Notre équipe vous contactera bientôt.",
    error: "Une erreur s'est produite. Veuillez réessayer."
  },
  ar: {
    title: "طلب عرض سعر — باخرة / عبارة",
    subtitle: "يرجى ملء هذا النموذج ليتمكن فريقنا من البحث عن أفضل رحلة. سنرد عليك سريعًا عبر واتساب.",
    tripType: "نوع الرحلة",
    tripOptions: ['ذهاب فقط', 'ذهاب وإياب'],
    departure: "ميناء / مدينة المغادرة *",
    destination: "ميناء / مدينة الوصول *",
    dates: "تواريخ السفر",
    dateDep: "تاريخ المغادرة المطلوب",
    dateRet: "تاريخ العودة المطلوب",
    flexibility: "المرونة",
    flexOptions: ["تواريخ ثابتة", "± يوم واحد", "± يومين", "± 3 أيام"],
    timePref: "تفضيل الوقت",
    timeOptions: ["صباحاً", "بعد الظهر", "مساءً", "ليلاً", "بدون تفضيل"],
    travelers: "المسافرون",
    adult: "عدد البالغين",
    child: "عدد الأطفال",
    baby: "عدد الرضع",
    ages: "أعمار الأطفال / الرضع",
    agesPlaceholder: "مثال: 6 سنوات، 9 سنوات، 18 شهراً",
    vehicle: "المركبة / السيارة",
    vehicleQuestion: "هل تسافر بمركبة؟ *",
    vehicleNo: "لا — مسافر بدون مركبة",
    vehicleYes: "نعم — مع مركبة",
    vehType: "نوع المركبة",
    vehTypeOptions: ["سيارة", "دفع رباعي / SUV", "مركبة نفعية", "دراجة نارية", "منزل متنقل (كامبر)", "أخرى"],
    vehModel: "العلامة والنموذج",
    vehModelPlaceholder: "مثال: بيجو 3008",
    vehImm: "رقم التسجيل (لوحة الترخيص)",
    vehFuel: "الوقود",
    vehFuelOptions: ["بنزين", "ديزل", "هجين", "كهربائي", "أخرى"],
    vehDim: "أبعاد المركبة",
    vehLen: "الطول (متر)",
    vehHeight: "الارتفاع (متر)",
    vehEq: "معدات إضافية",
    vehEqOptions: ["بدون", "صندوق سقف", "مقطورة", "حامل دراجات"],
    inst: "المنشآت على متن السفينة",
    instType: "النوع المطلوب",
    instOptions: ["مقعد", "مكان عادي", "غرفة داخلية", "غرفة خارجية", "غرفة خاصة", "غرفة عائلية"],
    contact: "معلومات الاتصال",
    name: "الاسم واللقب *",
    phone: "الهاتف / واتساب *",
    email: "البريد الإلكتروني *",
    promo: "رمز المروج",
    additional: "معلومات إضافية",
    message: "رسالة / طلب خاص",
    submit: "طلب عرض سعر",
    secure: "معلوماتك آمنة ومحمية.",
    back: "العودة للاختيارات",
    success: "تم إرسال الطلب بنجاح! سيتصل بك فريقنا قريباً.",
    error: "حدث خطأ. يرجى المحاولة مرة أخرى."
  }
};

export default function FerryBookingForm({ locale, onBack }: { locale: string, onBack: () => void }) {
  const isRtl = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.fr;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [hasVehicle, setHasVehicle] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (!hasVehicle) {
      delete data["Type de véhicule"];
      delete data["Marque et modèle"];
      delete data["Immatriculation"];
      delete data["Carburant"];
      delete data["Longueur (m)"];
      delete data["Hauteur (m)"];
      delete data["Équipement supplémentaire"];
    }

    try {
      const res = await fetch('/api/submit-dynamic-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: 'ferry', data })
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus("success");
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "success") {
    return (
      <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-[#e5d5b5] max-w-2xl mx-auto my-12">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[#3a2818] mb-4">{t.success}</h2>
        <button onClick={onBack} className="mt-8 px-8 py-3 bg-[#3a2818] text-white rounded-xl hover:bg-[#e5d5b5] hover:text-[#3a2818] transition-colors font-bold">
          {t.back}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="bg-[#3a2818] p-8 text-white relative">
        <button onClick={onBack} className="absolute top-8 rtl:right-8 ltr:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          <span className="font-medium">{t.back}</span>
        </button>
        <div className="text-center mt-8">
          <h2 className="text-3xl font-bold mb-3">{t.title}</h2>
          <p className="text-[#e5d5b5]">{t.subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        
        {/* Type de voyage */}
        <div>
          <label className="block font-semibold text-gray-700 text-lg mb-4">{t.tripType}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.tripOptions.map((opt, i) => (
              <label key={i} className="cursor-pointer">
                <input type="radio" name="Type de voyage" value={opt} className="peer sr-only" defaultChecked={i === 0} />
                <div className="text-center p-4 rounded-xl border-2 border-gray-200 peer-checked:border-gold peer-checked:bg-gold/10 hover:border-gold/50 transition font-medium text-gray-700 peer-checked:text-[#3a2818]">
                  {opt}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Itinéraire */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={18} /> {t.departure}</label>
              <input type="text" name="Port / Ville de départ" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={18} /> {t.destination}</label>
              <input type="text" name="Port / Ville d'arrivée" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div>
          <label className="block font-semibold text-gray-700 text-lg mb-4 flex items-center gap-2"><Calendar size={22} /> {t.dates}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.dateDep}</label>
              <input type="date" name="Date de départ" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.dateRet}</label>
              <input type="date" name="Date de retour" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.flexibility}</label>
              <select name="Flexibilité" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none bg-white">
                {t.flexOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.timePref}</label>
              <select name="Préférence horaire" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none bg-white">
                {t.timeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Voyageurs */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <label className="block font-semibold text-gray-700 text-lg mb-4 flex items-center gap-2"><Users size={22} /> {t.travelers}</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-500 font-semibold mb-1">{t.adult}</label>
              <input type="number" name="Adultes" min="1" defaultValue="1" required className="w-full p-3 border border-gray-300 rounded-lg text-center outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-semibold mb-1">{t.child}</label>
              <input type="number" name="Enfants" min="0" defaultValue="0" className="w-full p-3 border border-gray-300 rounded-lg text-center outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-semibold mb-1">{t.baby}</label>
              <input type="number" name="Bébés" min="0" defaultValue="0" className="w-full p-3 border border-gray-300 rounded-lg text-center outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1">{t.ages}</label>
            <input type="text" name="Âges enfants" placeholder={t.agesPlaceholder} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none" />
          </div>
        </div>

        {/* Véhicule */}
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <label className="block font-semibold text-gray-700 text-lg mb-4 flex items-center gap-2"><Car size={22} /> {t.vehicle}</label>
          <label className="block text-sm text-gray-600 mb-4">{t.vehicleQuestion}</label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <label className="cursor-pointer">
              <input type="radio" name="Voyage avec véhicule" value="Non" className="peer sr-only" defaultChecked onChange={() => setHasVehicle(false)} />
              <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 peer-checked:border-[#3a2818] peer-checked:bg-gray-50 transition">
                <span className="w-4 h-4 rounded-full border-2 border-gray-300 peer-checked:border-[5px] peer-checked:border-[#3a2818]"></span>
                <span className="font-medium text-gray-700">{t.vehicleNo}</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="Voyage avec véhicule" value="Oui" className="peer sr-only" onChange={() => setHasVehicle(true)} />
              <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 peer-checked:border-gold peer-checked:bg-gold/10 transition">
                <span className="w-4 h-4 rounded-full border-2 border-gray-300 peer-checked:border-[5px] peer-checked:border-[#b89b5e]"></span>
                <span className="font-medium text-gray-700">{t.vehicleYes}</span>
              </div>
            </label>
          </div>

          {hasVehicle && (
            <div className="space-y-6 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">{t.vehType}</label>
                  <select name="Type de véhicule" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                    {t.vehTypeOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">{t.vehModel}</label>
                  <input type="text" name="Marque et modèle" placeholder={t.vehModelPlaceholder} className="w-full p-3 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">{t.vehImm}</label>
                  <input type="text" name="Immatriculation" className="w-full p-3 border border-gray-300 rounded-lg uppercase" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">{t.vehFuel}</label>
                  <select name="Carburant" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                    {t.vehFuelOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t.vehDim}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.vehLen}</label>
                    <input type="number" name="Longueur (m)" step="0.1" className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">{t.vehHeight}</label>
                    <input type="number" name="Hauteur (m)" step="0.1" className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">{t.vehEq}</label>
                <select name="Équipement supplémentaire" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                  {t.vehEqOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Installation */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <label className="block font-semibold text-gray-700 text-lg mb-4 flex items-center gap-2"><Armchair size={22} /> {t.inst}</label>
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t.instType}</label>
            <select name="Installation" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
              {t.instOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Coordonnées */}
        <div>
          <label className="block font-semibold text-gray-700 text-lg mb-4 flex items-center gap-2"><Phone size={22} /> {t.contact}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" name="Nom" required placeholder={t.name} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
            <input type="tel" name="Téléphone" required dir="ltr" placeholder={t.phone} className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold ${isRtl?'text-right':''}`} />
            <input type="email" name="Email" required dir="ltr" placeholder={t.email} className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold ${isRtl?'text-right':''}`} />
            <input type="text" name="Promo" placeholder={t.promo} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold" />
          </div>
        </div>

        {/* Infos supplémentaires */}
        <div>
          <label className="block font-semibold text-gray-700 text-lg mb-4">{t.additional}</label>
          <textarea name="Message" rows={3} placeholder={t.message} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold"></textarea>
        </div>

        {status === "error" && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-bold text-center">
            {t.error}
          </div>
        )}

        <div className="text-center pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-12 py-4 bg-[#3a2818] text-white font-bold rounded-xl hover:bg-[#e5d5b5] hover:text-[#3a2818] transition-all flex justify-center items-center gap-3 mx-auto">
            {isSubmitting ? <span className="animate-pulse">...</span> : <><Send size={20} /> {t.submit}</>}
          </button>
          <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-1">🔒 {t.secure}</p>
        </div>

      </form>
    </div>
  );
}
