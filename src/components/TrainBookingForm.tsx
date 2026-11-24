"use client";

import { useState } from "react";
import { Send, Train, Calendar, Users, Briefcase, Armchair, Phone, ArrowLeft, ArrowRight, MapPin } from "lucide-react";

const translations = {
  en: {
    title: "QUOTE REQUEST — Train / TGV",
    subtitle: "Please fill out this form so our team can find the best schedules and fares. We will reply quickly on WhatsApp.",
    tripType: "Trip Type",
    tripOptions: ['One-way', 'Round-trip'],
    departure: "Departure City / Station *",
    destination: "Arrival City / Station *",
    dates: "Travel Dates",
    dateDep: "Preferred Departure Date",
    dateRet: "Preferred Return Date",
    flexibility: "Flexibility",
    flexOptions: ["Fixed dates", "± 1 day", "± 2 days", "± 3 days"],
    timePref: "Time Preference",
    timeOptions: ["Morning", "Afternoon", "Evening", "No preference"],
    travelers: "Travelers",
    adult: "Number of Adults",
    child: "Number of Children",
    baby: "Infants / Toddlers",
    ages: "Children's Ages",
    agesPlaceholder: "e.g. 6 yrs, 9 yrs",
    trainPref: "Train Preferences",
    trainType: "Preferred Train Type",
    trainOptions: ["TGV INOUI", "OUIGO", "Eurostar", "Intercités / Other", "No preference"],
    class: "Preferred Class",
    classOptions: ["2nd Class", "1st Class", "No preference"],
    conn: "Connections",
    connOptions: ["Direct only", "With connection", "Any"],
    seat: "Seat Preference",
    seatOptions: ["Window", "Aisle", "Table / Group of 4", "No preference"],
    company: "Preferred Operator / Company (Optional)",
    baggage: "Baggage & Equipment",
    bagOptions: ["Standard luggage", "Oversized luggage", "Bicycle", "Stroller", "Other"],
    contact: "Contact Details",
    name: "Full Name *",
    phone: "Phone / WhatsApp *",
    email: "Email *",
    promo: "Promo Code",
    additional: "Additional Information",
    message: "Message / Special Request",
    precisions: "Baggage Details",
    submit: "Request My Quote",
    secure: "Your information is secure.",
    back: "Back to options",
    success: "Request sent successfully! Our team will contact you soon.",
    error: "An error occurred while sending your request. Please check your details and try again."
  },
  fr: {
    title: "DEMANDE DE DEVIS — Train / TGV",
    subtitle: "Merci de remplir ce formulaire pour que notre équipe recherche les meilleurs horaires et tarifs. Nous vous répondrons rapidement sur WhatsApp.",
    tripType: "Type de voyage",
    tripOptions: ['Aller simple', 'Aller-retour'],
    departure: "Ville / Gare de départ *",
    destination: "Ville / Gare d'arrivée *",
    dates: "Dates de voyage",
    dateDep: "Date de départ souhaitée",
    dateRet: "Date de retour souhaitée",
    flexibility: "Flexibilité",
    flexOptions: ["Dates fixes", "± 1 jour", "± 2 jours", "± 3 jours"],
    timePref: "Préférence d'horaire",
    timeOptions: ["Matin", "Après-midi", "Soir", "Sans préférence"],
    travelers: "Voyageurs",
    adult: "Nombre d'adultes",
    child: "Nombre d'enfants",
    baby: "Nombre de bébés / petits enfants",
    ages: "Âge des enfants",
    agesPlaceholder: "Ex. 6 ans, 9 ans",
    trainPref: "Préférences de train",
    trainType: "Type de train préféré",
    trainOptions: ["TGV INOUI", "OUIGO", "Eurostar", "Intercités / autre", "Sans préférence"],
    class: "Classe souhaitée",
    classOptions: ["2e classe", "1re classe", "Sans préférence"],
    conn: "Correspondances",
    connOptions: ["Direct uniquement", "Correspondance acceptée", "Peu importe"],
    seat: "Préférence de siège",
    seatOptions: ["Fenêtre", "Couloir", "Carré / table", "Sans préférence"],
    company: "Compagnie / opérateur préféré (Optionnel)",
    baggage: "Bagages & équipements",
    bagOptions: ["Bagages standards", "Bagage volumineux", "Vélo", "Poussette", "Autre"],
    contact: "Vos coordonnées",
    name: "Nom et prénom *",
    phone: "Téléphone / WhatsApp *",
    email: "E-mail *",
    promo: "Code promoteur",
    additional: "Informations complémentaires",
    message: "Message / demande particulière",
    precisions: "Précisions sur les bagages",
    submit: "Demander mon devis",
    secure: "Vos informations sont sécurisées.",
    back: "Retour aux choix",
    success: "Demande envoyée avec succès! Notre équipe vous contactera bientôt.",
    error: "Une erreur s'est produite. Veuillez réessayer."
  },
  ar: {
    title: "طلب عرض سعر — قطار / TGV",
    subtitle: "يرجى ملء هذا النموذج ليتمكن فريقنا من البحث عن أفضل المواعيد والأسعار. سنرد عليك سريعًا عبر واتساب.",
    tripType: "نوع الرحلة",
    tripOptions: ['ذهاب فقط', 'ذهاب وإياب'],
    departure: "مدينة / محطة المغادرة *",
    destination: "مدينة / محطة الوصول *",
    dates: "تواريخ السفر",
    dateDep: "تاريخ المغادرة المطلوب",
    dateRet: "تاريخ العودة المطلوب",
    flexibility: "المرونة",
    flexOptions: ["تواريخ ثابتة", "± يوم واحد", "± يومين", "± 3 أيام"],
    timePref: "تفضيل الوقت",
    timeOptions: ["صباحاً", "بعد الظهر", "مساءً", "بدون تفضيل"],
    travelers: "المسافرون",
    adult: "عدد البالغين",
    child: "عدد الأطفال",
    baby: "عدد الرضع / الأطفال الصغار",
    ages: "أعمار الأطفال",
    agesPlaceholder: "مثال: 6 سنوات، 9 سنوات",
    trainPref: "تفضيلات القطار",
    trainType: "نوع القطار المفضل",
    trainOptions: ["TGV INOUI", "OUIGO", "Eurostar", "Intercités / أخرى", "بدون تفضيل"],
    class: "الدرجة المطلوبة",
    classOptions: ["الدرجة الثانية", "الدرجة الأولى", "بدون تفضيل"],
    conn: "الرحلات المتصلة",
    connOptions: ["مباشر فقط", "رحلة متصلة مقبولة", "لا يهم"],
    seat: "تفضيل المقعد",
    seatOptions: ["نافذة", "ممر", "مربع / طاولة", "بدون تفضيل"],
    company: "الشركة المفضلة (اختياري)",
    baggage: "الأمتعة والمعدات",
    bagOptions: ["أمتعة عادية", "أمتعة كبيرة", "دراجة", "عربة أطفال", "أخرى"],
    contact: "معلومات الاتصال",
    name: "الاسم واللقب *",
    phone: "الهاتف / واتساب *",
    email: "البريد الإلكتروني *",
    promo: "رمز المروج",
    additional: "معلومات إضافية",
    message: "رسالة / طلب خاص",
    precisions: "تفاصيل حول الأمتعة",
    submit: "طلب عرض سعر",
    secure: "معلوماتك آمنة ومحمية.",
    back: "العودة للاختيارات",
    success: "تم إرسال الطلب بنجاح! سيتصل بك فريقنا قريباً.",
    error: "حدث خطأ. يرجى المحاولة مرة أخرى."
  }
};

