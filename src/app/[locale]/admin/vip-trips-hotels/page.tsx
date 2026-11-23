'use client';
import { normalizeDestination, normalizeDestinations } from '@/lib/normalize';
import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Plus, Pencil, Trash2, MapPin, Building2, Star } from 'lucide-react';
import VIPHotelModal from '@/components/admin/VIPHotelModal';

function OTHotelsAdminContent({ params }: { params: { locale: string } }) {
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
      const destsData = querySnapshot.docs.map(d => normalizeDestination(d));
      setDestinations(destsData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateDestination = async (destData: { nameAr: string, nameFr?: string, image?: string }) => {
    try {
      const docRef = await addDoc(collection(db, 'services_destinations'), {
        nameAr: destData.nameAr,
        nameFr: destData.nameFr || destData.nameAr,
        images: destData.image ? [destData.image] : [],
        image: destData.image || ''
      });
      await fetchDestinations();
      return docRef.id;
    } catch (error: any) {
      alert("حدث خطأ أثناء إنشاء الوجهة: " + error.message);
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
      const hotelsData = querySnapshot.docs.map(doc => normalizeDestination(doc));
      setHotels(hotelsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (rawData: any) => {
    try {
      const data = JSON.parse(JSON.stringify(rawData, (k, v) => v === undefined ? null : v));
      if (editingHotel) {
        await updateDoc(doc(db, 'vip_trips_hotels', editingHotel.id), data);
      } else {
        await addDoc(collection(db, 'vip_trips_hotels'), data);
      }
      setIsModalOpen(false);
      setEditingHotel(null);
      fetchHotels();
    } catch (error: any) {
      alert("حدث خطأ أثناء الحفظ: " + error.message);
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفندق/الرحلة؟')) {
      try {
        await deleteDoc(doc(db, 'vip_trips_hotels', id));
        fetchHotels();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir={params.locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${params.locale}/admin`} className="hover:text-primary transition-colors">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        <span className="text-white font-medium">فنادق وبرامج الرحلات</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-white">فنادق وبرامج الرحلات</h1>
          <p className="text-gray-400 mt-1">إدارة الفنادق والعروض للرحلات المنظمة</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <select 
            value={selectedDestId}
            onChange={(e) => setSelectedDestId(e.target.value)}
            className="border rounded-xl p-3 bg-gray-900 focus:bg-gray-800 outline-none min-w-[200px]"
          >
            <option value="all">جميع الوجهات</option>
            {destinations.map(d => (
              <option key={d.id} value={d.id}>{d.nameAr}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setEditingHotel(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            إضافة فندق/رحلة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              </div>
            </div>
          ))
        ) : hotels.length === 0 ? (
          <div className="col-span-full bg-gray-800 p-12 rounded-2xl shadow-sm border border-gray-700 text-center text-gray-400">
            لا توجد فنادق أو برامج في هذه الوجهة.
          </div>
        ) : (
          hotels.map((hotel) => {
            const destName = destinations.find(d => d.id === hotel.destinationId)?.nameAr || 'غير محدد';
            return (
              <div key={hotel.id} className="bg-gray-800 rounded-2xl shadow-sm border border-gray-700 overflow-hidden flex flex-col">
                <div className="h-48 relative bg-gray-800">
                  {hotel.images && hotel.images.length > 0 ? (
                    <img src={hotel.images[0]} alt={hotel.nameAr} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-gray-800/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-300 flex items-center gap-1">
                    <Star className="w-3 h-3 text-gold fill-gold" />
                    {hotel.stars} نجوم
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-white mb-1">{hotel.nameAr}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{destName}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">يبدأ من</p>
                      <p className="font-bold text-primary">{hotel.price} د.ج</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingHotel(hotel);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-600 rounded-lg transition-colors"
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

export default function OTHotelsAdmin({ params }: { params: { locale: string } }) {
  return (
    <Suspense fallback={<div className="p-12 text-center">جاري التحميل...</div>}>
      <OTHotelsAdminContent params={params} />
    </Suspense>
  );
}
