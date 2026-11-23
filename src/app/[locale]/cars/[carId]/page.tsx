'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Car, Settings, Calendar, Info, ChevronRight, Phone, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import DynamicForm from '@/components/DynamicForm';
import { defaultFormsConfig } from '@/data/defaultForms';

export default function CarDetailsPage({ params }: { params: { locale: string, carId: string } }) {
  const [item, setItem] = useState<any>(null);
  const isRtl = params.locale === 'ar';
  const tForm = params.locale === 'fr' ? 'Réserver' : 'حجز';
  const tWhatsapp = params.locale === 'fr' ? 'WhatsApp' : 'واتساب';
  const tReserve = params.locale === 'fr' ? 'Réserver' : 'حجز الآن';
  const [view, setView] = useState<'details' | 'form'>('details');

  useEffect(() => {
    const fetchItem = async () => {
      const snap = await getDoc(doc(db, 'cars', params.carId));
      if (snap.exists()) setItem({ id: snap.id, ...snap.data() });
    };
    fetchItem();
  }, [params.carId]);

  if (!item) return <div className="min-h-screen pt-32 text-center">Loading...</div>;

  const itemName = item.nameFr || '';
  const carFullName = `${item.brand} ${itemName}`;

  // Configure form with default carName
  const formConfig = {
    ...defaultFormsConfig['cars'],
    fields: defaultFormsConfig['cars'].fields.map((f: any) => 
      f.id === 'carName' ? { ...f, defaultValue: carFullName } : f
    )
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-32" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12 relative pb-24">
          
          {view === 'details' ? (
            <>
              {item.images && item.images.length > 0 && (
                <div className="h-[40vh] md:h-[60vh] relative bg-white flex flex-col justify-end overflow-hidden border-b border-gray-100">
                  <img src={item.images[0]} className="absolute inset-0 w-full h-full object-cover" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20"></div>
                  <div className="relative z-30 p-8 md:p-12 text-white">
                    <div className="inline-block px-4 py-1 bg-white/20 backdrop-blur rounded-full mb-4 font-bold border border-white/30">
                      {item.brand}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 drop-shadow-lg">
                      {itemName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-lg text-gray-200 font-medium">
                      <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur"><Calendar className="w-5 h-5 text-gold" /> <span>{item.year}</span></div>
                      <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-lg backdrop-blur"><Settings className="w-5 h-5 text-gold" /> <span>{item.gearbox}</span></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                    {item.images && item.images.length > 1 && (
                      <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                          <ImageIcon className="w-6 h-6 text-primary" />
                          {params.locale === 'fr' ? 'Galerie' : 'معرض الصور'}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Array.isArray(item.images) && item.images.slice(1).map((img: string, i: number) => (
                            <div key={i} className="rounded-xl overflow-hidden h-48 bg-gray-100 border border-gray-200 relative group">
                              <img src={img} className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="text-3xl font-black text-primary mb-2">
                        {item.startingPrice} {params.locale === 'ar' ? 'د.ج' : 'DZD'}
                      </div>
                      <p className="text-gray-500">{params.locale === 'ar' ? 'السعر يبدأ من (لليوم)' : 'À partir de (par jour)'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 md:p-12 animate-in fade-in">
              <button 
                onClick={() => setView('details')}
                className="mb-8 flex items-center gap-2 text-primary hover:text-gold font-bold transition-colors"
              >
                <ChevronRight className={`w-5 h-5 ${isRtl ? '' : 'rotate-180'}`} />
                {params.locale === 'ar' ? 'العودة للتفاصيل' : 'Retour aux détails'}
              </button>
              <DynamicForm config={formConfig} locale={params.locale} formId={`car_${item.id}`} />
            </div>
          )}

        </div>
        {/* Sticky Bottom Actions */}
        {view === 'details' && (
          <div className="fixed md:absolute bottom-0 left-0 w-full bg-white border-t shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 p-4 md:rounded-b-3xl">
            <div className="container mx-auto max-w-7xl flex flex-row gap-4 items-center justify-between px-4">
              <a 
                href={`https://wa.me/213659716373?text=${encodeURIComponent('مرحباً، أود الاستفسار عن سيارة ' + carFullName)}`}
                target="_blank" 
                className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                <span className="hidden sm:inline">{tWhatsapp}</span>
              </a>
              <button 
                onClick={() => { setView('form'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex-1 bg-primary hover:bg-gold text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {tReserve}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
