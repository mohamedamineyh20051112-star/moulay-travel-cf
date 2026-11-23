'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Percent, Car, Building2, MapPin, Search } from 'lucide-react';
import Image from 'next/image';

export default function DiscountsAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [discountPriceEuro, setDiscountPriceEuro] = useState<number | ''>('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [carsSnap, hammamsSnap, tripsSnap, omraSnap] = await Promise.all([
        getDocs(collection(db, 'cars')),
        getDocs(collection(db, 'hammams')),
        getDocs(collection(db, 'organized_trips_hotels')),
        getDocs(collection(db, 'omraHotels'))
      ]);

      const allItems = [
        ...carsSnap.docs.map(d => ({ id: d.id, _collection: 'cars', ...d.data() })),
        ...hammamsSnap.docs.map(d => ({ id: d.id, _collection: 'hammams', ...d.data() })),
        ...tripsSnap.docs.map(d => ({ id: d.id, _collection: 'organized_trips_hotels', ...d.data() })),
        ...omraSnap.docs.map(d => ({ id: d.id, _collection: 'omraHotels', ...d.data() }))
      ];

      setItems(allItems);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setDiscountPrice(item.discountPrice || '');
    setDiscountPriceEuro(item.discountPriceEuro || '');
    setIsInstallment(item.isInstallment || false);
  };

  const saveDiscount = async (item: any) => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, item._collection, item.id), {
        discountPrice: discountPrice === '' ? null : Number(discountPrice),
        discountPriceEuro: discountPriceEuro === '' ? null : Number(discountPriceEuro),
        isInstallment: isInstallment
      });
      await fetchData();
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter(item => {
    const searchStr = `${item.nameAr || ''} ${item.nameFr || ''} ${item.brand || ''} ${item.model || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const getCollectionName = (col: string) => {
    switch(col) {
      case 'cars': return 'سيارة';
      case 'hammams': return 'حمام';
      case 'organized_trips_hotels': return 'رحلة منظمة';
      case 'omraHotels': return 'عمرة';
      default: return 'خدمة';
    }
  };

  const getCollectionIcon = (col: string) => {
    switch(col) {
      case 'cars': return <Car className="w-5 h-5 text-blue-500" />;
      case 'hammams': return <MapPin className="w-5 h-5 text-green-500" />;
      case 'organized_trips_hotels': return <Building2 className="w-5 h-5 text-purple-500" />;
      case 'omraHotels': return <Building2 className="w-5 h-5 text-orange-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">إدارة التخفيضات والتقسيط</h1>
          <p className="text-gray-500">ابحث عن أي خدمة وأضف لها تخفيضاً أو فعّل نظام التقسيط لتظهر في صفحة العروض.</p>
        </div>
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex shrink-0 items-center justify-center">
          <Percent className="w-8 h-8" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="ابحث عن سيارة، فندق، حمام، أو رحلة..." 
            className="w-full outline-none text-gray-700 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map(item => {
            const hasDiscount = item.discountPrice || item.discountPriceEuro || item.isInstallment;
            const name = item.nameAr || item.nameFr || `${item.brand || ''} ${item.model || ''}`;
            const isEditing = editingId === item.id;
            const images = item.images || item.roomImages || item.foodImages || [];
            const imgUrl = images.length > 0 ? images[0] : null;

            return (
              <div key={`${item._collection}_${item.id}`} className={`bg-white rounded-2xl p-4 md:p-6 border ${hasDiscount ? 'border-green-200 bg-green-50/30' : 'border-gray-100'} shadow-sm flex flex-col md:flex-row items-center gap-6`}>
                
                {/* Image & Info */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    {imgUrl ? (
                      <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      getCollectionIcon(item._collection)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-medium">{getCollectionName(item._collection)}</span>
                      {hasDiscount && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-bold">عرض مفعل</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                    <p className="text-sm text-gray-500">السعر الأصلي: {item.price ? `${item.price} د.ج` : 'غير محدد'}</p>
                  </div>
                </div>

                {/* Actions / Editing */}
                <div className="w-full md:w-auto shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {isEditing ? (
                    <div className="flex flex-col gap-3 min-w-[250px]">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">سعر التخفيض (د.ج)</label>
                        <input type="number" className="w-full p-2 border rounded-lg" value={discountPrice} onChange={e=>setDiscountPrice(e.target.value)} placeholder="مثال: 20000" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">سعر التخفيض (يورو)</label>
                        <input type="number" className="w-full p-2 border rounded-lg" value={discountPriceEuro} onChange={e=>setDiscountPriceEuro(e.target.value)} placeholder="مثال: 50" />
                      </div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={isInstallment} onChange={e=>setIsInstallment(e.target.checked)} className="w-4 h-4 text-primary" />
                        متاح بالتقسيط؟
                      </label>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => saveDiscount(item)} disabled={isSaving} className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition-colors">
                          {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:items-end gap-3 min-w-[200px]">
                      {hasDiscount ? (
                        <div className="text-right">
                          {item.discountPrice && <div className="text-green-600 font-bold">التخفيض: {item.discountPrice} د.ج</div>}
                          {item.discountPriceEuro && <div className="text-green-600 font-bold">باليورو: {item.discountPriceEuro} €</div>}
                          {item.isInstallment && <div className="text-blue-600 font-bold">التقسيط: مفعل</div>}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm mb-2">لا يوجد تخفيض</div>
                      )}
                      <button onClick={() => startEdit(item)} className="w-full bg-primary/10 text-primary py-2 px-4 rounded-lg font-bold hover:bg-primary/20 transition-colors">
                        تعديل العرض
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
          
          {filteredItems.length === 0 && (
            <div className="text-center p-12 text-gray-500">لا توجد خدمات مطابقة للبحث.</div>
          )}
        </div>
      )}
    </div>
  );
}
