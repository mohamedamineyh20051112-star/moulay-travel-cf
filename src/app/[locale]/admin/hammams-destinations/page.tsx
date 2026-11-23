'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight, Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import OTDestinationModal from '@/components/admin/OTDestinationModal';

export default function OTDestinationsAdmin({ params }: { params: { locale: string } }) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<any>(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'hammams_destinations'));
      const destsData = querySnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setDestinations(destsData);
    } catch (error) {
      console.error("Error fetching destinations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingDest) {
        await updateDoc(doc(db, 'hammams_destinations', editingDest.id), data);
      } else {
        await addDoc(collection(db, 'hammams_destinations'), data);
      }
      setIsModalOpen(false);
      setEditingDest(null);
      fetchDestinations();
    } catch (error) {
      console.error("Error saving destination:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوجهة؟ سيتم حذف جميع الفنادق المرتبطة بها.')) {
      try {
        await deleteDoc(doc(db, 'hammams_destinations', id));
        fetchDestinations();
      } catch (error) {
        console.error("Error deleting destination:", error);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir={params.locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${params.locale}/admin`} className="hover:text-primary transition-colors">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        <span className="text-gray-900 font-medium">وجهات الرحلات المنظمة</span>
      </div>

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">وجهات الرحلات المنظمة</h1>
          <p className="text-gray-500 mt-1">إدارة البلدان والوجهات الخاصة بالرحلات المنظمة</p>
        </div>
        <button
          onClick={() => {
            setEditingDest(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة وجهة جديدة
        </button>
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
        ) : destinations.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
            لا توجد وجهات حالياً. قم بإضافة وجهة جديدة.
          </div>
        ) : (
          destinations.map((dest) => (
            <div key={dest.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="h-48 relative overflow-hidden bg-gray-100">
                {dest.image ? (
                  <img src={dest.image} alt={dest.nameAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 right-4 left-4">
                  <h3 className="text-xl font-bold text-white mb-1">{dest.nameAr}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-200">
                    {dest.countryAr && <span>{dest.countryAr}</span>}
                  </div>
                </div>
              </div>
              <div className="p-4 flex gap-2">
                <Link
                  href={`/${params.locale}/admin/hammams-list?destinationId=${dest.id}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  الفنادق
                </Link>
                <button
                  onClick={() => {
                    setEditingDest(dest);
                    setIsModalOpen(true);
                  }}
                  className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(dest.id)}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <OTDestinationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={editingDest}
        />
      )}
    </div>
  );
}
