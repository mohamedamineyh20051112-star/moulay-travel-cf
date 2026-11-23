"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, ExternalLink } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import FlightBookingForm from "./FlightBookingForm";
import OmraBookingForm from "./OmraBookingForm";
import HotelBookingForm from "./HotelBookingForm";
import DynamicForm from "./DynamicForm";
import { defaultFormsConfig } from "@/data/defaultForms";

export default function BookingForm({ initialService = "flights", locale }: { initialService?: string, locale: string }) {
  const tNav = useTranslations("Navigation");
  const tForm = useTranslations("BookingForm");
  const [service, setService] = useState(initialService);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Dynamic Form Settings
  const [formUrl, setFormUrl] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState(true);

  useEffect(() => {
    const fetchFormUrl = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const forms = docSnap.data().forms || {};
          
          let url = null;
          if (service === 'organized_trips') url = forms.organizedTrips;
          else if (service === 'visa' || service === 'visas') url = forms.visa;
          else if (service === 'wellness') url = forms.wellness;
          else if (service === 'car_rental') url = forms.carRental;
          else if (service === 'vip') url = forms.vip;
          else if (service === 'insurance') url = forms.insurance;
          else if (service === 'payment') url = forms.payment;
          else if (service === 'custom_trips') url = forms.customTrips;

          if (url && url.trim() !== '') {
            setFormUrl(url);
          }
        }
      } catch (err) {
        console.error(err);
      }
      setLoadingForm(false);
    };
    
    if (!['flights', 'umrah', 'hotels'].includes(service)) {
      fetchFormUrl();
    } else {
      setLoadingForm(false);
    }
  }, [service]);

  if (service === "flights") return <FlightBookingForm locale={locale} />;
  if (service === "umrah") return <OmraBookingForm locale={locale} />;
  if (service === "hotels") return <HotelBookingForm locale={locale} />;

  if (loadingForm) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto text-center min-h-[300px] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-500 font-medium">
          {locale === 'ar' ? 'جاري تحميل الاستمارة...' : locale === 'fr' ? 'Chargement du formulaire...' : 'Loading form...'}
        </p>
      </div>
    );
  }

  if (formUrl) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full overflow-hidden min-h-[700px] relative">
        <div className="absolute top-4 right-4 z-10">
          <a href={formUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:text-primary hover:bg-white shadow-sm border transition-all">
            <ExternalLink className="w-4 h-4"/> 
            {locale === 'ar' ? 'فتح في نافذة جديدة' : 'Ouvrir'}
          </a>
        </div>
        <iframe 
          src={formUrl} 
          className="w-full min-h-[700px] border-none" 
          title="Booking Form"
        />
      </div>
    );
  }

  // Fallback to Dynamic Built-in Forms
  const dynamicConfig = defaultFormsConfig[service];
  if (dynamicConfig) {
    return <DynamicForm formId={service} config={dynamicConfig} locale={locale} />;
  }

  // Ultimate Fallback
  return (
    <div className="bg-white p-6 md:p-12 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto text-center min-h-[300px] flex flex-col items-center justify-center">
      <h2 className="text-3xl font-bold text-primary mb-4">{tForm("form_title") || "الحجز"}</h2>
      <div className="w-16 h-1 bg-gold rounded-full mb-8 mx-auto"></div>
      <p className="text-xl text-gray-600 font-medium leading-relaxed">
        {locale === 'ar' ? 'جاري إعداد استمارة الحجز لهذه الخدمة...' : locale === 'fr' ? 'Formulaire de réservation en cours de préparation...' : 'Booking form is being prepared...'}
      </p>
      <p className="text-sm text-gray-400 mt-4">
        {locale === 'ar' ? 'يرجى التواصل معنا عبر واتساب للحجز الفوري.' : locale === 'fr' ? 'Veuillez nous contacter via WhatsApp pour une réservation immédiate.' : 'Please contact us via WhatsApp for immediate booking.'}
      </p>
    </div>
  );
}
