'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import {
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  X,
  Search,
  Globe,
  Image as ImageIcon,
  Loader2,
  Check,
} from 'lucide-react';
import {
  filterLocalWorldDestinations,
  searchGlobalCountries,
  WorldDestinationPreset,
} from '@/data/worldDestinations';
import { autoTranslateTexts } from '@/lib/translateClient';

export default function ServicesDestinationsAdmin({ params }: { params: { locale: string } }) {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Modal fields
  const [nameAr, setNameAr] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [image, setImage] = useState('');

  // Preset/Global search
  const [searchQuery, setSearchQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<WorldDestinationPreset[] | null>(null);
  const [searchingGlobal, setSearchingGlobal] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'services_destinations'));
      const destsData = querySnapshot.docs.map((d): any => ({ id: d.id, ...d.data() }));
      setDestinations(destsData);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDest(null);
    setNameAr('');
    setNameFr('');
    setNameEn('');
    setCountryCode('');
    setImage('');
    setSearchQuery('');
    setGlobalResults(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dest: any) => {
    setEditingDest(dest);
    setNameAr(dest.nameAr || '');
    setNameFr(dest.nameFr || '');
    setNameEn(dest.nameEn || '');
    setCountryCode(dest.countryCode || '');
    setImage(dest.image || '');
    setSearchQuery('');
    setGlobalResults(null);
    setIsModalOpen(true);
  };

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearchingGlobal(true);
    try {
      const results = await searchGlobalCountries(searchQuery.trim());
      setGlobalResults(results);
    } finally {
      setSearchingGlobal(false);
    }
  };

  const applyPreset = (preset: WorldDestinationPreset) => {
    setNameAr(preset.nameAr);
    setNameFr(preset.nameFr);
    setNameEn(preset.nameEn);
    setCountryCode(preset.code);
    if (!image || image.startsWith('/flags/')) {
      setImage(preset.flag);
    }
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 900;
        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setImage(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = (event.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!nameAr.trim()) {
      alert('يرجى إدخال اسم الوجهة بالعربية');
      return;
    }
    setSaving(true);
    try {
      const [trFr, trEn] = await Promise.all([
        nameFr.trim()
          ? Promise.resolve([nameFr.trim()])
          : autoTranslateTexts([nameAr.trim()], 'fr', 'ar'),
        nameEn.trim()
          ? Promise.resolve([nameEn.trim()])
          : autoTranslateTexts([nameAr.trim()], 'en', 'ar'),
      ]);

      const payload: Record<string, any> = {
        nameAr: nameAr.trim(),
        nameFr: trFr[0] || nameAr.trim(),
        nameEn: trEn[0] || trFr[0] || nameAr.trim(),
        image: image || (countryCode ? `/flags/${countryCode.toLowerCase()}.svg` : ''),
      };
      if (countryCode.trim()) {
        payload.countryCode = countryCode.trim().toLowerCase();
      }

      if (editingDest) {
        await updateDoc(doc(db, 'services_destinations', editingDest.id), payload);
      } else {
        await addDoc(collection(db, 'services_destinations'), payload);
      }

      setIsModalOpen(false);
      setEditingDest(null);
      await fetchDestinations();
    } catch (error) {
      console.error('Error saving destination:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الوجهة؟')) {
      try {
        await deleteDoc(doc(db, 'services_destinations', id));
        fetchDestinations();
      } catch (error) {
        console.error('Error deleting destination:', error);
      }
    }
  };

  const displayedPresets =
    globalResults !== null ? globalResults : filterLocalWorldDestinations(searchQuery);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href={`/${params.locale}/admin`} className="hover:text-primary transition-colors">
          لوحة التحكم
        </Link>
        <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        <span className="text-gray-900 font-medium">الوجهات والدول (رحلات، حمامات، VIP)</span>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الوجهات والدول الموحدة</h1>
          <p className="text-gray-500 mt-1">
            اختر من دول العالم أو أضف وجهة مخصصة للرحلات المنظمة و VIP والحمامات
          </p>
        </div>
        <button
          onClick={openAddModal}
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
              <div className="h-48 bg-gray-200" />
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
              </div>
            </div>
          ))
        ) : destinations.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
            لا توجد وجهات حالياً. قم بإضافة وجهة جديدة.
          </div>
        ) : (
          destinations.map((dest) => {
            const flagSrc = dest.countryCode
              ? `/flags/${String(dest.countryCode).toLowerCase()}.svg`
              : null;
            return (
              <div key={dest.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group">
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  {dest.image ? (
                    <img
                      src={dest.image}
                      alt={dest.nameAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-0.5">{dest.nameAr}</h3>
                      {dest.nameFr && <p className="text-xs text-gray-200" dir="ltr">{dest.nameFr}</p>}
                    </div>
                    {flagSrc && (
                      <img
                        src={flagSrc}
                        alt=""
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                        className="w-8 h-6 rounded object-cover border border-white/40 shadow"
                      />
                    )}
                  </div>
                </div>
                <div className="p-4 flex gap-2">
                  <button
                    onClick={() => openEditModal(dest)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors font-medium"
                  >
                    <Pencil className="w-4 h-4" /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(dest.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" /> حذف
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* World Destination Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-gray-900">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {editingDest ? 'تعديل الوجهة' : 'إضافة وجهة / دولة جديدة'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Quick Country Search */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <label className="block text-sm font-bold text-gray-800">
                  بحث سريع في دول العالم (أو اكتب الوجهة يدوياً بالأسفل)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                    <input
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (!e.target.value.trim()) setGlobalResults(null);
                      }}
                      placeholder="ابحث بالعربية أو الفرنسية أو الإنجليزية (مثال: تركيا، اليابان، Maldives)..."
                      className="w-full pr-9 pl-3 py-2 border rounded-lg bg-white text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGlobalSearch}
                    disabled={searchingGlobal || !searchQuery.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    {searchingGlobal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                    بحث عالمي
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-44 overflow-y-auto pt-1">
                  {displayedPresets.slice(0, 24).map((preset) => {
                    const selected = countryCode.toLowerCase() === preset.code.toLowerCase();
                    return (
                      <button
                        key={`${preset.code}-${preset.nameAr}`}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-right text-xs transition ${
                          selected
                            ? 'bg-primary/10 border-primary text-primary font-bold'
                            : 'bg-white border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <img
                          src={preset.flag}
                          alt=""
                          className="w-5 h-3.5 object-cover rounded shrink-0"
                        />
                        <span className="truncate flex-1">{preset.nameAr}</span>
                        {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم الوجهة (عربي) *</label>
                  <input
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    placeholder="مثال: تركيا"
                    className="w-full border rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الاسم (فرنسي - يُترجم تلقائياً)</label>
                  <input
                    value={nameFr}
                    onChange={(e) => setNameFr(e.target.value)}
                    placeholder="Turquie"
                    className="w-full border rounded-lg p-2.5"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الاسم (إنجليزي - يُترجم تلقائياً)</label>
                  <input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Turkey"
                    className="w-full border rounded-lg p-2.5"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رمز الدولة (اختياري، مثل: tr)</label>
                  <input
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    placeholder="tr"
                    className="w-full border rounded-lg p-2.5 uppercase"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Image uploader */}
              <div>
                <label className="block text-sm font-bold mb-2">صورة غلاف الوجهة</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden h-44">
                  {image ? (
                    <>
                      <img src={image} alt="preview" className="w-full h-full object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setImage('')}
                        className="absolute top-3 left-3 bg-red-500 text-white p-1.5 rounded-full shadow"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 font-medium">اختر صورة عالية الجودة للوجهة</span>
                      <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-200"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !nameAr.trim()}
                className="px-8 py-2 bg-primary text-white rounded-xl font-bold hover:bg-gold transition-colors disabled:opacity-50"
              >
                {saving ? 'جاري الترجمة والحفظ...' : 'حفظ الوجهة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
