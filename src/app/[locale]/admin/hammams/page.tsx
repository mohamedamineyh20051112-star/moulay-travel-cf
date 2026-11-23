'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight, Plus, Trash2, Edit } from 'lucide-react';
import HammamModal from '@/components/admin/HammamModal';

export default function HammamsAdminPage({ params }: { params: { locale: string } }) {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const fetchItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'hammams'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  const handleSave = async (data: any) => {
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'hammams', editingItem.id), data);
      } else {
        await addDoc(collection(db, 'hammams'), data);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من الحذف؟')) {
      await deleteDoc(doc(db, 'hammams', id));
      fetchItems();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir={params.locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">إدارة الحمامات</h1>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          إضافة حمام
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow border overflow-hidden">
            <div className="h-48 bg-gray-100 relative">
              {item.images?.[0] && <img src={item.images[0]} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{item.nameAr}</h3>
              <p className="text-gray-600 text-sm">{item.state} - {item.municipality}</p>
              <p className="text-gold font-bold mt-2">{item.startingPrice} د.ج</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg">تعديل</button>
                <button onClick={() => handleDelete(item.id)} className="bg-red-50 text-red-600 p-2 rounded-lg"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <HammamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingItem} />
    </div>
  );
}
