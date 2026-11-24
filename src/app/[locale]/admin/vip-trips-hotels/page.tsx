'use client';
import { normalizeDestination } from '@/lib/normalize';
import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Plus, Pencil, Trash2, MapPin, Building2, Star, Crown } from 'lucide-react';
import VIPHotelModal from '@/components/admin/VIPHotelModal';
import { fitPayloadUnder1MB, formatFirestoreError } from '@/lib/smartImageCompress';

function VIPHotelsAdminContent({ params }: { params: { locale: string } }) {
  const searchParams = useSearchParams();
  const destinationId = searchParams.get('destinationId');

  const [hotels, setHotels] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);
  const [selectedDestId, setSelectedDestId] = useState<string>(destinationId || 'all');

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [selectedDestId]);

  const fetchDestinations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'services_destinations'));
      setDestinations(querySnapshot.docs.map((d) => normalizeDestination(d)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateDestination = async (destData: {
    nameAr: string;
    nameFr?: string;
    nameEn?: string;
    image?: string;
    countryCode?: string;
  }) => {
    try {
      const payload: Record<string, any> = await fitPayloadUnder1MB({
        nameAr: destData.nameAr,
        nameFr: destData.nameFr || destData.nameAr,
        nameEn: destData.nameEn || destData.nameFr || destData.nameAr,
        images: destData.image ? [destData.image] : [],
        image: destData.image || '',
        ...(destData.countryCode ? { countryCode: destData.countryCode.toLowerCase() } : {}),
      });

      const docRef = await addDoc(collection(db, 'services_destinations'), payload);
      await fetchDestinations();
      return docRef.id;
    } catch (error: any) {
      alert('حدث خطأ أثناء إنشاء الوجهة: ' + formatFirestoreError(error));
      return null;
    }
  };

  const fetchHotels = async () => {
    setIsLoading(true);
    try {
      let q = collection(db, 'vip_trips_hotels');
      if (selectedDestId !== 'all') {
        q = query(q, where('destinationId', '==', selectedDestId)) as any;
      }
      const querySnapshot = await getDocs(q);
      setHotels(querySnapshot.docs.map((d) => normalizeDestination(d)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (rawData: any) => {
    try {
      const data = await fitPayloadUnder1MB(rawData);
      if (editingHotel) {
        await updateDoc(doc(db, 'vip_trips_hotels', editingHotel.id), data);
      } else {
        await addDoc(collection(db, 'vip_trips_hotels'), data);
      }
      setIsModalOpen(false);
      setEditingHotel(null);
      await fetchHotels();
    } catch (error: any) {
      alert('حدث خطأ أثناء الحفظ: ' + formatFirestoreError(error));
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف عرض VIP هذا؟')) {
      try {
        await deleteDoc(doc(db, 'vip_trips_hotels', id));
        await fetchHotels();
      } catch (error: any) {
        console.error(error);
        alert('تعذر الحذف: ' + formatFirestoreError(error));
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-900" dir="rtl">
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${params.locale}/admin`} className="hover:text-primary transition-colors">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        <span className="text-gray-900 font-bold">عروض وفنادق VIP</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-amber-200/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">عروض وفنادق VIP الحصرية</h1>
            <p className="text-gray-500 mt-0.5">إدارة الفنادق والرحلات الفاخرة لقسم VIP</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <select
            value={selectedDestId}
            onChange={(e) => setSelectedDestId(e.target.value)}
            className="border border-gray-200 rounded-xl p-3 bg-gray-50 text-gray-900 outline-none min-w-[200px] font-medium"
          >
            <option value="all">جميع الوجهات</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameAr}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setEditingHotel(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-amber-600 text-amber-300 hover:text-white px-6 py-3 rounded-xl font-bold transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            إضافة عرض VIP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              </div>
            </div>
          ))
        ) : hotels.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
            لا توجد عروض VIP في هذه الوجهة حالياً.
          </div>
        ) : (
          hotels.map((hotel) => {
            const destName = destinations.find((d) => d.id === hotel.destinationId)?.nameAr || 'غير محدد';
            const base = Number(hotel.price || 0);
            const disc = Number(hotel.discountPrice || 0);
            const hasDiscount = disc > 0 && base > disc;
            return (
              <div key={hotel.id} className="bg-white rounded-2xl shadow-sm border border-amber-200/70 overflow-hidden flex flex-col">
                <div className="h-48 relative bg-gray-100">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img src={hotel.images[0]} alt={hotel.nameAr} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-gray-900/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                    {hotel.stars} نجوم
                  </div>
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow">
                      تخفيض -{disc.toLocaleString('fr-DZ')} د.ج
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{hotel.nameAr}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{destName}{hotel.zone ? ` • ${hotel.zone}` : ''}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">يبدأ من</p>
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 line-through">{base.toLocaleString('fr-DZ')} د.ج</span>
                          <span className="font-bold text-emerald-600">{(base - disc).toLocaleString('fr-DZ')} د.ج</span>
                        </div>
                      ) : (
                        <p className="font-bold text-primary">{hotel.price} د.ج</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingHotel(hotel);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hotel.id)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <VIPHotelModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingHotel}
          destinations={destinations}
          defaultDestinationId={selectedDestId !== 'all' ? selectedDestId : ''}
          onCreateDestination={handleCreateDestination}
        />
      )}
    </div>
  );
}

export default function VIPHotelsAdmin({ params }: { params: { locale: string } }) {
  return (
    <Suspense fallback={<div className="p-12 text-center">جاري التحميل...</div>}>
      <VIPHotelsAdminContent params={params} />
    </Suspense>
  );
}
