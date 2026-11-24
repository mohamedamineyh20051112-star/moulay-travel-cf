'use client';
import { normalizeDestination, normalizeDestinations } from '@/lib/normalize';
import { useState, useEffect, Suspense } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight, Plus, Pencil, Trash2, MapPin, Building2, Star } from 'lucide-react';
import HammamModal from '@/components/admin/HammamModal';
import { fitPayloadUnder1MB, formatFirestoreError } from '@/lib/smartImageCompress';

function HammamsAdminContent({ params }: { params: { locale: string } }) {
  const searchParams = useSearchParams();
  const destinationId = searchParams.get('destinationId');
  
  const [hammams, setHammams] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHammam, setEditingHammam] = useState<any>(null);
  const [selectedDestId, setSelectedDestId] = useState<string>(destinationId || 'all');

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    fetchHammams();
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

  const handleCreateDestination = async (data: { nameAr: string; nameFr: string; nameEn?: string; image: string; countryCode?: string }) => {
    try {
      const payload: Record<string, any> = await fitPayloadUnder1MB({
        nameAr: data.nameAr,
        nameFr: data.nameFr || data.nameAr,
        nameEn: data.nameEn || data.nameFr || data.nameAr,
        image: data.image || '',
        images: data.image ? [data.image] : [],
        ...(data.countryCode ? { countryCode: data.countryCode.toLowerCase() } : {}),
      });
      const docRef = await addDoc(collection(db, 'services_destinations'), payload);
      await fetchDestinations();
      return docRef.id;
    } catch (error: any) {
      alert("حدث خطأ أثناء إنشاء الوجهة: " + formatFirestoreError(error));
      return null;
    }
  };

  const fetchHammams = async () => {
    setIsLoading(true);
    try {
      let q = collection(db, 'hammams');
      if (selectedDestId !== 'all') {
        q = query(q, where('destinationId', '==', selectedDestId)) as any;
      }
      const querySnapshot = await getDocs(q);
      const hammamsData = querySnapshot.docs.map(doc => normalizeDestination(doc));
      setHammams(hammamsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (rawData: any) => {
    try {
      const data = await fitPayloadUnder1MB(rawData);
      if (editingHammam) {
        await updateDoc(doc(db, 'hammams', editingHammam.id), data);
      } else {
        await addDoc(collection(db, 'hammams'), data);
      }
      setIsModalOpen(false);
      setEditingHammam(null);
      await fetchHammams();
    } catch (error: any) {
      alert("حدث خطأ أثناء الحفظ: " + formatFirestoreError(error));
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحمام/الرحلة؟')) {
      try {
        await deleteDoc(doc(db, 'hammams', id));
        await fetchHammams();
      } catch (error: any) {
        console.error(error);
        alert("تعذر الحذف: " + formatFirestoreError(error));
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
        <span className="text-gray-900 font-medium">الحمامات والمنتجعات</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الحمامات والمنتجعات المعدنية</h1>
          <p className="text-gray-500 mt-1">إدارة الحمامات والمحطات المعدنية وعروض الاستجمام</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <select
            value={selectedDestId}
            onChange={(e) => setSelectedDestId(e.target.value)}
            className="border border-gray-200 rounded-xl p-3 bg-gray-50 text-gray-900 outline-none min-w-[200px] font-medium"
          >
            <option value="all">جميع الوجهات</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.nameAr}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setEditingHammam(null);
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            إضافة حمام/رحلة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              </div>
            </div>
          ))
        ) : hammams.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
            لا توجد فنادق أو برامج في هذه الوجهة.
          </div>
        ) : (
          hammams.map((hammam) => {
            const destName = destinations.find(d => d.id === hammam.destinationId)?.nameAr || 'غير محدد';
            const base = Number(hammam.price || 0);
            const disc = Number(hammam.discountPrice || 0);
            const hasDiscount = disc > 0 && base > disc;
            return (
              <div key={hammam.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="h-48 relative bg-gray-100">
                  {hammam.images && hammam.images.length > 0 ? (
                    <img src={hammam.images[0]} alt={hammam.nameAr} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Star className="w-3 h-3 text-gold fill-gold" />
                    {hammam.stars} نجوم
                  </div>
                  {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow">
                      تخفيض -{disc.toLocaleString('fr-DZ')} د.ج
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{hammam.nameAr}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{destName}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">يبدأ من</p>
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 line-through">{base.toLocaleString('fr-DZ')} د.ج</span>
                          <span className="font-bold text-emerald-600">{(base - disc).toLocaleString('fr-DZ')} د.ج</span>
                        </div>
                      ) : (
                        <p className="font-bold text-primary">{hammam.price} د.ج</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingHammam(hammam);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hammam.id)}
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
        <HammamModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingHammam}
          destinations={destinations}
          defaultDestinationId={selectedDestId !== 'all' ? selectedDestId : ''}
          onCreateDestination={handleCreateDestination}
        />
      )}
    </div>
  );
}

export default function HammamsListAdmin({ params }: { params: { locale: string } }) {
  return (
    <Suspense fallback={<div className="p-12 text-center">جاري التحميل...</div>}>
      <HammamsAdminContent params={params} />
    </Suspense>
  );
}
