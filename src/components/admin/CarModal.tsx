'use client';
import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  CustomServiceFeature,
  getDefaultEnabledFeatureIds,
} from '@/data/serviceFeatures';
import FeaturesToggleEditor from '@/components/admin/FeaturesToggleEditor';
import { autoTranslateTexts } from '@/lib/translateClient';

export default function CarModal({ isOpen, onClose, onSave, initialData }: any) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    nameAr: '',
    nameFr: '',
    nameEn: '',
    gearbox: 'Auto',
    fuel: '',
    seats: '5',
    year: '',
    startingPrice: '',
    images: [] as string[],
  });

  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(
    getDefaultEnabledFeatureIds('cars')
  );
  const [customFeatures, setCustomFeatures] = useState<CustomServiceFeature[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        brand: initialData.brand || '',
        nameAr: initialData.nameAr || '',
        nameFr: initialData.nameFr || '',
        nameEn: initialData.nameEn || '',
        gearbox: initialData.gearbox || 'Auto',
        fuel: initialData.fuel || '',
        seats: String(initialData.seats || '5'),
        year: String(initialData.year || ''),
        startingPrice: String(initialData.startingPrice || ''),
        images: initialData.images || [],
      });
      setEnabledFeatures(
        Array.isArray(initialData.enabledFeatures)
          ? initialData.enabledFeatures
          : getDefaultEnabledFeatureIds('cars')
      );
      setCustomFeatures(Array.isArray(initialData.customFeatures) ? initialData.customFeatures : []);
    } else {
      setFormData({
        brand: '',
        nameAr: '',
        nameFr: '',
        nameEn: '',
        gearbox: 'Auto',
        fuel: 'Essence',
        seats: '5',
        year: '',
        startingPrice: '',
        images: [],
      });
      setEnabledFeatures(getDefaultEnabledFeatureIds('cars'));
      setCustomFeatures([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalNameFr = formData.nameFr.trim();
      let finalNameEn = formData.nameEn.trim();
      const sourceName = formData.nameAr.trim() || finalNameFr;

      if (formData.nameAr.trim() && (!finalNameFr || !finalNameEn)) {
        const [trFr, trEn] = await Promise.all([
          finalNameFr
            ? Promise.resolve([finalNameFr])
            : autoTranslateTexts([formData.nameAr.trim()], 'fr', 'ar'),
          finalNameEn
            ? Promise.resolve([finalNameEn])
            : autoTranslateTexts([formData.nameAr.trim()], 'en', 'ar'),
        ]);
        finalNameFr = finalNameFr || trFr[0] || formData.nameAr.trim();
        finalNameEn = finalNameEn || trEn[0] || finalNameFr;
      }

      const translatedCustom = await Promise.all(
        customFeatures.map(async (cf) => {
          if (!cf.ar) return cf;
          const [frArr, enArr] = await Promise.all([
            cf.fr ? Promise.resolve([cf.fr]) : autoTranslateTexts([cf.ar], 'fr', 'ar'),
            cf.en ? Promise.resolve([cf.en]) : autoTranslateTexts([cf.ar], 'en', 'ar'),
          ]);
          return {
            ...cf,
            fr: cf.fr || frArr[0] || cf.ar,
            en: cf.en || enArr[0] || cf.fr || cf.ar,
          };
        })
      );

      await onSave({
        ...formData,
        nameAr: formData.nameAr.trim() || sourceName,
        nameFr: finalNameFr || sourceName,
        nameEn: finalNameEn || finalNameFr || sourceName,
        startingPrice: Number(formData.startingPrice || 0),
        featuresConfigured: true,
        enabledFeatures,
        customFeatures: translatedCustom,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-3 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'تعديل سيارة' : 'إضافة سيارة جديدة'}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">العلامة التجارية</label>
              <input
                required
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="Ex: Renault / Peugeot"
                className="w-full border p-2 rounded-lg"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">السنة</label>
              <input
                required
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="2025"
                className="w-full border p-2 rounded-lg"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">اسم الموديل (بالعربية)</label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                placeholder="مثال: كليو 5"
                className="w-full border p-2 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">اسم الموديل (بالفرنسية / الإنجليزية)</label>
              <input
                type="text"
                value={formData.nameFr}
                onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                placeholder="Ex: Clio 5 Alpine (تترجم تلقائياً إذا تركت فارغة)"
                className="w-full border p-2 rounded-lg"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">علبة السرعة</label>
              <select
                value={formData.gearbox}
                onChange={(e) => setFormData({ ...formData, gearbox: e.target.value })}
                className="w-full border p-2 rounded-lg"
                dir="ltr"
              >
                <option value="Auto">Automatique</option>
                <option value="Man">Manuelle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">الوقود</label>
              <input
                type="text"
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                placeholder="Essence / Diesel"
                className="w-full border p-2 rounded-lg"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">المقاعد</label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                className="w-full border p-2 rounded-lg"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">السعر لليوم (د.ج)</label>
              <input
                required
                type="number"
                value={formData.startingPrice}
                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                className="w-full border p-2 rounded-lg"
                dir="ltr"
              />
            </div>
          </div>

          <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            السعر بالأورو يتم حسابه وعرضه تلقائياً من السعر بالدينار حسب إعدادات الموقع وسعر الصرف.
          </p>

          <FeaturesToggleEditor
            category="cars"
            enabledFeatures={enabledFeatures}
            customFeatures={customFeatures}
            onChangeEnabled={setEnabledFeatures}
            onChangeCustom={setCustomFeatures}
          />

          <div>
            <label className="block text-sm font-medium mb-1">صور السيارة</label>
            <div className="bg-gray-50 p-4 rounded-xl border flex flex-col items-center">
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition">
                <span className="text-sm text-gray-500 mb-1">اختر صورة</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width,
                          height = img.height;
                        const maxSize = 1200;
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
                        setFormData({
                          ...formData,
                          images: [...formData.images, canvas.toDataURL('image/jpeg', 0.75)],
                        });
                      };
                      img.src = (event.target?.result as string) || '';
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>
              <div className="flex gap-2 overflow-x-auto mt-2 w-full">
                {formData.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0">
                    <img src={img} alt="Car" className="w-full h-full object-cover rounded-lg border" />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          images: formData.images.filter((_, idx) => idx !== i),
                        })
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-gold text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            {saving ? 'جاري الحفظ والترجمة التلقائية...' : 'حفظ السيارة'}
          </button>
        </form>
      </div>
    </div>
  );
}
