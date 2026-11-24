'use client';
import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Plus, Trash2, MapPin, Plane, BedDouble, CheckCircle, Sparkles } from 'lucide-react';
import DestinationPicker from '@/components/admin/DestinationPicker';
import FeaturesToggleEditor from '@/components/admin/FeaturesToggleEditor';
import { CustomServiceFeature, getDefaultEnabledFeatureIds } from '@/data/serviceFeatures';
import { autoTranslateTexts } from '@/lib/translateClient';
import { useCurrencyStore, convertDzdToEur, parseNumericPrice } from '@/store/useCurrencyStore';

interface VIPHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  destinations: any[];
  defaultDestinationId?: string;
  onCreateDestination?: (data: { nameAr: string; nameFr?: string; nameEn?: string; image?: string; countryCode?: string }) => Promise<string | null>;
}

const TABS = [
  { id: 'basic', label: 'الأساسية والصور', icon: MapPin },
  { id: 'rooms', label: 'الغرف والمزايا', icon: BedDouble },
  { id: 'program', label: 'البرنامج السياحي', icon: CheckCircle },
  { id: 'flights', label: 'جداول الرحلات', icon: Plane },
];

export default function VIPHotelModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  destinations,
  defaultDestinationId,
  onCreateDestination,
}: VIPHotelModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { dzdPerEur } = useCurrencyStore();

  // Tab 1: Basic Info
  const [destinationId, setDestinationId] = useState(initialData?.destinationId || defaultDestinationId || '');
  const [newDestNameAr, setNewDestNameAr] = useState('');
  const [newDestNameFr, setNewDestNameFr] = useState('');
  const [newDestImage, setNewDestImage] = useState('');
  const [newDestCode, setNewDestCode] = useState('');

  const [nameAr, setNameAr] = useState(initialData?.nameAr || '');
  const [nameFr, setNameFr] = useState(initialData?.nameFr || '');
  const [nameEn, setNameEn] = useState(initialData?.nameEn || '');
  const [zone, setZone] = useState(initialData?.zone || '');
  const [googleMapsLink, setGoogleMapsLink] = useState(initialData?.googleMapsLink || '');
  const [stars, setStars] = useState(initialData?.stars || 5);
  const [price, setPrice] = useState(initialData?.price || '');
  const [days, setDays] = useState(initialData?.days || 7);
  const [descriptionAr, setDescriptionAr] = useState(initialData?.descriptionAr || '');
  const [descriptionFr, setDescriptionFr] = useState(initialData?.descriptionFr || '');
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn || '');

  // Images
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [roomImages, setRoomImages] = useState<string[]>(initialData?.roomImages || []);
  const [foodImages, setFoodImages] = useState<string[]>(initialData?.foodImages || []);

  // Tab 2: Rooms, Food & Features
  const [roomPrices, setRoomPrices] = useState<any[]>(initialData?.roomPrices || []);
  const [hasFood, setHasFood] = useState(initialData?.hasFood !== false);
  const [foodTypeAr, setFoodTypeAr] = useState(initialData?.foodTypeAr || 'فطور الصباح');
  const [foodTypeFr, setFoodTypeFr] = useState(initialData?.foodTypeFr || 'Petit déjeuner');
  const [hasTransport, setHasTransport] = useState(initialData?.hasTransport !== false);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(
    Array.isArray(initialData?.enabledFeatures) ? initialData.enabledFeatures : getDefaultEnabledFeatureIds('vip_trips')
  );
  const [customFeatures, setCustomFeatures] = useState<CustomServiceFeature[]>(
    Array.isArray(initialData?.customFeatures) ? initialData.customFeatures : []
  );

  // Tab 3: Program
  const [program, setProgram] = useState<any[]>(initialData?.program || []);

  // Tab 4: Flights/Schedules
  const [schedules, setSchedules] = useState<any[]>(initialData?.schedules || []);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('basic');
    setDestinationId(initialData?.destinationId || defaultDestinationId || '');
    setNewDestNameAr('');
    setNewDestNameFr('');
    setNewDestImage('');
    setNewDestCode('');
    setNameAr(initialData?.nameAr || '');
    setNameFr(initialData?.nameFr || '');
    setNameEn(initialData?.nameEn || '');
    setZone(initialData?.zone || '');
    setGoogleMapsLink(initialData?.googleMapsLink || '');
    setStars(initialData?.stars || 5);
    setPrice(initialData?.price || '');
    setDays(initialData?.days || 7);
    setDescriptionAr(initialData?.descriptionAr || '');
    setDescriptionFr(initialData?.descriptionFr || '');
    setDescriptionEn(initialData?.descriptionEn || '');
    setImages(initialData?.images || []);
    setRoomImages(initialData?.roomImages || []);
    setFoodImages(initialData?.foodImages || []);
    setRoomPrices(initialData?.roomPrices || []);
    setHasFood(initialData?.hasFood !== false);
    setFoodTypeAr(initialData?.foodTypeAr || 'فطور الصباح');
    setFoodTypeFr(initialData?.foodTypeFr || 'Petit déjeuner');
    setHasTransport(initialData?.hasTransport !== false);
    setEnabledFeatures(
      Array.isArray(initialData?.enabledFeatures) ? initialData.enabledFeatures : getDefaultEnabledFeatureIds('vip_trips')
    );
    setCustomFeatures(Array.isArray(initialData?.customFeatures) ? initialData.customFeatures : []);
    setProgram(initialData?.program || []);
    setSchedules(initialData?.schedules || []);
  }, [isOpen, initialData, defaultDestinationId]);

  if (!isOpen) return null;

  const handleUploadCompressedImage = (
    file: File | undefined,
    onDone: (dataUrl: string) => void
  ) => {
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
        onDone(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = (event.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!destinationId) {
      alert('يرجى اختيار الوجهة أولاً');
      return;
    }
    setLoading(true);
    try {
      let finalDestId = destinationId;
      if (destinationId === 'NEW') {
        if (!newDestNameAr.trim()) {
          alert('يرجى إدخال اسم الوجهة الجديدة بالعربية');
          setLoading(false);
          return;
        }
        const [trDestFr, trDestEn] = await Promise.all([
          newDestNameFr.trim() ? Promise.resolve([newDestNameFr.trim()]) : autoTranslateTexts([newDestNameAr.trim()], 'fr', 'ar'),
          autoTranslateTexts([newDestNameAr.trim()], 'en', 'ar'),
        ]);
        if (onCreateDestination) {
          const createdId = await onCreateDestination({
            nameAr: newDestNameAr.trim(),
            nameFr: trDestFr[0] || newDestNameAr.trim(),
            nameEn: trDestEn[0] || trDestFr[0] || newDestNameAr.trim(),
            image: newDestImage,
            countryCode: newDestCode || undefined,
          });
          if (createdId) {
            finalDestId = createdId;
            setDestinationId(createdId);
          } else {
            setLoading(false);
            return;
          }
        }
      }

      // Auto-translate missing FR/EN fields from Arabic cleanly
      const [
        translatedBasicFr,
        translatedBasicEn,
        translatedRoomsFr,
        translatedRoomsEn,
        translatedProgFr,
        translatedProgEn,
        translatedSchedAirFr,
        translatedSchedAirEn,
        translatedSchedDepFr,
        translatedSchedDepEn,
        translatedSchedTypeFr,
        translatedSchedTypeEn,
        translatedCustFr,
        translatedCustEn,
      ] = await Promise.all([
        autoTranslateTexts([nameAr, descriptionAr, foodTypeAr], 'fr', 'ar'),
        autoTranslateTexts([nameAr, descriptionAr, foodTypeAr], 'en', 'ar'),
        autoTranslateTexts(roomPrices.map((r) => r.typeAr || ''), 'fr', 'ar'),
        autoTranslateTexts(roomPrices.map((r) => r.typeAr || ''), 'en', 'ar'),
        autoTranslateTexts(program.map((p) => p.ar || ''), 'fr', 'ar'),
        autoTranslateTexts(program.map((p) => p.ar || ''), 'en', 'ar'),
        autoTranslateTexts(schedules.map((s) => s.airline?.ar || ''), 'fr', 'ar'),
        autoTranslateTexts(schedules.map((s) => s.airline?.ar || ''), 'en', 'ar'),
        autoTranslateTexts(schedules.map((s) => s.departLoc?.ar || ''), 'fr', 'ar'),
        autoTranslateTexts(schedules.map((s) => s.departLoc?.ar || ''), 'en', 'ar'),
        autoTranslateTexts(schedules.map((s) => s.flightType?.ar || ''), 'fr', 'ar'),
        autoTranslateTexts(schedules.map((s) => s.flightType?.ar || ''), 'en', 'ar'),
        autoTranslateTexts(customFeatures.map((c) => c.ar || ''), 'fr', 'ar'),
        autoTranslateTexts(customFeatures.map((c) => c.ar || ''), 'en', 'ar'),
      ]);

      const finalNameFr = nameFr.trim() || translatedBasicFr[0] || nameAr;
      const finalNameEn = nameEn.trim() || translatedBasicEn[0] || finalNameFr;
      const finalDescFr = descriptionFr.trim() || translatedBasicFr[1] || descriptionAr;
      const finalDescEn = descriptionEn.trim() || translatedBasicEn[1] || finalDescFr;
      const finalFoodFr = foodTypeFr.trim() || translatedBasicFr[2] || foodTypeAr;
      const finalFoodEn = translatedBasicEn[2] || finalFoodFr;

      const cleanRooms = roomPrices.map((r, i) => ({
        typeAr: r.typeAr || '',
        typeFr: (r.typeFr || '').trim() || translatedRoomsFr[i] || r.typeAr || '',
        typeEn: (r.typeEn || '').trim() || translatedRoomsEn[i] || r.typeFr || r.typeAr || '',
        priceDzd: r.priceDzd || '',
      }));

      const cleanProgram = program.map((p, i) => ({
        ar: p.ar || '',
        fr: (p.fr || '').trim() || translatedProgFr[i] || p.ar || '',
        en: (p.en || '').trim() || translatedProgEn[i] || p.fr || p.ar || '',
      }));

      const cleanSchedules = schedules.map((sch, i) => ({
        departDate: sch.departDate || '',
        returnDate: sch.returnDate || '',
        departLoc: {
          ar: sch.departLoc?.ar || '',
          fr: (sch.departLoc?.fr || '').trim() || translatedSchedDepFr[i] || sch.departLoc?.ar || '',
          en: (sch.departLoc?.en || '').trim() || translatedSchedDepEn[i] || sch.departLoc?.fr || sch.departLoc?.ar || '',
        },
        flightType: {
          ar: sch.flightType?.ar || '',
          fr: (sch.flightType?.fr || '').trim() || translatedSchedTypeFr[i] || sch.flightType?.ar || '',
          en: (sch.flightType?.en || '').trim() || translatedSchedTypeEn[i] || sch.flightType?.fr || sch.flightType?.ar || '',
        },
        airline: {
          ar: sch.airline?.ar || '',
          fr: (sch.airline?.fr || '').trim() || translatedSchedAirFr[i] || sch.airline?.ar || '',
          en: (sch.airline?.en || '').trim() || translatedSchedAirEn[i] || sch.airline?.fr || sch.airline?.ar || '',
        },
        entry: sch.entry || { ar: '', fr: '' },
        exit: sch.exit || { ar: '', fr: '' },
      }));

      const cleanCustomFeatures: CustomServiceFeature[] = customFeatures.map((c, i) => ({
        id: c.id,
        ar: c.ar || '',
        fr: (c.fr || '').trim() || translatedCustFr[i] || c.ar || '',
        en: (c.en || '').trim() || translatedCustEn[i] || c.fr || c.ar || '',
      }));

      const hotelData = {
        destinationId: finalDestId,
        nameAr,
        nameFr: finalNameFr,
        nameEn: finalNameEn,
        stars: Number(stars),
        price: Number(price) || 0,
        days: Number(days) || 1,
        descriptionAr,
        descriptionFr: finalDescFr,
        descriptionEn: finalDescEn,
        zone,
        googleMapsLink,
        images,
        roomImages,
        foodImages,
        roomPrices: cleanRooms,
        hasFood,
        foodTypeAr,
        foodTypeFr: finalFoodFr,
        foodTypeEn: finalFoodEn,
        hasTransport,
        enabledFeatures,
        customFeatures: cleanCustomFeatures,
        program: cleanProgram,
        schedules: cleanSchedules,
      };

      await onSave(hotelData);
    } finally {
      setLoading(false);
    }
  };

  const previewEur = convertDzdToEur(parseNumericPrice(price), dzdPerEur);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-l from-amber-50 to-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {initialData ? 'تعديل عرض VIP' : 'إضافة رحلة / إقامة VIP حصرية'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-l p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id ? 'bg-gray-900 text-amber-300 shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Main Form Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white text-gray-900">
            {/* TAB 1: BASIC & IMAGES */}
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <DestinationPicker
                      destinations={destinations}
                      destinationId={destinationId}
                      newDestNameAr={newDestNameAr}
                      newDestNameFr={newDestNameFr}
                      newDestImage={newDestImage}
                      onSelectExisting={(id) => {
                        setDestinationId(id);
                        setNewDestCode('');
                      }}
                      onSelectPresetNew={(preset) => {
                        setDestinationId('NEW');
                        setNewDestNameAr(preset.nameAr);
                        setNewDestNameFr(preset.nameFr);
                        setNewDestImage(preset.image);
                        setNewDestCode(preset.code || '');
                      }}
                      onUpdateNewFields={(fields) => {
                        if (fields.nameAr !== undefined) setNewDestNameAr(fields.nameAr);
                        if (fields.nameFr !== undefined) setNewDestNameFr(fields.nameFr);
                        if (fields.image !== undefined) setNewDestImage(fields.image);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">النجوم</label>
                    <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="w-full border rounded-lg p-2.5 bg-white">
                      {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                        <option key={s} value={s}>{s} نجوم</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">عدد الأيام</label>
                    <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full border rounded-lg p-2.5" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">اسم الفندق / البرنامج (عربي) *</label>
                    <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="w-full border rounded-lg p-2.5" placeholder="مثال: منتجع ريكسوس الفاخر" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">الاسم بالفرنسية (يُترجم تلقائياً إن تُرك فارغاً)</label>
                    <input value={nameFr} onChange={(e) => setNameFr(e.target.value)} className="w-full border rounded-lg p-2.5" dir="ltr" placeholder="Ex: Rixos Luxury Resort" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">السعر المبدئي (د.ج)</label>
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full border rounded-lg p-2.5 font-bold"
                      placeholder="185000"
                    />
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      السعر باليورو يحسب تلقائياً في الموقع حسب سعر الصرف (~ {previewEur > 0 ? `${previewEur} €` : '0 €'})
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">المنطقة / المدينة (مثال: تقسيم، دبي مارينا)</label>
                    <input value={zone} onChange={(e) => setZone(e.target.value)} className="w-full border rounded-lg p-2.5" placeholder="مثال: وسط المدينة / الشاطئ الذهبي" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">رابط خرائط جوجل (Google Maps - اختياري)</label>
                    <input value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} className="w-full border rounded-lg p-2.5" dir="ltr" placeholder="https://maps.google.com/..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">وصف موجز (عربي)</label>
                    <textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} className="w-full border rounded-lg p-2.5 h-24" placeholder="أبرز مميزات هذه التجربة الفاخرة..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">وصف بالفرنسية (يُترجم تلقائياً إن تُرك فارغاً)</label>
                    <textarea value={descriptionFr} onChange={(e) => setDescriptionFr(e.target.value)} className="w-full border rounded-lg p-2.5 h-24" dir="ltr" placeholder="Optionnel - traduit automatiquement" />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h3 className="font-bold mb-3">الصور (انقر لرفع صورة)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Main Images */}
                    <div className="bg-gray-50 p-4 rounded-xl border flex flex-col items-center">
                      <label className="block text-sm font-bold mb-2 w-full text-center">صور الواجهة/الخارج</label>
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleUploadCompressedImage(e.target.files?.[0], (url) => setImages((prev) => [...prev, url]))
                          }
                          className="hidden"
                        />
                      </label>
                      <div className="flex gap-2 overflow-x-auto mt-2 w-full">
                        {images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 shrink-0">
                            <img src={img} className="w-full h-full object-cover rounded-lg border" alt="" />
                            <button
                              type="button"
                              onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Room Images */}
                    <div className="bg-gray-50 p-4 rounded-xl border flex flex-col items-center">
                      <label className="block text-sm font-bold mb-2 w-full text-center">صور الأجنحة والغرف</label>
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleUploadCompressedImage(e.target.files?.[0], (url) => setRoomImages((prev) => [...prev, url]))
                          }
                          className="hidden"
                        />
                      </label>
                      <div className="flex gap-2 overflow-x-auto mt-2 w-full">
                        {roomImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 shrink-0">
                            <img src={img} className="w-full h-full object-cover rounded-lg border" alt="" />
                            <button
                              type="button"
                              onClick={() => setRoomImages(roomImages.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Food Images */}
                    <div className="bg-gray-50 p-4 rounded-xl border flex flex-col items-center">
                      <label className="block text-sm font-bold mb-2 w-full text-center">صور المطعم والضيافة</label>
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleUploadCompressedImage(e.target.files?.[0], (url) => setFoodImages((prev) => [...prev, url]))
                          }
                          className="hidden"
                        />
                      </label>
                      <div className="flex gap-2 overflow-x-auto mt-2 w-full">
                        {foodImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 shrink-0">
                            <img src={img} className="w-full h-full object-cover rounded-lg border" alt="" />
                            <button
                              type="button"
                              onClick={() => setFoodImages(foodImages.filter((_, idx) => idx !== i))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROOMS, FOOD & TOGGLEABLE FEATURES */}
            {activeTab === 'rooms' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold">أسعار وأنواع الغرف والأجنحة</h3>
                      <p className="text-xs text-gray-500">أدخل السعر بالدينار فقط، ويتم التحويل لليورو تلقائياً</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRoomPrices([...roomPrices, { typeAr: '', typeFr: '', priceDzd: '' }])}
                      className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> إضافة غرفة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {roomPrices.map((room, idx) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-gray-50 p-2.5 rounded-xl border">
                        <input
                          value={room.typeAr || ''}
                          onChange={(e) => {
                            const n = [...roomPrices];
                            n[idx] = { ...n[idx], typeAr: e.target.value };
                            setRoomPrices(n);
                          }}
                          placeholder="النوع (عربي)"
                          className="flex-1 min-w-[140px] p-2 border rounded bg-white"
                        />
                        <input
                          value={room.typeFr || ''}
                          onChange={(e) => {
                            const n = [...roomPrices];
                            n[idx] = { ...n[idx], typeFr: e.target.value };
                            setRoomPrices(n);
                          }}
                          placeholder="النوع (فرنسي - اختياري)"
                          className="flex-1 min-w-[140px] p-2 border rounded bg-white"
                          dir="ltr"
                        />
                        <input
                          type="number"
                          min={0}
                          value={room.priceDzd || ''}
                          onChange={(e) => {
                            const n = [...roomPrices];
                            n[idx] = { ...n[idx], priceDzd: e.target.value };
                            setRoomPrices(n);
                          }}
                          placeholder="السعر دج"
                          className="w-32 p-2 border rounded bg-white font-bold"
                        />
                        <span className="text-xs text-emerald-700 font-semibold px-1.5 shrink-0">
                          ~ {convertDzdToEur(parseNumericPrice(room.priceDzd), dzdPerEur)} €
                        </span>
                        <button
                          type="button"
                          onClick={() => setRoomPrices(roomPrices.filter((_, i) => i !== idx))}
                          className="text-red-500 p-2 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {roomPrices.length === 0 && <p className="text-gray-400 text-center py-4">لم تقم بإضافة غرف بعد</p>}
                  </div>
                </div>

                <div className="pt-6 border-t space-y-4">
                  <h3 className="font-bold">الإطعام والنقل</h3>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                    <input type="checkbox" checked={hasFood} onChange={(e) => setHasFood(e.target.checked)} className="w-5 h-5 text-primary" />
                    <span className="font-medium">الإطعام متوفر في هذا العرض؟</span>
                  </label>
                  {hasFood && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
                      <div>
                        <label className="block text-sm mb-1">نوع الإطعام (عربي)</label>
                        <input value={foodTypeAr} onChange={(e) => setFoodTypeAr(e.target.value)} className="w-full border rounded-lg p-2" />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">نوع الإطعام (فرنسي)</label>
                        <input value={foodTypeFr} onChange={(e) => setFoodTypeFr(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr" />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                    <input type="checkbox" checked={hasTransport} onChange={(e) => setHasTransport(e.target.checked)} className="w-5 h-5 text-primary" />
                    <span className="font-medium">توفير خدمات النقل الخاص (Transfert VIP)</span>
                  </label>
                </div>

                <div className="pt-6 border-t">
                  <FeaturesToggleEditor
                    category="vip_trips"
                    enabledFeatures={enabledFeatures}
                    customFeatures={customFeatures}
                    onChangeEnabled={setEnabledFeatures}
                    onChangeCustom={setCustomFeatures}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: PROGRAM */}
            {activeTab === 'program' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">برنامج الرحلة خطوة بخطوة / الأيام</h3>
                    <button
                      type="button"
                      onClick={() => setProgram([...program, { ar: '', fr: '' }])}
                      className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> إضافة خطوة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {program.map((p, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mt-1 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 space-y-2">
                          <input
                            value={p.ar || ''}
                            onChange={(e) => {
                              const n = [...program];
                              n[idx] = { ...n[idx], ar: e.target.value };
                              setProgram(n);
                            }}
                            placeholder="مثال: اليوم الأول: الاستقبال بسيارة خاصة والتسكين..."
                            className="w-full p-2 border rounded bg-white"
                          />
                          <input
                            value={p.fr || ''}
                            onChange={(e) => {
                              const n = [...program];
                              n[idx] = { ...n[idx], fr: e.target.value };
                              setProgram(n);
                            }}
                            placeholder="Ex: Jour 1: Accueil VIP... (optionnel)"
                            className="w-full p-2 border rounded bg-white"
                            dir="ltr"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setProgram(program.filter((_, i) => i !== idx))}
                          className="text-red-500 p-2 mt-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    {program.length === 0 && <p className="text-gray-400 text-center py-4">لا توجد خطوات مضافة</p>}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: FLIGHTS */}
            {activeTab === 'flights' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">جداول وتواريخ الرحلة</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setSchedules([
                        ...schedules,
                        {
                          departLoc: { ar: 'الجزائر', fr: 'Alger' },
                          departDate: '',
                          returnDate: '',
                          flightType: { ar: 'مباشرة', fr: 'Directe' },
                          entry: { ar: '', fr: '' },
                          exit: { ar: '', fr: '' },
                          airline: { ar: '', fr: '' },
                        },
                      ])
                    }
                    className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> إضافة جدول / تاريخ جديد
                  </button>
                </div>

                {schedules.map((sch, idx) => (
                  <div key={idx} className="bg-gray-50 border rounded-xl p-4 relative mb-4">
                    <button
                      type="button"
                      onClick={() => setSchedules(schedules.filter((_, i) => i !== idx))}
                      className="absolute top-4 left-4 text-red-500 hover:bg-red-50 p-2 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <h4 className="font-bold mb-4 text-primary border-b pb-2">جدول الرحلة #{idx + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">تاريخ الذهاب</label>
                        <input
                          value={sch.departDate || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], departDate: e.target.value };
                            setSchedules(n);
                          }}
                          placeholder="15 Oct 2026"
                          className="w-full border rounded p-2 bg-white"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">تاريخ الرجوع</label>
                        <input
                          value={sch.returnDate || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], returnDate: e.target.value };
                            setSchedules(n);
                          }}
                          placeholder="22 Oct 2026"
                          className="w-full border rounded p-2 bg-white"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">الخطوط (عربي)</label>
                        <input
                          value={sch.airline?.ar || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], airline: { ...(n[idx].airline || {}), ar: e.target.value } };
                            setSchedules(n);
                          }}
                          placeholder="الخطوط الجوية الجزائرية"
                          className="w-full border rounded p-2 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">الخطوط (فرنسي - اختياري)</label>
                        <input
                          value={sch.airline?.fr || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], airline: { ...(n[idx].airline || {}), fr: e.target.value } };
                            setSchedules(n);
                          }}
                          placeholder="Air Algérie"
                          className="w-full border rounded p-2 bg-white"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">مطار المغادرة</label>
                        <input
                          value={sch.departLoc?.ar || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], departLoc: { ...(n[idx].departLoc || {}), ar: e.target.value } };
                            setSchedules(n);
                          }}
                          className="w-full border rounded p-2 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">نوع الرحلة</label>
                        <input
                          value={sch.flightType?.ar || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], flightType: { ...(n[idx].flightType || {}), ar: e.target.value } };
                            setSchedules(n);
                          }}
                          placeholder="مباشرة / درجة رجال الأعمال"
                          className="w-full border rounded p-2 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {schedules.length === 0 && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">
                    لم تقم بإضافة أي جداول رحلات. يمكنك إضافة تواريخ متعددة!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-200">
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || !nameAr || !destinationId}
            className="px-8 py-2 bg-gray-900 text-amber-300 rounded-xl font-bold hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'جاري الترجمة والحفظ...' : 'حفظ عرض VIP'}
          </button>
        </div>
      </div>
    </div>
  );
}
