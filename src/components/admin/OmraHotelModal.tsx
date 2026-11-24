'use client';
import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Plus, Trash2, MapPin, Plane, BedDouble, CheckCircle } from 'lucide-react';
import FeaturesToggleEditor from '@/components/admin/FeaturesToggleEditor';
import { CustomServiceFeature, getDefaultEnabledFeatureIds } from '@/data/serviceFeatures';
import { autoTranslateTexts } from '@/lib/translateClient';
import { useCurrencyStore, convertDzdToEur, parseNumericPrice } from '@/store/useCurrencyStore';

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hotelData: any) => Promise<void>;
  initialData?: any;
}

const TABS = [
  { id: 'basic', label: 'الأساسية والصور', icon: MapPin },
  { id: 'rooms', label: 'الغرف والمزايا', icon: BedDouble },
  { id: 'program', label: 'البرنامج والمزارات', icon: CheckCircle },
  { id: 'flights', label: 'جداول الرحلات', icon: Plane },
];

const PREDEFINED_ZIYARAT = [
  { ar: 'جبل النور', fr: 'Jabal Al Nour', en: 'Jabal Al Nour', selected: true },
  { ar: 'جبل ثور', fr: 'Jabal Thawr', en: 'Jabal Thawr', selected: true },
  { ar: 'مسجد قباء', fr: 'Mosquée Quba', en: 'Quba Mosque', selected: true },
  { ar: 'جبل أحد', fr: 'Jabal Uhud', en: 'Mount Uhud', selected: true },
];

const PREDEFINED_PROGRAM = [
  { ar: 'استقبال في المطار', fr: "Accueil à l'aéroport", en: 'Airport welcome', selected: true },
  { ar: 'تسكين في الفندق', fr: "Installation à l'hôtel", en: 'Hotel check-in', selected: true },
  { ar: 'أداء مناسك العمرة', fr: 'Accomplissement de la Omra', en: 'Performing Umrah rituals', selected: true },
  { ar: 'وقت حر والزيارات', fr: 'Temps libre et visites', en: 'Free time & Ziyarat visits', selected: true },
];

