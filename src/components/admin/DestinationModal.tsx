'use client';
import { useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

interface DestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

export default function DestinationModal({ isOpen, onClose, onSave, initialData }: DestinationModalProps) {
  const [loading, setLoading] = useState(false);
  const [titleAr, setTitleAr] = useState(initialData?.title?.ar || '');
  const [titleFr, setTitleFr] = useState(initialData?.title?.fr || '');
  const [titleEn, setTitleEn] = useState(initialData?.title?.en || '');
  const [descAr, setDescAr] = useState(initialData?.desc?.ar || '');
  const [descFr, setDescFr] = useState(initialData?.desc?.fr || '');
  const [descEn, setDescEn] = useState(initialData?.desc?.en || '');
  const [priceDzd, setPriceDzd] = useState(initialData?.priceDzd || '');
  const [priceEur, setPriceEur] = useState(initialData?.priceEur || '');
  const [days, setDays] = useState(initialData?.days || 7);
  const [image, setImage] = useState(initialData?.image || '');

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        const maxSize = 800;
        if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
        else if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setImage(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    await onSave({
      title: { ar: titleAr, fr: titleFr, en: titleEn },
      desc: { ar: descAr, fr: descFr, en: descEn },
      priceDzd,
      priceEur,
      days: Number(days),
      image
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-primary">{initialData ? 'تعديل الوجهة' : 'إضافة وجهة جديدة'}</h2>
          <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm mb-1">الاسم (عربي)</label><input value={titleAr} onChange={e=>setTitleAr(e.target.value)} placeholder="إسطنبول، تركيا" className="w-full border rounded-lg p-2" /></div>
            <div><label className="block text-sm mb-1">الاسم (فرنسي)</label><input value={titleFr} onChange={e=>setTitleFr(e.target.value)} placeholder="Istanbul, Turquie" className="w-full border rounded-lg p-2" dir="ltr" /></div>
            <div><label className="block text-sm mb-1">الوصف القصير (عربي)</label><input value={descAr} onChange={e=>setDescAr(e.target.value)} placeholder="أفضل العروض العائلية" className="w-full border rounded-lg p-2" /></div>
            <div><label className="block text-sm mb-1">الوصف القصير (فرنسي)</label><input value={descFr} onChange={e=>setDescFr(e.target.value)} placeholder="Meilleures offres familiales" className="w-full border rounded-lg p-2" dir="ltr" /></div>
            <div><label className="block text-sm mb-1">السعر (دج)</label><input value={priceDzd} onChange={e=>setPriceDzd(e.target.value)} placeholder="85000" className="w-full border rounded-lg p-2" /></div>
            <div><label className="block text-sm mb-1">السعر (يورو)</label><input value={priceEur} onChange={e=>setPriceEur(e.target.value)} placeholder="350" className="w-full border rounded-lg p-2" /></div>
            <div><label className="block text-sm mb-1">عدد الأيام</label><input type="number" value={days} onChange={e=>setDays(Number(e.target.value))} className="w-full border rounded-lg p-2" /></div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-bold mb-3">صورة الوجهة</h3>
            <div className="border rounded-xl p-4 text-center bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden h-48">
              {image ? (
                <>
                  <img src={image} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                  <button onClick={(e) => {e.stopPropagation(); setImage('')}} className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full"><X className="w-4 h-4"/></button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-600">اختر صورة جذابة للوجهة</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-200">إلغاء</button>
          <button onClick={handleSave} disabled={loading || !titleAr || !priceDzd} className="px-8 py-2 bg-primary text-white rounded-xl font-bold hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? 'جاري الحفظ...' : 'حفظ الوجهة'}
          </button>
        </div>
      </div>
    </div>
  );
}

