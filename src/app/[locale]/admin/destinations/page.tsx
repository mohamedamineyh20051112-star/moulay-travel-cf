'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight, Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import DestinationModal from '@/components/admin/DestinationModal';

export default function DestinationsAdmin({ params }: { params: { locale: string } }) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<any>(null);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'topDestinations'));
      const data = querySnapshot.docs.map((doc): any => ({ id: doc.id, ...doc.data() }));
      setDestinations(data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الوجهة؟')) {
      await deleteDoc(doc(db, 'topDestinations', id));
      fetchDestinations();
    }
  };

  const handleSave = async (data: any) => {
    if (editingDest) {
      await updateDoc(doc(db, 'topDestinations', editingDest.id), data);
    } else {
      await addDoc(collection(db, 'topDestinations'), data);
    }
    fetchDestinations();
  };

  const openAddModal = () => {
    setEditingDest(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dest: any) => {
    setEditingDest(dest);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-gray-500 mb-6">
          <Link href={`/${params.locale}/admin`} className="hover:text-primary">لوحة التحكم</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">أكثر الوجهات مبيعاً</span>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">إدارة الوجهات المبيعة</h1>
          <button 
            onClick={openAddModal}
            className="bg-primary hover:bg-gold text-white px-6 py-3 rounded-xl font-bold transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> إضافة وجهة جديدة
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : destinations.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border shadow-sm overflow-x-auto">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600">لا توجد وجهات حالياً</h3>
            <p className="text-gray-400 mt-2">قم بإضافة أول وجهة سياحية لتعرض في الصفحة الرئيسية</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map(dest => (
              <div key={dest.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="h-48 relative overflow-hidden bg-gray-200">
                  {dest.image ? (
                    <img src={dest.image} alt="dest" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400"><MapPin className="w-10 h-10" /></div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">{dest.title?.ar}</h3>
                  <div className="text-sm text-gray-500 mb-4 flex justify-between">
                    <span>{dest.priceDzd} دج</span>
                    <span>{dest.days} أيام</span>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t">
                    <button 
                      onClick={() => openEditModal(dest)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors"
                    >
                      <Pencil className="w-4 h-4" /> تعديل
                    </button>
                    <button 
                      onClick={() => handleDelete(dest.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg font-medium flex justify-center items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DestinationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingDest}
      />
    </div>
  );
}
