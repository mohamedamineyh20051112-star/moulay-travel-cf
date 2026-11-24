'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Percent, Car, Building2, MapPin, Search, Crown } from 'lucide-react';
import { useCurrencyStore, convertDzdToEur } from '@/store/useCurrencyStore';

function getItemBasePrice(item: any): number {
  return Number(item.price || item.startingPrice || item.priceStartDzd || 0);
}

function getItemName(item: any): string {
  const brandModel = `${item.brand || ''} ${item.model || ''}`.trim();
  const base =
    item.name?.ar ||
    item.nameAr ||
    item.name?.fr ||
    item.nameFr ||
    brandModel;
  return brandModel && item.nameAr && !String(item.nameAr).includes(item.brand || '')
    ? `${brandModel} - ${item.nameAr}`
    : base || 'خدمة بدون اسم';
}

function getItemThumb(item: any): string | null {
  if (item.image) return item.image;
  const images = item.images || item.roomImages || item.foodImages || [];
  return images.length > 0 ? images[0] : null;
}

export default function DiscountsAdminPage() {
  const { dzdPerEur } = useCurrencyStore();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [discountPrice, setDiscountPrice] = useState<string | number>('');
  const [isInstallment, setIsInstallment] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [carsSnap, hammamsSnap, tripsSnap, vipSnap, omraSnap] = await Promise.all([
        getDocs(collection(db, 'cars')),
        getDocs(collection(db, 'hammams')),
        getDocs(collection(db, 'organized_trips_hotels')),
        getDocs(collection(db, 'vip_trips_hotels')),
        getDocs(collection(db, 'omraHotels')),
      ]);

      const allItems = [
        ...vipSnap.docs.map((d): any => ({ id: d.id, _collection: 'vip_trips_hotels', ...d.data() })),
        ...tripsSnap.docs.map((d): any => ({ id: d.id, _collection: 'organized_trips_hotels', ...d.data() })),
        ...omraSnap.docs.map((d): any => ({ id: d.id, _collection: 'omraHotels', ...d.data() })),
        ...hammamsSnap.docs.map((d): any => ({ id: d.id, _collection: 'hammams', ...d.data() })),
        ...carsSnap.docs.map((d): any => ({ id: d.id, _collection: 'cars', ...d.data() })),
      ];

      setItems(allItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (item: any) => {
    setEditingKey(`${item._collection}_${item.id}`);
    setDiscountPrice(item.discountPrice || '');
    setIsInstallment(Boolean(item.isInstallment));
  };

  const saveDiscount = async (item: any) => {
    const basePrice = getItemBasePrice(item);
    const parsedDiscount = discountPrice === '' ? null : Number(discountPrice);

    if (parsedDiscount !== null) {
      if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
        alert('قيمة التخفيض يجب أن تكون موجبة');
        return;
      }
      if (basePrice > 0 && parsedDiscount >= basePrice) {
        alert('سعر التخفيض يجب أن يكون أقل من السعر الأصلي');
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateDoc(doc(db, item._collection, item.id), {
        discountPrice: parsedDiscount,
        isInstallment,
      });
      await fetchData();
      setEditingKey(null);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const searchStr = `${getItemName(item)} ${item.nameFr || ''} ${item.brand || ''} ${item.model || ''}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const getCollectionName = (col: string) => {
    switch (col) {
      case 'vip_trips_hotels':
        return 'رحلات VIP';
      case 'cars':
        return 'سيارة';
      case 'hammams':
        return 'حمام / منتجع';
      case 'organized_trips_hotels':
        return 'رحلة منظمة';
      case 'omraHotels':
        return 'عمرة';
      default:
        return 'خدمة';
    }
  };

  const getCollectionIcon = (col: string) => {
    switch (col) {
      case 'vip_trips_hotels':
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 'cars':
        return <Car className="w-5 h-5 text-blue-500" />;
      case 'hammams':
        return <MapPin className="w-5 h-5 text-green-500" />;
      case 'organized_trips_hotels':
        return <Building2 className="w-5 h-5 text-purple-500" />;
      case 'omraHotels':
        return <Building2 className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto text-gray-900" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">إدارة التخفيضات والتقسيط</h1>
          <p className="text-gray-500">
            أضف قيمة التخفيض بالدينار الجزائري أو فعّل التقسيط لتظهر الخدمة تلقائياً في صفحة العروض، مع تحويل تلقائي لليورو.
          </p>
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
            placeholder="ابحث عن سيارة، فندق، حمام، رحلة VIP أو منظمة..."
            className="w-full outline-none text-gray-700 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => {
            const key = `${item._collection}_${item.id}`;
            const hasDiscount = Number(item.discountPrice || 0) > 0 || item.isInstallment;
            const name = getItemName(item);
            const isEditing = editingKey === key;
            const imgUrl = getItemThumb(item);
            const basePrice = getItemBasePrice(item);

            return (
              <div
                key={key}
                className={`bg-white rounded-2xl p-4 md:p-6 border ${
                  hasDiscount ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
                } shadow-sm flex flex-col md:flex-row items-center gap-6`}
              >
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
                      <span className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-semibold">
                        {getCollectionName(item._collection)}
                      </span>
                      {hasDiscount && (
                        <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-md font-bold">
                          عرض مفعل
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                    <p className="text-sm text-gray-500">
                      السعر الأصلي:{' '}
                      {basePrice > 0
                        ? `${basePrice.toLocaleString('fr-DZ')} د.ج (~ ${convertDzdToEur(basePrice, dzdPerEur)} €)`
                        : 'غير محدد'}
                    </p>
                  </div>
                </div>

                {/* Actions / Editing */}
                <div className="w-full md:w-auto shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {isEditing ? (
                    <div className="flex flex-col gap-3 min-w-[260px]">
                      <div>
                        <label className="text-xs text-gray-600 font-bold mb-1 block">
                          قيمة التخفيض (د.ج — يُطرح من السعر الأصلي)
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="w-full p-2 border rounded-lg bg-white font-bold"
                          value={discountPrice}
                          onChange={(e) => setDiscountPrice(e.target.value)}
                          placeholder="مثال: 20000"
                        />
                        {Number(discountPrice) > 0 && (
                          <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                            قيمة الخصم باليورو تلقائياً (~ {convertDzdToEur(Number(discountPrice), dzdPerEur)} €)
                          </p>
                        )}
                      </div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInstallment}
                          onChange={(e) => setIsInstallment(e.target.checked)}
                          className="w-4 h-4 text-primary"
                        />
                        متاح بالتقسيط؟
                      </label>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => saveDiscount(item)}
                          disabled={isSaving}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                        >
                          {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <button
                          onClick={() => setEditingKey(null)}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:items-end gap-3 min-w-[200px]">
                      {hasDiscount ? (
                        <div className="text-right">
                          {Number(item.discountPrice || 0) > 0 && (
                            <div className="text-green-600 font-bold">
                              التخفيض: {Number(item.discountPrice).toLocaleString('fr-DZ')} د.ج (
                              {convertDzdToEur(Number(item.discountPrice), dzdPerEur)} €)
                            </div>
                          )}
                          {item.isInstallment && <div className="text-blue-600 font-bold">التقسيط: مفعل</div>}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm mb-2">لا يوجد تخفيض</div>
                      )}
                      <button
                        onClick={() => startEdit(item)}
                        className="w-full bg-primary/10 text-primary py-2 px-4 rounded-lg font-bold hover:bg-primary/20 transition-colors"
                      >
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