export default function OmraHotelModal({ isOpen, onClose, onSave, initialData }: HotelModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const { dzdPerEur } = useCurrencyStore();

  const [shuttleAvailable, setShuttleAvailable] = useState(initialData?.shuttleAvailable || false);
  const [shuttleScheduleAr, setShuttleScheduleAr] = useState(initialData?.shuttleSchedule?.ar || '');
  const [shuttleScheduleFr, setShuttleScheduleFr] = useState(initialData?.shuttleSchedule?.fr || '');
  const [makkahHotelAr, setMakkahHotelAr] = useState(initialData?.makkahHotel?.ar || '');
  const [makkahHotelFr, setMakkahHotelFr] = useState(initialData?.makkahHotel?.fr || '');
  const [madinahHotelAr, setMadinahHotelAr] = useState(initialData?.madinahHotel?.ar || '');
  const [madinahHotelFr, setMadinahHotelFr] = useState(initialData?.madinahHotel?.fr || '');
  const [additionalNotesAr, setAdditionalNotesAr] = useState(initialData?.additionalNotes?.ar || '');
  const [additionalNotesFr, setAdditionalNotesFr] = useState(initialData?.additionalNotes?.fr || '');

  const [code, setCode] = useState(initialData?.code || '');
  const [nameAr, setNameAr] = useState(initialData?.name?.ar || '');
  const [nameFr, setNameFr] = useState(initialData?.name?.fr || '');
  const [googleMapsLink, setGoogleMapsLink] = useState(initialData?.googleMapsLink || '');
  const [stars, setStars] = useState(initialData?.stars || 5);
  const [regionAr, setRegionAr] = useState(initialData?.region?.ar || '');
  const [regionFr, setRegionFr] = useState(initialData?.region?.fr || '');
  const [distMakkah, setDistMakkah] = useState(initialData?.distanceMakkah || '');
  const [daysMakkah, setDaysMakkah] = useState(initialData?.daysMakkah || 7);
  const [daysMadinah, setDaysMadinah] = useState(initialData?.daysMadinah || 7);
  const [priceDzd, setPriceDzd] = useState(initialData?.priceStartDzd || '');

  // Images
  const [imageMain, setImageMain] = useState(initialData?.image || '');
  const [imageRooms, setImageRooms] = useState(initialData?.images?.rooms || '');
  const [imageRestaurant, setImageRestaurant] = useState(initialData?.images?.restaurant || '');
  const [imageServices, setImageServices] = useState(initialData?.images?.services || '');

  // Tab 2: Rooms, Food & Toggleable Features
  const [roomPrices, setRoomPrices] = useState<any[]>(initialData?.roomPrices || []);
  const [hasFood, setHasFood] = useState(!!initialData?.food);
  const [foodTypeAr, setFoodTypeAr] = useState(initialData?.food?.type?.ar || 'فطور الصباح');
  const [foodTypeFr, setFoodTypeFr] = useState(initialData?.food?.type?.fr || 'Petit déjeuner');
  const [hasTransport, setHasTransport] = useState<boolean>(() => {
    const ta = initialData?.transportAvailable;
    if (ta === true || ta === 'true') return true;
    if (ta === false || ta === 'false') return false;
    if (initialData?.includes?.ar) return initialData.includes.ar.includes('النقل');
    if (initialData?.includes?.fr) return initialData.includes.fr.includes('Transport');
    return false;
  });
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(
    Array.isArray(initialData?.enabledFeatures) ? initialData.enabledFeatures : getDefaultEnabledFeatureIds('omra')
  );
  const [customFeatures, setCustomFeatures] = useState<CustomServiceFeature[]>(
    Array.isArray(initialData?.customFeatures) ? initialData.customFeatures : []
  );

  // Tab 3: Ziyarat & Program
  const [ziyarat, setZiyarat] = useState<any[]>(initialData?.ziyarat || PREDEFINED_ZIYARAT);
  const [program, setProgram] = useState<any[]>(initialData?.program || PREDEFINED_PROGRAM);

  // Tab 4: Flights
  const [schedules, setSchedules] = useState<any[]>(initialData?.schedule || []);

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab('basic');
    setShuttleAvailable(initialData?.shuttleAvailable || false);
    setShuttleScheduleAr(initialData?.shuttleSchedule?.ar || '');
    setShuttleScheduleFr(initialData?.shuttleSchedule?.fr || '');
    setMakkahHotelAr(initialData?.makkahHotel?.ar || '');
    setMakkahHotelFr(initialData?.makkahHotel?.fr || '');
    setMadinahHotelAr(initialData?.madinahHotel?.ar || '');
    setMadinahHotelFr(initialData?.madinahHotel?.fr || '');
    setAdditionalNotesAr(initialData?.additionalNotes?.ar || '');
    setAdditionalNotesFr(initialData?.additionalNotes?.fr || '');
    setCode(initialData?.code || '');
    setNameAr(initialData?.name?.ar || '');
    setNameFr(initialData?.name?.fr || '');
    setGoogleMapsLink(initialData?.googleMapsLink || '');
    setStars(initialData?.stars || 5);
    setRegionAr(initialData?.region?.ar || '');
    setRegionFr(initialData?.region?.fr || '');
    setDistMakkah(initialData?.distanceMakkah || '');
    setDaysMakkah(initialData?.daysMakkah || 7);
    setDaysMadinah(initialData?.daysMadinah || 7);
    setPriceDzd(initialData?.priceStartDzd || '');
    setImageMain(initialData?.image || '');
    setImageRooms(initialData?.images?.rooms || '');
    setImageRestaurant(initialData?.images?.restaurant || '');
    setImageServices(initialData?.images?.services || '');
    setRoomPrices(initialData?.roomPrices || []);
    setHasFood(!!initialData?.food);
    setFoodTypeAr(initialData?.food?.type?.ar || 'فطور الصباح');
    setFoodTypeFr(initialData?.food?.type?.fr || 'Petit déjeuner');
    setEnabledFeatures(
      Array.isArray(initialData?.enabledFeatures) ? initialData.enabledFeatures : getDefaultEnabledFeatureIds('omra')
    );
    setCustomFeatures(Array.isArray(initialData?.customFeatures) ? initialData.customFeatures : []);
    setZiyarat(initialData?.ziyarat || PREDEFINED_ZIYARAT);
    setProgram(initialData?.program || PREDEFINED_PROGRAM);
    setSchedules(initialData?.schedule || []);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
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
        setter(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.src = (event.target?.result as string) || '';
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const activeZiyarat = ziyarat.filter((z) => z.selected !== false);
      const activeProgram = program.filter((p) => p.selected !== false);

      const [
        basicFr,
        basicEn,
        roomsFr,
        roomsEn,
        ziyaratFr,
        ziyaratEn,
        progFr,
        progEn,
        custFr,
        custEn,
      ] = await Promise.all([
        autoTranslateTexts(
          [nameAr, regionAr, makkahHotelAr, madinahHotelAr, additionalNotesAr, shuttleScheduleAr, foodTypeAr],
          'fr',
          'ar'
        ),
        autoTranslateTexts(
          [nameAr, regionAr, makkahHotelAr, madinahHotelAr, additionalNotesAr, shuttleScheduleAr, foodTypeAr],
          'en',
          'ar'
        ),
        autoTranslateTexts(roomPrices.map((r) => r.type?.ar || ''), 'fr', 'ar'),
        autoTranslateTexts(roomPrices.map((r) => r.type?.ar || ''), 'en', 'ar'),
        autoTranslateTexts(activeZiyarat.map((z) => z.ar || ''), 'fr', 'ar'),
        autoTranslateTexts(activeZiyarat.map((z) => z.ar || ''), 'en', 'ar'),
        autoTranslateTexts(activeProgram.map((p) => p.ar || ''), 'fr', 'ar'),
        autoTranslateTexts(activeProgram.map((p) => p.ar || ''), 'en', 'ar'),
        autoTranslateTexts(customFeatures.map((c) => c.ar || ''), 'fr', 'ar'),
        autoTranslateTexts(customFeatures.map((c) => c.ar || ''), 'en', 'ar'),
      ]);

      const finalNameFr = nameFr.trim() || basicFr[0] || nameAr;
      const finalNameEn = basicEn[0] || finalNameFr;
      const finalRegionFr = regionFr.trim() || basicFr[1] || regionAr;
      const finalRegionEn = basicEn[1] || finalRegionFr;
      const finalMakkahFr = makkahHotelFr.trim() || basicFr[2] || makkahHotelAr;
      const finalMakkahEn = basicEn[2] || finalMakkahFr;
      const finalMadinahFr = madinahHotelFr.trim() || basicFr[3] || madinahHotelAr;
      const finalMadinahEn = basicEn[3] || finalMadinahFr;
      const finalNotesFr = additionalNotesFr.trim() || basicFr[4] || additionalNotesAr;
      const finalNotesEn = basicEn[4] || finalNotesFr;
      const finalShuttleFr = shuttleScheduleFr.trim() || basicFr[5] || shuttleScheduleAr;
      const finalShuttleEn = basicEn[5] || finalShuttleFr;
      const finalFoodFr = foodTypeFr.trim() || basicFr[6] || foodTypeAr;
      const finalFoodEn = basicEn[6] || finalFoodFr;

      const cleanRooms = roomPrices.map((r, i) => ({
        type: {
          ar: r.type?.ar || '',
          fr: (r.type?.fr || '').trim() || roomsFr[i] || r.type?.ar || '',
          en: (r.type?.en || '').trim() || roomsEn[i] || r.type?.fr || r.type?.ar || '',
        },
        priceDzd: r.priceDzd || '',
      }));

      const cleanZiyarat = activeZiyarat.map((z, i) => ({
        ar: z.ar || '',
        fr: (z.fr || '').trim() || ziyaratFr[i] || z.ar || '',
        en: (z.en || '').trim() || ziyaratEn[i] || z.fr || z.ar || '',
        selected: true,
      }));

      const cleanProgram = activeProgram.map((p, i) => ({
        ar: p.ar || '',
        fr: (p.fr || '').trim() || progFr[i] || p.ar || '',
        en: (p.en || '').trim() || progEn[i] || p.fr || p.ar || '',
        selected: true,
      }));

      const cleanCustomFeatures: CustomServiceFeature[] = customFeatures.map((c, i) => ({
        id: c.id,
        ar: c.ar || '',
        fr: (c.fr || '').trim() || custFr[i] || c.ar || '',
        en: (c.en || '').trim() || custEn[i] || c.fr || c.ar || '',
      }));

      const derivedHasTransport = enabledFeatures.includes('transport');
      const derivedHasFood = enabledFeatures.includes('food_included');

      const includesAr = ['تأشيرة (Visa)'];
      const includesFr = ['Visa'];
      const includesEn = ['Visa'];
      if (derivedHasTransport) {
        includesAr.push('النقل');
        includesFr.push('Transport');
        includesEn.push('Transport');
      }
      if (cleanZiyarat.length > 0) {
        includesAr.push('المزارات');
        includesFr.push('Ziyarat');
        includesEn.push('Ziyarat');
      }

      // Drop legacy priceStartEur cleanly without storing undefined
      const { priceStartEur: _legacyEur, ...restInitial } = initialData || {};

      const hotelData = {
        ...restInitial,
        code,
        name: { ar: nameAr, fr: finalNameFr, en: finalNameEn },
        image: imageMain,
        images: { rooms: imageRooms, restaurant: imageRestaurant, services: imageServices },
        stars: Number(stars),
        transportAvailable: derivedHasTransport,
        shuttleAvailable,
        shuttleSchedule: { ar: shuttleScheduleAr, fr: finalShuttleFr, en: finalShuttleEn },
        makkahHotel: { ar: makkahHotelAr, fr: finalMakkahFr, en: finalMakkahEn },
        madinahHotel: { ar: madinahHotelAr, fr: finalMadinahFr, en: finalMadinahEn },
        additionalNotes: { ar: additionalNotesAr, fr: finalNotesFr, en: finalNotesEn },
        region: { ar: regionAr, fr: finalRegionFr, en: finalRegionEn },
        distanceMakkah: distMakkah,
        daysMakkah: Number(daysMakkah) || 0,
        daysMadinah: Number(daysMadinah) || 0,
        priceStartDzd: priceDzd,
        googleMapsLink,
        roomPrices: cleanRooms,
        ziyarat: cleanZiyarat,
        program: cleanProgram,
        schedule: schedules,
        food: derivedHasFood ? { type: { ar: foodTypeAr, fr: finalFoodFr, en: finalFoodEn }, price: 'مشمول / Inclus' } : null,
        includes: { ar: includesAr, fr: includesFr, en: includesEn },
        featuresConfigured: true,
        enabledFeatures,
        customFeatures: cleanCustomFeatures,
      };

      await onSave(hotelData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const renderImageUploader = (label: string, img: string, setter: any) => (
    <div className="border rounded-xl p-4 text-center bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden aspect-square">
      {img ? (
        <>
          <img src={img} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setter('');
            }}
            className="absolute top-2 left-2 bg-red-500 text-white p-1.5 rounded-full shadow"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">{label}</span>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setter)} className="hidden" />
        </label>
      )}
    </div>
  );

  const previewEur = convertDzdToEur(parseNumericPrice(priceDzd), dzdPerEur);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl md:text-2xl font-bold text-primary">
            {initialData ? 'تعديل باقة العمرة' : 'إضافة فندق / باقة عمرة بمواصفات كاملة'}
          </h2>
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
                    activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
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
                  <div>
                    <label className="block text-sm font-medium mb-1">الاسم (عربي) *</label>
                    <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} className="w-full border rounded-lg p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الاسم (فرنسي - يُترجم تلقائياً إن تُرك فارغاً)</label>
                    <input value={nameFr} onChange={(e) => setNameFr(e.target.value)} className="w-full border rounded-lg p-2.5" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">المنطقة (عربي)</label>
                    <input value={regionAr} onChange={(e) => setRegionAr(e.target.value)} placeholder="مكة المكرمة" className="w-full border rounded-lg p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">المنطقة (فرنسي)</label>
                    <input value={regionFr} onChange={(e) => setRegionFr(e.target.value)} className="w-full border rounded-lg p-2.5" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">الكود *</label>
                    <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border rounded-lg p-2.5" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">البعد عن الحرم</label>
                    <input value={distMakkah} onChange={(e) => setDistMakkah(e.target.value)} className="w-full border rounded-lg p-2.5" placeholder="450m" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">السعر المبدئي (دج)</label>
                    <input
                      type="number"
                      min={0}
                      value={priceDzd}
                      onChange={(e) => setPriceDzd(e.target.value)}
                      className="w-full border rounded-lg p-2.5 font-bold"
                    />
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      السعر باليورو يحسب تلقائياً في الموقع حسب سعر الصرف (~ {previewEur > 0 ? `${previewEur} €` : '0 €'})
                    </p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-1">رابط خرائط جوجل</label>
                    <input value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} placeholder="https://goo.gl/maps/..." className="w-full border rounded-lg p-2.5" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">فندق مكة (عربي)</label>
                    <input value={makkahHotelAr} onChange={(e) => setMakkahHotelAr(e.target.value)} className="w-full border rounded-lg p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">فندق مكة (فرنسي)</label>
                    <input value={makkahHotelFr} onChange={(e) => setMakkahHotelFr(e.target.value)} className="w-full border rounded-lg p-2.5" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">فندق المدينة (عربي)</label>
                    <input value={madinahHotelAr} onChange={(e) => setMadinahHotelAr(e.target.value)} className="w-full border rounded-lg p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">فندق المدينة (فرنسي)</label>
                    <input value={madinahHotelFr} onChange={(e) => setMadinahHotelFr(e.target.value)} className="w-full border rounded-lg p-2.5" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ملاحظات إضافية (عربي)</label>
                    <input value={additionalNotesAr} onChange={(e) => setAdditionalNotesAr(e.target.value)} className="w-full border rounded-lg p-2.5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">ملاحظات إضافية (فرنسي)</label>
                    <input value={additionalNotesFr} onChange={(e) => setAdditionalNotesFr(e.target.value)} className="w-full border rounded-lg p-2.5" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">النجوم</label>
                    <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className="w-full border rounded-lg p-2.5 bg-white">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <option key={s} value={s}>{s} نجوم</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium mb-1">أيام مكة</label>
                      <input type="number" value={daysMakkah} onChange={(e) => setDaysMakkah(Number(e.target.value))} className="w-full border rounded-lg p-2.5" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">أيام المدينة</label>
                      <input type="number" value={daysMadinah} onChange={(e) => setDaysMadinah(Number(e.target.value))} className="w-full border rounded-lg p-2.5" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-bold mb-3">صور الفندق (مربعات 1:1 للعرض المتناسق)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderImageUploader('الصورة الرئيسية', imageMain, setImageMain)}
                    {renderImageUploader('صورة الغرف', imageRooms, setImageRooms)}
                    {renderImageUploader('صورة المطعم', imageRestaurant, setImageRestaurant)}
                    {renderImageUploader('صورة الخدمات', imageServices, setImageServices)}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROOMS, FOOD & FEATURES */}
            {activeTab === 'rooms' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold">أسعار وأنواع الغرف</h3>
                      <p className="text-xs text-gray-500">أدخل السعر بالدينار فقط، ويتم التحويل لليورو تلقائياً</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRoomPrices([...roomPrices, { type: { ar: '', fr: '' }, priceDzd: '' }])}
                      className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> إضافة غرفة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {roomPrices.map((room, idx) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap gap-2 items-center bg-gray-50 p-2.5 rounded-xl border">
                        <input
                          value={room.type?.ar || ''}
                          onChange={(e) => {
                            const n = [...roomPrices];
                            n[idx] = { ...n[idx], type: { ...(n[idx].type || {}), ar: e.target.value } };
                            setRoomPrices(n);
                          }}
                          placeholder="النوع (عربي)"
                          className="flex-1 min-w-[140px] p-2 border rounded bg-white"
                        />
                        <input
                          value={room.type?.fr || ''}
                          onChange={(e) => {
                            const n = [...roomPrices];
                            n[idx] = { ...n[idx], type: { ...(n[idx].type || {}), fr: e.target.value } };
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
                  <FeaturesToggleEditor
                    category="omra"
                    enabledFeatures={enabledFeatures}
                    customFeatures={customFeatures}
                    onChangeEnabled={(ids) => {
                      setEnabledFeatures(ids);
                      setHasFood(ids.includes('food_included'));
                      setHasTransport(ids.includes('transport'));
                    }}
                    onChangeCustom={setCustomFeatures}
                  />

                  {enabledFeatures.includes('food_included') && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <div>
                        <label className="block text-sm font-medium mb-1">تفاصيل الإطعام (عربي - اختياري)</label>
                        <input value={foodTypeAr} onChange={(e) => setFoodTypeAr(e.target.value)} className="w-full border rounded-lg p-2 bg-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">تفاصيل الإطعام (فرنسي - اختياري)</label>
                        <input value={foodTypeFr} onChange={(e) => setFoodTypeFr(e.target.value)} className="w-full border rounded-lg p-2 bg-white" dir="ltr" />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 mt-2">
                    <input type="checkbox" checked={shuttleAvailable} onChange={(e) => setShuttleAvailable(e.target.checked)} className="w-5 h-5 text-primary" />
                    <span className="font-medium">النقل الترددي متوفر (Shuttle Available)</span>
                  </label>

                  {shuttleAvailable && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mt-2">
                      <div>
                        <label className="block text-sm mb-1">تفاصيل النقل الترددي (عربي)</label>
                        <input value={shuttleScheduleAr} onChange={(e) => setShuttleScheduleAr(e.target.value)} placeholder="مثال: كل نصف ساعة للحرم" className="w-full border rounded-lg p-2" />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">تفاصيل النقل الترددي (فرنسي)</label>
                        <input value={shuttleScheduleFr} onChange={(e) => setShuttleScheduleFr(e.target.value)} placeholder="Ex: Chaque demi-heure" className="w-full border rounded-lg p-2" dir="ltr" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PROGRAM & ZIYARAT */}
            {activeTab === 'program' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">المزارات والرحلات</h3>
                    <button
                      type="button"
                      onClick={() => setZiyarat([...ziyarat, { ar: '', fr: '', selected: true }])}
                      className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> إضافة مزار مخصص
                    </button>
                  </div>
                  <div className="space-y-3">
                    {ziyarat.map((z, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border">
                        <input
                          type="checkbox"
                          checked={z.selected !== false}
                          onChange={(e) => {
                            const n = [...ziyarat];
                            n[idx] = { ...n[idx], selected: e.target.checked };
                            setZiyarat(n);
                          }}
                          className="w-5 h-5 text-primary"
                        />
                        <input
                          value={z.ar || ''}
                          onChange={(e) => {
                            const n = [...ziyarat];
                            n[idx] = { ...n[idx], ar: e.target.value };
                            setZiyarat(n);
                          }}
                          placeholder="عربي"
                          className="flex-1 p-2 border rounded bg-white"
                        />
                        <input
                          value={z.fr || ''}
                          onChange={(e) => {
                            const n = [...ziyarat];
                            n[idx] = { ...n[idx], fr: e.target.value };
                            setZiyarat(n);
                          }}
                          placeholder="فرنسي (اختياري)"
                          className="flex-1 p-2 border rounded bg-white"
                          dir="ltr"
                        />
                        <button type="button" onClick={() => setZiyarat(ziyarat.filter((_, i) => i !== idx))} className="text-red-500 p-2">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">برنامج الرحلة خطوة بخطوة</h3>
                    <button
                      type="button"
                      onClick={() => setProgram([...program, { ar: '', fr: '', selected: true }])}
                      className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> إضافة خطوة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {program.map((p, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border">
                        <input
                          type="checkbox"
                          checked={p.selected !== false}
                          onChange={(e) => {
                            const n = [...program];
                            n[idx] = { ...n[idx], selected: e.target.checked };
                            setProgram(n);
                          }}
                          className="w-5 h-5 text-primary"
                        />
                        <input
                          value={p.ar || ''}
                          onChange={(e) => {
                            const n = [...program];
                            n[idx] = { ...n[idx], ar: e.target.value };
                            setProgram(n);
                          }}
                          placeholder="عربي"
                          className="flex-1 p-2 border rounded bg-white"
                        />
                        <input
                          value={p.fr || ''}
                          onChange={(e) => {
                            const n = [...program];
                            n[idx] = { ...n[idx], fr: e.target.value };
                            setProgram(n);
                          }}
                          placeholder="فرنسي (اختياري)"
                          className="flex-1 p-2 border rounded bg-white"
                          dir="ltr"
                        />
                        <button type="button" onClick={() => setProgram(program.filter((_, i) => i !== idx))} className="text-red-500 p-2">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
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
                          duration: { ar: '14 يوماً', fr: '14 Jours' },
                          entry: { ar: 'جدة', fr: 'Djeddah' },
                          exit: { ar: 'المدينة', fr: 'Médine' },
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          placeholder="30 Oct 2026"
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
                          placeholder="الخطوط السعودية"
                          className="w-full border rounded p-2 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">الخطوط (فرنسي)</label>
                        <input
                          value={sch.airline?.fr || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], airline: { ...(n[idx].airline || {}), fr: e.target.value } };
                            setSchedules(n);
                          }}
                          placeholder="Saudia"
                          className="w-full border rounded p-2 bg-white"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">من (عربي)</label>
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
                        <label className="block text-xs mb-1 text-gray-500">من (فرنسي)</label>
                        <input
                          value={sch.departLoc?.fr || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], departLoc: { ...(n[idx].departLoc || {}), fr: e.target.value } };
                            setSchedules(n);
                          }}
                          className="w-full border rounded p-2 bg-white"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">الدخول (عربي)</label>
                        <input
                          value={sch.entry?.ar || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], entry: { ...(n[idx].entry || {}), ar: e.target.value } };
                            setSchedules(n);
                          }}
                          placeholder="جدة"
                          className="w-full border rounded p-2 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">الدخول (فرنسي)</label>
                        <input
                          value={sch.entry?.fr || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], entry: { ...(n[idx].entry || {}), fr: e.target.value } };
                            setSchedules(n);
                          }}
                          placeholder="Djeddah"
                          className="w-full border rounded p-2 bg-white"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">الخروج (عربي)</label>
                        <input
                          value={sch.exit?.ar || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], exit: { ...(n[idx].exit || {}), ar: e.target.value } };
                            setSchedules(n);
                          }}
                          placeholder="المدينة"
                          className="w-full border rounded p-2 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">الخروج (فرنسي)</label>
                        <input
                          value={sch.exit?.fr || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], exit: { ...(n[idx].exit || {}), fr: e.target.value } };
                            setSchedules(n);
                          }}
                          placeholder="Médine"
                          className="w-full border rounded p-2 bg-white"
                          dir="ltr"
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
                          placeholder="مباشرة"
                          className="w-full border rounded p-2 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1 text-gray-500">مدة الرحلة</label>
                        <input
                          value={sch.duration?.ar || ''}
                          onChange={(e) => {
                            const n = [...schedules];
                            n[idx] = { ...n[idx], duration: { ...(n[idx].duration || {}), ar: e.target.value } };
                            setSchedules(n);
                          }}
                          placeholder="14 يوماً"
                          className="w-full border rounded p-2 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {schedules.length === 0 && (
                  <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-xl">
                    لم تقم بإضافة أي جداول رحلات. يمكنك إضافة تواريخ متعددة لنفس الفندق!
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
            disabled={loading || !nameAr || !code}
            className="px-8 py-2 bg-primary text-white rounded-xl font-bold hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'جاري الترجمة والحفظ...' : 'حفظ الفندق بالكامل'}
          </button>
        </div>
      </div>
    </div>
  );
}
