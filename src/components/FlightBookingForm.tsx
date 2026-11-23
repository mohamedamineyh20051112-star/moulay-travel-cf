"use client";

import { useState } from "react";
import { Send, PlaneTakeoff, PlaneLanding, Calendar, Users, Briefcase, Armchair, Phone, ArrowLeft, ArrowRight } from "lucide-react";
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const translations = {
  fr: {
    title: "DEMANDE DE DEVIS — Billet d'avion",
    subtitle: "Merci de remplir ce formulaire pour que notre équipe recherche les meilleures options. Nous vous répondrons rapidement sur WhatsApp.",
    tripType: "Type de voyage",
    tripOptions: ['Aller simple', 'Aller-retour', 'Multi-destinations'],
    departure: "Ville de départ *",
    destination: "Destination *",
    dates: "Dates de voyage",
    dateDep: "Date de départ souhaitée *",
    dateRet: "Date de retour souhaitée",
    flexibility: "Flexibilité des dates",
    flexOptions: ["Dates fixes", "± 1 jour", "± 2 jours", "± 3 jours"],
    timePref: "Préférence d'horaire",
    timeOptions: ["Matin", "Après-midi", "Soir", "Sans préférence"],
    travelers: "Voyageurs",
    adult: "Nombre d'adultes (12 ans et plus)",
    child: "Nombre d'enfants (2 à 11 ans)",
    baby: "Nombre de bébés (moins de 2 ans)",
    ages: "Âge des enfants / bébés",
    agesPlaceholder: "Ex. 6 ans, 9 ans, 18 mois",
    flightPref: "Préférences de vol",
    flightType: "Type de vol préféré",
    flightOptions: ["Direct uniquement", "Avec escale", "Peu importe"],
    class: "Classe souhaitée",
    classOptions: ["Économique", "Premium Economy", "Business", "Première classe"],
    airline: "Compagnie préférée (Optionnel)",
    airplaneType: "Type d'avion (Optionnel)",
    baggage: "Bagages souhaités",
    bagOptions: ["Cabine et soute", "Soute uniquement", "Cabine uniquement", "Sans bagage"],
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
    title: "طلب عرض سعر — تذكرة طيران",
    subtitle: "يرجى ملء هذا النموذج ليتمكن فريقنا من البحث عن أفضل الخيارات. سنرد عليك سريعًا عبر واتساب.",
    tripType: "نوع الرحلة",
    tripOptions: ['ذهاب فقط', 'ذهاب وإياب', 'وجهات متعددة'],
    departure: "مدينة المغادرة *",
    destination: "الوجهة *",
    dates: "تواريخ السفر",
    dateDep: "تاريخ المغادرة المطلوب *",
    dateRet: "تاريخ العودة المطلوب",
    flexibility: "مرونة التواريخ",
    flexOptions: ["تواريخ ثابتة", "± يوم واحد", "± يومين", "± 3 أيام"],
    timePref: "تفضيل الوقت",
    timeOptions: ["صباحاً", "بعد الظهر", "مساءً", "بدون تفضيل"],
    travelers: "المسافرون",
    adult: "عدد البالغين (12 سنة فما فوق)",
    child: "عدد الأطفال (2 إلى 11 سنة)",
    baby: "عدد الرضع (أقل من سنتين)",
    ages: "أعمار الأطفال / الرضع",
    agesPlaceholder: "مثال: 6 سنوات، 9 سنوات، 18 شهراً",
    flightPref: "تفضيلات الرحلة",
    flightType: "نوع الرحلة المفضل",
    flightOptions: ["مباشر فقط", "مع توقف", "لا يهم"],
    class: "الدرجة المطلوبة",
    classOptions: ["اقتصادية", "اقتصادية ممتازة", "أعمال", "الدرجة الأولى"],
    airline: "الشركة المفضلة (اختياري)",
    airplaneType: "نوع الطائرة (اختياري)",
    baggage: "الأمتعة المطلوبة",
    bagOptions: ["مقصورة وشحن", "شحن فقط", "مقصورة فقط", "بدون أمتعة"],
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

export default function FlightBookingForm({ locale, onBack }: { locale: string, onBack: () => void }) {
  const isRtl = locale === 'ar';
  const t = translations[locale as keyof typeof translations] || translations.fr;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await fetch('/api/submit-dynamic-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId: 'airplane', data })
      });
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><PlaneTakeoff size={18} /> {t.departure}</label>
              <input type="text" name="Ville de départ" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2"><PlaneLanding size={18} /> {t.destination}</label>
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
              <input type="date" name="Date de départ" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold outline-none" />
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
          <label className="block font-semibold text-gray-700 text-lg mb-4 flex items-center gap-2"><Armchair size={22} /> {t.flightPref}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.flightType}</label>
              <select name="Type de vol" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                {t.flightOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.class}</label>
              <select name="Classe" className="w-full p-3 border border-gray-300 rounded-lg bg-white">
                {t.classOptions.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.airline}</label>
              <input type="text" name="Compagnie" className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">{t.airplaneType}</label>
              <input type="text" name="Type d'avion" className="w-full p-3 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Bagages */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <label className="block font-semibold text-gray-700 text-lg mb-4 flex items-center gap-2"><Briefcase size={22} /> {t.baggage}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {t.bagOptions.map((bag, i) => (
              <label key={i} className="cursor-pointer">
                <input type="radio" name="Bagages" value={bag} className="peer sr-only" defaultChecked={i === 0} />
                <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 peer-checked:border-gold peer-checked:bg-gold/10 hover:border-gold/50 transition">
                  <Briefcase className="h-5 w-5 text-gray-500 peer-checked:text-[#3a2818]" />
                  <span className="font-medium text-gray-700 peer-checked:text-[#3a2818]">{bag}</span>
                </div>
              </label>
            ))}
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
