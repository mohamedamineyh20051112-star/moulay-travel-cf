'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Percent, Phone, Plane, Building2, Car, CheckCircle2 } from 'lucide-react';

export default function DiscountsPage({ params: { locale } }: { params: { locale: string } }) {
  const isRtl = locale === 'ar';
  
  const [cars, setCars] = useState<any[]>([]);
  const [hammams, setHammams] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [omra, setOmra] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [carsSnap, hammamsSnap, tripsSnap, omraSnap] = await Promise.all([
        getDocs(collection(db, 'cars')),
        getDocs(collection(db, 'hammams')),
        getDocs(collection(db, 'organized_trips_hotels')),
        getDocs(collection(db, 'omraHotels'))
      ]);
      
      const hasDiscount = (d: any) => d.discountPrice || d.discountPriceEuro || d.isInstallment;

      setCars(carsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(hasDiscount));
      setHammams(hammamsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(hasDiscount));
      setTrips(tripsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(hasDiscount));
      setOmra(omraSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(hasDiscount));
    };
    fetchData();
  }, []);

  const waLink = (text: string) => `https://wa.me/213659716373?text=${encodeURIComponent('مرحباً، أود الاستفسار عن: ' + text)}`;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-600 rounded-full mb-6">
            <Percent className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            {locale === 'fr' ? 'Promotions et Facilités' : 'التخفيضات والتقسيط'}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {locale === 'fr' ? 'Découvrez toutes nos offres promotionnelles, contactez-nous directement via WhatsApp.' : 'اكتشف جميع عروضنا الخاصة بالتخفيضات والتقسيط. تواصل معنا مباشرة عبر واتساب لحجز عرضك.'}
          </p>
        </div>

        {/* Flight Tickets - Static */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Plane className="w-6 h-6 text-primary"/> تذاكر الطيران</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-red-100 shadow-sm hover:shadow-xl hover:border-red-200 transition-all flex flex-col justify-between">
              <div>
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Plane className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{locale === 'fr' ? 'Billets d\'avion' : 'حجز تذاكر طيران'}</h3>
                <p className="text-gray-600 mb-8">{locale === 'fr' ? 'Réservez vos billets d\'avion au meilleur prix.' : 'احجز تذاكر الطيران لأي وجهة في العالم بأفضل الأسعار المتاحة وبطرق دفع ميسرة.'}</p>
              </div>
              <a href={waLink('تذاكر الطيران')} target="_blank" className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-xl font-bold transition-colors shadow-md">
                <Phone className="w-5 h-5" /> {locale === 'fr' ? 'WhatsApp Direct' : 'استفسار وحجز عبر واتساب'}
              </a>
            </div>
          </div>
        </div>

        {/* Organized Trips */}
        {trips.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Building2 className="w-6 h-6 text-primary"/> الرحلات المنظمة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map(trip => (
                <div key={trip.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
                  {trip.images?.[0] && <img src={trip.images[0]} className="w-full h-48 object-cover rounded-2xl mb-4" />}
                  <div className="flex items-center gap-2 mb-2">
                    {trip.isInstallment && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-bold">تقسيط متاح</span>}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{locale === 'fr' && trip.nameFr ? trip.nameFr : trip.nameAr}</h3>
                  <div className="mb-6">
                    {trip.discountPrice ? (
                      <div className="flex flex-col">
                        <span className="text-gray-400 line-through text-sm">{trip.price} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                        <span className="text-green-600 font-bold text-xl">{Number(trip.price) - Number(trip.discountPrice)} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold">{trip.price} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <a href={waLink(trip.nameAr)} target="_blank" className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold transition-colors">
                      <Phone className="w-5 h-5" /> {locale === 'ar' ? 'تواصل عبر الواتساب' : 'WhatsApp'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cars */}
        {cars.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Car className="w-6 h-6 text-primary"/> السيارات للكراء</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map(car => (
                <div key={car.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
                  {car.images?.[0] && <img src={car.images[0]} className="w-full h-48 object-cover rounded-2xl mb-4" />}
                  <div className="flex items-center gap-2 mb-2">
                    {car.isInstallment && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-bold">تقسيط متاح</span>}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{car.brand} {locale === 'fr' && car.nameFr ? car.nameFr : car.nameAr}</h3>
                  <div className="mb-6">
                    {car.discountPrice ? (
                      <div className="flex flex-col">
                        <span className="text-gray-400 line-through text-sm">{car.startingPrice} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                        <span className="text-green-600 font-bold text-xl">{Number(car.startingPrice) - Number(car.discountPrice)} {locale === 'ar' ? 'د.ج/يوم' : 'DZD/jour'}</span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold">{car.startingPrice} {locale === 'ar' ? 'د.ج/يوم' : 'DZD/jour'}</span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <a href={waLink(car.brand + ' ' + car.nameAr)} target="_blank" className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold transition-colors">
                      <Phone className="w-5 h-5" /> {locale === 'ar' ? 'تواصل عبر الواتساب' : 'WhatsApp'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hammams */}
        {hammams.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><CheckCircle2 className="w-6 h-6 text-primary"/> السياحة الحموية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hammams.map(h => (
                <div key={h.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
                  {h.images?.[0] && <img src={h.images[0]} className="w-full h-48 object-cover rounded-2xl mb-4" />}
                  <div className="flex items-center gap-2 mb-2">
                    {h.isInstallment && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-bold">تقسيط متاح</span>}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{locale === 'fr' && h.nameFr ? h.nameFr : h.nameAr}</h3>
                  <div className="mb-6">
                    {h.discountPrice ? (
                      <div className="flex flex-col">
                        <span className="text-gray-400 line-through text-sm">{h.price} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                        <span className="text-green-600 font-bold text-xl">{Number(h.price) - Number(h.discountPrice)} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold">{h.price} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <a href={waLink(h.nameAr)} target="_blank" className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold transition-colors">
                      <Phone className="w-5 h-5" /> {locale === 'ar' ? 'تواصل عبر الواتساب' : 'WhatsApp'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Omra */}
        {omra.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Building2 className="w-6 h-6 text-primary"/> فنادق العمرة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {omra.map(o => (
                <div key={o.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
                  {o.images?.[0] && <img src={o.images[0]} className="w-full h-48 object-cover rounded-2xl mb-4" />}
                  <div className="flex items-center gap-2 mb-2">
                    {o.isInstallment && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-bold">تقسيط متاح</span>}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{locale === 'fr' && o.nameFr ? o.nameFr : o.nameAr}</h3>
                  <div className="mb-6">
                    {o.discountPrice ? (
                      <div className="flex flex-col">
                        <span className="text-gray-400 line-through text-sm">{o.price} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                        <span className="text-green-600 font-bold text-xl">{Number(o.price) - Number(o.discountPrice)} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold">{o.price} {locale === 'ar' ? 'د.ج' : 'DZD'}</span>
                    )}
                  </div>
                  <div className="mt-auto">
                    <a href={waLink(o.nameAr)} target="_blank" className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-bold transition-colors">
                      <Phone className="w-5 h-5" /> {locale === 'ar' ? 'تواصل عبر الواتساب' : 'WhatsApp'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
