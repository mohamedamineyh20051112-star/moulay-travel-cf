'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight, Plus, Trash2, Edit } from 'lucide-react';
import CarModal from '@/components/admin/CarModal';
import { fitPayloadUnder1MB, formatFirestoreError } from '@/lib/smartImageCompress';

export default function CarsAdminPage({ params }: { params: { locale: string } }) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'cars'));
      const data = snapshot.docs.map((doc): any => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSave = async (rawData: any) => {
    try {
      const data = await fitPayloadUnder1MB(rawData);
      if (editingItem) {
        await updateDoc(doc(db, 'cars', editingItem.id), data);
      } else {
        await addDoc(collection(db, 'cars'), data);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      await fetchItems();
    } catch (error: any) {
      console.error(error);
      alert('تعذر حفظ السيارة: ' + formatFirestoreError(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من الحذف؟')) {
      try {
        await deleteDoc(doc(db, 'cars', id));
        await fetchItems();
      } catch (error: any) {
        console.error(error);
        alert('تعذر حذف السيارة: ' + formatFirestoreError(error));
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir={params.locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <Link href={`/${params.locale}/admin`} className="hover:text-primary transition-colors">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        <span className="text-gray-900 font-medium">إدارة السيارات</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">إدارة السيارات</h1>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl flex w-full sm:w-auto justify-center items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          إضافة سيارة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => {
          const base = Number(item.startingPrice || 0);
          const disc = Number(item.discountPrice || 0);
          const hasDiscount = disc > 0 && base > disc;
          return (
            <div key={item.id} className="bg-white rounded-2xl shadow border overflow-hidden">
              <div className="h-48 bg-gray-100 relative">
                {item.images?.[0] && <img src={item.images[0]} className="w-full h-full object-cover" />}
                {hasDiscount && (
                  <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                    تخفيض -{disc.toLocaleString('fr-DZ')} د.ج
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{item.brand} {item.nameFr}</h3>
                <p className="text-gray-600 text-sm">{item.year} - {item.gearbox}</p>
                {hasDiscount ? (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400 line-through">{base.toLocaleString('fr-DZ')} د.ج</span>
                    <span className="text-emerald-600 font-bold">{(base - disc).toLocaleString('fr-DZ')} د.ج</span>
                  </div>
                ) : (
                  <p className="text-gold font-bold mt-2">{base.toLocaleString('fr-DZ')} د.ج</p>
                )}
                <div className="flex gap-2 mt-4">
                  <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg">تعديل</button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-50 text-red-600 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <CarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingItem} />
    </div>
  );
}
