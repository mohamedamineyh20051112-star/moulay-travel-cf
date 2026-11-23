'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, CheckCircle, Phone, ArrowLeft, 
  Send, Camera, Utensils, Info, BedDouble, ChevronLeft, 
  Bus, Plane, Heart, Star
} from 'lucide-react';
import Link from 'next/link';
import DynamicForm from '@/components/DynamicForm';
import { defaultFormsConfig } from '@/data/defaultForms';
import { normalizeDestination } from '@/lib/normalize';

export default function VIPTripsHotelDetails({ params }: { params: { locale: string, destinationId: string, hotelId: string } }) {
  const locale = params.locale as 'ar' | 'fr' | 'en';
  const isRtl = locale === 'ar';
  
  const [destination, setDestination] = useState<any>(null);
  const [hotel, setHotel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'details' | 'form'>('details');

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

  const formatCurrency = (amount: number, isEuro = false) => { 
    if (isEuro) {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    }
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(amount).replace('DZD', 'د.ج'); 
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-32" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold border-t-transparent"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center pt-32" dir={isRtl ? 'rtl' : 'ltr'}>
        <p className="text-xl text-gray-500">الفندق غير موجود / Hôtel introuvable</p>
      </div>
    );
  }

  const hotelName = locale === 'fr' && hotel.nameFr ? hotel.nameFr : (hotel.nameAr || '');
  const destName = locale === 'fr' && destination?.nameFr ? destination.nameFr : (destination?.nameAr || '');
  
  // Modify form config to include the selected trip
  const formConfig = JSON.parse(JSON.stringify(defaultFormsConfig['vip_trips']));
  formConfig.title = {
    ar: `حجز رحلة: ${hotelName}`,
    fr: `Réservation: ${hotelName}`,
    en: `Booking: ${hotelName}`
  };
  
  if (formConfig.fields) {
    formConfig.fields.unshift({
      id: "selected_trip",
      type: "text",
      label: { ar: "الرحلة المختارة", fr: "Voyage sélectionné", en: "Selected Trip" },
      required: true,
      defaultValue: `${hotelName} - ${destName}`,
      readOnly: true
    });
  }

  // Wa Text
  const waText = isRtl 
    ? `السلام عليكم، أود الاستفسار عن رحلة VIP: ${hotelName} إلى ${destName}...` 
    : `Bonjour, je voudrais me renseigner concernant le voyage VIP: ${hotelName} à ${destName}...`;

  if (view === 'form') {
    return (
      <div className="pt-32 pb-20 bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
        <div ref={topRef} className="max-w-3xl mx-auto px-4 relative">
          <button onClick={() => { setView('details'); scrollToTop(); }} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-primary transition font-bold">
            <ArrowLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
            {isRtl ? 'العودة لتفاصيل الفندق' : 'Retour aux détails'}
          </button>
          <DynamicForm 
            formId={`vip_trips_${hotel.id}`}
            config={formConfig}
            locale={locale}
          />
        </div>
      </div>
    );
  }

  const roomList = (Array.isArray(hotel.roomPrices) && hotel.roomPrices.length > 0) ? hotel.roomPrices : (Array.isArray(hotel.rooms) ? hotel.rooms : []);

  return (
    <div className="pt-32 pb-32 min-h-screen bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        ref={topRef} 
        className="max-w-4xl mx-auto bg-[#fdf8f0] rounded-[2rem] border border-gold/30 shadow-2xl overflow-hidden relative pb-24"
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-gold/20 relative">
          <Link href={`/${locale}/vip_trips/${destination?.id || params.destinationId}`} className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition">
            <ChevronLeft className={`w-6 h-6 text-primary ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
          <div className="text-center absolute left-1/2 -translate-x-1/2 w-[60%]">
            <h2 className="text-2xl md:text-3xl font-bold text-primary truncate">{hotelName}</h2>
            {Number(hotel.stars) > 0 && (
              <div className="flex justify-center text-gold mt-1">
                {[...Array(Number(hotel.stars))].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
            )}
            <p className="text-gold font-medium flex items-center justify-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              {isRtl ? 'تفاصيل العرض' : 'Détails de l\'offre'}
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
            </p>
          </div>
          <button className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition text-gray-400 hover:text-red-500">
            <Heart className="w-6 h-6" />
          </button>
        </div>

        {/* Hero Image & Banner */}
        <div className="px-6 pt-6">
          <div className="rounded-3xl overflow-hidden h-[300px] md:h-[400px] shadow-lg relative bg-gray-200">
            {hotel.images && hotel.images.length > 0 ? (
              <img src={hotel.images[0]} alt={hotelName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400"><Camera className="w-12 h-12"/></div>
            )}
          </div>
          <div className="bg-white rounded-2xl p-4 mt-4 shadow-sm border border-gold/10 flex flex-wrap justify-center gap-6 md:gap-8 text-gray-700 font-semibold">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" />
              {destName} {hotel.zone ? `- ${hotel.zone}` : ''}
            </div>
            {hotel.distanceToHaram && (
              <>
                <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
                <div className="flex items-center gap-2">
                  {isRtl ? 'المسافة للحرم :' : 'Distance au Haram :'} <span dir="ltr">{hotel.distanceToHaram}</span>
                </div>
              </>
            )}
            {(hotel.mekkaDays > 0 || hotel.madinaDays > 0) && (
              <>
                <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
                <div className="flex items-center gap-3">
                  {hotel.mekkaDays > 0 && <span className="bg-gold/10 text-gold px-2 py-0.5 rounded-lg text-sm">{hotel.mekkaDays} {isRtl ? 'ليالي مكة' : 'Nuits Mekka'}</span>}
                  {hotel.madinaDays > 0 && <span className="bg-gold/10 text-gold px-2 py-0.5 rounded-lg text-sm">{hotel.madinaDays} {isRtl ? 'ليالي المدينة' : 'Nuits Madina'}</span>}
                </div>
              </>
            )}
            {hotel.googleMapsLink && (
              <>
                <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
                <a href={hotel.googleMapsLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                  <MapPin className="w-5 h-5" />
                  {isRtl ? 'عرض الموقع على الخريطة' : 'Voir sur la carte'}
                </a>
              </>
            )}
            {hotel.price && (
              <>
                <div className="w-px h-6 bg-gray-300 hidden md:block"></div>
                <div className="flex items-center gap-2 text-primary font-bold">
                  {isRtl ? 'ابتداءً من :' : 'À partir de :'} {formatCurrency(hotel.price)}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-6 md:p-8 space-y-8">
          
          {/* Description */}
          {(hotel.descriptionAr || hotel.descriptionFr) && (
            <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm text-gray-700 leading-relaxed whitespace-pre-line">
              <h4 className="text-primary font-bold mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-gold" /> {isRtl ? 'لمحة عن العرض' : 'Aperçu de l\'offre'}
              </h4>
              {locale === 'fr' && hotel.descriptionFr ? hotel.descriptionFr : (hotel.descriptionAr || '')}
            </div>
          )}
          
          {/* Quick Tabs (Images) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-3">
              <h4 className="text-gold font-bold text-center flex items-center gap-1"><BedDouble className="w-4 h-4"/> {isRtl ? 'الغرف' : 'Chambres'}</h4>
              <div className="w-full h-24 md:h-32 rounded-xl bg-gray-200 shadow-inner overflow-hidden">
                {hotel.roomImages && hotel.roomImages.length > 0 ? (
                  <img src={hotel.roomImages[0]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Camera /></div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <h4 className="text-gold font-bold text-center flex items-center gap-1"><Utensils className="w-4 h-4"/> {isRtl ? 'المطعم' : 'Restaurant'}</h4>
              <div className="w-full h-24 md:h-32 rounded-xl bg-gray-200 shadow-inner overflow-hidden">
                {hotel.foodImages && hotel.foodImages.length > 0 ? (
                  <img src={hotel.foodImages[0]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Camera /></div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <h4 className="text-gold font-bold text-center flex items-center gap-1"><Info className="w-4 h-4"/> {isRtl ? 'المزيد' : 'Plus'}</h4>
              <div className="w-full h-24 md:h-32 rounded-xl bg-gray-200 shadow-inner overflow-hidden">
                {hotel.images && hotel.images.length > 1 ? (
                  <img src={hotel.images[1]} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400"><Camera /></div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          {roomList.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-primary mb-4 text-center flex items-center justify-center gap-2">
                <span className="w-8 h-[1px] bg-gold"></span>
                {isRtl ? 'أسعار الغرف' : 'Prix des Chambres'}
                <span className="w-8 h-[1px] bg-gold"></span>
              </h3>
              <div className="bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-md">
                <table className="w-full text-center">
                  <thead className="bg-gold/10 text-primary">
                    <tr>
                      <th className="py-4 px-6 border-b border-gold/20 font-bold w-1/3">{isRtl ? 'نوع الغرفة' : 'Type de Chambre'}</th>
                      <th className="py-4 px-6 border-b border-gold/20 font-bold border-l border-gold/20 w-1/3">{isRtl ? 'السعر (دج)' : 'Prix (DZD)'}</th>
                      <th className="py-4 px-6 border-b border-gold/20 font-bold border-l border-gold/20 w-1/3">{isRtl ? 'السعر (€)' : 'Prix (€)'}</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700 font-medium">
                    {roomList.map((room: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                        <td className="py-4 px-6">{locale === 'fr' ? (room.typeFr || room.typeAr) : (room.typeAr || room.typeFr)}</td>
                        <td className="py-4 px-6 border-l border-gold/20 bg-[#fdfdfd]" dir="ltr">{room.priceDzd ? formatCurrency(Number(room.priceDzd)) : '-'}</td>
                        <td className="py-4 px-6 border-l border-gold/20 bg-[#fdfdfd]" dir="ltr">{room.priceEur ? formatCurrency(Number(room.priceEur), true) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transport */}
            <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm">
              <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                <Bus className="w-5 h-5 text-gold" /> {isRtl ? 'خدمة النقل' : 'Transport'}
              </h4>
              {hotel.hasTransport ? (
                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-full text-green-600"><CheckCircle className="w-5 h-5"/></div>
                  <div>
                    <p className="font-bold text-gray-800">{isRtl ? 'متوفر' : 'Inclus'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">{isRtl ? 'غير متوفر' : 'Non disponible'}</p>
              )}
            </div>

            {/* Food */}
            <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm">
              <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-gold" /> {isRtl ? 'الإطعام' : 'Restauration'}
              </h4>
              {hotel.hasFood ? (
                <div className="flex items-start gap-4">
                  <div className="bg-gold/10 p-2 rounded-full text-gold"><Utensils className="w-5 h-5"/></div>
                  <div>
                    <p className="font-bold text-gray-800">{locale === 'fr' && hotel.foodTypeFr ? hotel.foodTypeFr : (hotel.foodTypeAr || '')}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">{isRtl ? 'غير متوفر' : 'Non disponible'}</p>
              )}
            </div>
          </div>

          {/* Program */}
          {Array.isArray(hotel.program) && hotel.program.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-gold/20 shadow-sm">
              <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gold" /> {isRtl ? 'برنامج الرحلة' : 'Programme du Voyage'}
              </h4>
              <ul className="space-y-4">
                {(hotel.program || []).map((p: any, idx: number) => (
                  <li key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center font-bold text-sm shrink-0">{idx + 1}</div>
                      {idx !== hotel.program.length - 1 && <div className="w-0.5 h-full bg-gold/30 mt-2"></div>}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl flex-1 border border-gray-100">
                      <p className="text-gray-700 font-medium leading-relaxed">
                        {typeof p === 'string' ? p : (locale === 'fr' && p.fr ? p.fr : (p.ar || p.fr || ''))}
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
                <span className="w-8 h-[1px] bg-gold"></span>
                {isRtl ? 'جدول تواريخ الرحلة' : 'Calendrier du Voyage'}
                <span className="w-8 h-[1px] bg-gold"></span>
              </h3>
              <div className="bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-center min-w-[800px]">
                    <thead className="bg-gold/10 text-primary whitespace-nowrap">
                      <tr>
                        <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'الإقلاع' : 'Départ'}</th>
                        <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'تاريخ الذهاب' : 'Date Aller'}</th>
                        <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'نوع الرحلة' : 'Type Vol'}</th>
                        <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'الدخول' : 'Entrée'}</th>
                        <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'نوع الخطوط' : 'Compagnie'}</th>
                        <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'الخروج' : 'Sortie'}</th>
                        <th className="py-3 px-4 border-b border-gold/20 font-bold">{isRtl ? 'تاريخ الرجوع' : 'Date Retour'}</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700 font-medium whitespace-nowrap">
                      {(hotel.schedules || []).map((sch: any, idx: number) => {
                        const getLoc = (val: any) => typeof val === 'string' ? val : (locale === 'fr' && val?.fr ? val.fr : (val?.ar || val?.fr || ''));
                        return (
                          <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                            <td className="py-4 px-4">{getLoc(sch.departLoc)}</td>
                            <td className="py-4 px-4" dir="ltr">{sch.departDate || '-'}</td>
                            <td className="py-4 px-4">{getLoc(sch.flightType)}</td>
                            <td className="py-4 px-4">{getLoc(sch.entry)}</td>
                            <td className="py-4 px-4">{getLoc(sch.airline)}</td>
                            <td className="py-4 px-4">{getLoc(sch.exit)}</td>
                            <td className="py-4 px-4" dir="ltr">{sch.returnDate || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Sticky Bottom Actions */}
        {view === 'details' && (
          <div className="fixed md:absolute bottom-0 left-0 w-full bg-white border-t border-gold/30 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 md:rounded-b-[2rem]">
            <div className="max-w-4xl mx-auto flex gap-4">
              <a 
                href={`https://wa.me/213659716373?text=${encodeURIComponent(waText)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#1da851] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg text-sm md:text-lg"
              >
                <Phone className="w-5 h-5" />
                {isRtl ? 'استفسار عبر واتساب' : 'Contact WhatsApp'}
              </a>
              <button 
                onClick={() => { setView('form'); scrollToTop(); }}
                className="flex-1 bg-gold hover:bg-yellow-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg text-sm md:text-lg"
              >
                <Calendar className="w-5 h-5" />
                {isRtl ? 'احجز الآن' : 'Réserver Maintenant'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