export default function TrainBookingForm({ locale, onBack }: { locale: string, onBack: () => void }) {
  const isRtl = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.fr;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");
    const formData = new FormData(e.currentTarget);
    
    // Handle multiple checkboxes for baggages
    const bags = formData.getAll("Bagages");
    const data = Object.fromEntries(formData.entries());
    if (bags.length > 0) {
      data["Bagages"] = bags.join(", ");
    }

    try {
      const res = await fetch('/api/submit-dynamic-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: 'train', data })
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
              <input type="text" name="Ville de départ" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><MapPin size={18} /> {t.destination}</label>
              <input type="text" name="Destination" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none" />
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

        {/* Préférences */}
        <div>
          <label className="block font-semibold text-gray-700 text-lg mb-4 flex items-center gap-2"><Train size={22} /> {t.trainPref}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.trainType}</label>
              <select name="Type de train" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                {t.trainOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.class}</label>
              <select name="Classe" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                {t.classOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.conn}</label>
              <select name="Correspondances" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                {t.connOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.seat}</label>
              <select name="Préférence de siège" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                {t.seatOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t.company}</label>
            <input type="text" name="Compagnie" className="w-full p-3 border border-gray-300 rounded-lg" />
          </div>
        </div>

        {/* Bagages */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <label className="block font-semibold text-gray-700 text-lg mb-4 flex items-center gap-2"><Briefcase size={22} /> {t.baggage}</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {t.bagOptions.map((bag, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition">
                <input type="checkbox" name="Bagages" value={bag} className="w-5 h-5 text-[#3a2818] rounded border-gray-300 focus:ring-[#3a2818]" />
                <span className="text-sm text-gray-700">{bag}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t.precisions}</label>
            <input type="text" name="Précisions bagages" className="w-full p-3 border border-gray-300 rounded-lg" />
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
