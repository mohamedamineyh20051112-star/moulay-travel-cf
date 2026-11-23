'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight, Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import OmraHotelModal from '@/components/admin/OmraHotelModal';

export default function OmraHotelsAdmin({ params }: { params: { locale: string } }) {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<any>(null);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'omraHotels'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHotels(data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفندق نهائياً؟')) {
      await deleteDoc(doc(db, 'omraHotels', id));
      fetchHotels();
    }
  };

  const handleSaveHotel = async (hotelData: any) => {
    if (editingHotel) {
      await updateDoc(doc(db, 'omraHotels', editingHotel.id), hotelData);
    } else {
      await addDoc(collection(db, 'omraHotels'), hotelData);
    }
    fetchHotels();
  };

  const openAddModal = () => {
    setEditingHotel(null);
    setIsModalOpen(true);
  };

  const openEditModal = (hotel: any) => {
    setEditingHotel(hotel);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center gap-2 text-gray-500 mb-6">
          <Link href={`/${params.locale}/admin`} className="hover:text-primary">لوحة التحكم</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">فنادق العمرة</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">إدارة فنادق العمرة</h1>
          <button 
            onClick={openAddModal}
            className="flex w-full sm:w-auto justify-center items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-gold transition-colors"
          >
            <Plus className="w-5 h-5" />
            إضافة فندق جديد
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500 font-medium text-lg">جاري تحميل الفنادق...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                <tr>
                  <th className="py-4 px-6">الصورة</th>
                  <th className="py-4 px-6">اسم الفندق</th>
                  <th className="py-4 px-6">الكود</th>
                  <th className="py-4 px-6">السعر يبدأ من (دج)</th>
                  <th className="py-4 px-6">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {hotels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">لا توجد فنادق حالياً. اضغط على "إضافة فندق جديد" للبدء!</td>
                  </tr>
                ) : (
                  hotels.map(hotel => (
                    <tr key={hotel.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-6">
                        {hotel.image ? (
                          <img src={hotel.image} alt="hotel" className="w-16 h-12 object-cover rounded-lg shadow-sm" />
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-6 font-bold text-gray-800">{hotel.name?.ar || hotel.name?.fr || 'بدون اسم'}</td>
                      <td className="py-3 px-6 text-gray-500">{hotel.code}</td>
                      <td className="py-3 px-6 text-primary font-bold">{hotel.priceStartDzd} دج</td>
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openEditModal(hotel)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDelete(hotel.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <OmraHotelModal 
          isOpen={isModalOpen}
          initialData={editingHotel}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveHotel}
        />
      )}
    </div>
  );
}
