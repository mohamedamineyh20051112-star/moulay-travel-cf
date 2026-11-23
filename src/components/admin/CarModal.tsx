'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CarModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState({
    brand: '',
    nameAr: '',
    nameFr: '',
    gearbox: 'Auto',
    year: '',
    startingPrice: '',
    images: [] as string[]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        brand: initialData.brand || '',
        nameAr: initialData.nameAr || '',
        nameFr: initialData.nameFr || '',
        gearbox: initialData.gearbox || 'Auto',
        year: initialData.year || '',
        startingPrice: initialData.startingPrice || '',
        images: initialData.images || []
      });
    } else {
      setFormData({
        brand: '', nameAr: '', nameFr: '', gearbox: 'Auto',
        year: '', startingPrice: '', images: []
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">إضافة/تعديل سيارة</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({...formData, startingPrice: Number(formData.startingPrice || 0)}); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">العلامة التجارية</label>
              <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full border p-2 rounded-lg" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">السنة</label>
              <input required type="text" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="w-full border p-2 rounded-lg" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">اسم السيارة</label>
            <input required type="text" value={formData.nameFr} onChange={e => setFormData({...formData, nameFr: e.target.value})} className="w-full border p-2 rounded-lg" dir="ltr" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">علبة السرعة</label>
              <select value={formData.gearbox} onChange={e => setFormData({...formData, gearbox: e.target.value})} className="w-full border p-2 rounded-lg" dir="ltr">
                <option value="Auto">Automatique</option>
                <option value="Man">Manuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">تسعيرة الحجز لليوم الواحد (د.ج)</label>
              <input required type="number" value={formData.startingPrice} onChange={e => setFormData({...formData, startingPrice: e.target.value})} className="w-full border p-2 rounded-lg" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">صور السيارة</label>
            <div className="bg-gray-50 p-4 rounded-xl border flex flex-col items-center">
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition">
                <span className="text-sm text-gray-500 mb-2">اختر صورة</span>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      let width = img.width, height = img.height;
                      const maxSize = 1200;
                      if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
                      else if (height > maxSize) { width *= maxSize / height; height = maxSize; }
                      canvas.width = width; canvas.height = height;
                      const ctx = canvas.getContext('2d');
                      ctx?.drawImage(img, 0, 0, width, height);
                      setFormData({...formData, images: [...formData.images, canvas.toDataURL('image/jpeg', 0.7)]});
                    };
                    img.src = event.target?.result as string;
                  };
                  reader.readAsDataURL(file);
                }} className="hidden" />
              </label>
              <div className="flex gap-2 overflow-x-auto mt-2 w-full">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0">
                    <img src={img} className="w-full h-full object-cover rounded-lg border"/>
                    <button type="button" onClick={()=>setFormData({...formData, images: formData.images.filter((_, idx)=>idx!==i)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold">حفظ</button>
        </form>
      </div>
    </div>
  );
}

