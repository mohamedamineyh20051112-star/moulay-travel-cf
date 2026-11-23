'use client';
import { useState, useRef } from 'react';
import { X, Image as ImageIcon, Plus, Trash2, MapPin, Calendar, Plane, Coffee, BedDouble, CheckCircle } from 'lucide-react';

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hotelData: any) => Promise<void>;
  initialData?: any;
}

const TABS = [
  { id: 'basic', label: 'الأساسية والصور', icon: MapPin },
  { id: 'rooms', label: 'الغرف والإطعام', icon: BedDouble },
  { id: 'program', label: 'البرنامج والمزارات', icon: CheckCircle },
  { id: 'flights', label: 'جداول الرحلات', icon: Plane },
];

const PREDEFINED_ZIYARAT = [
  { ar: 'جبل النور', fr: 'Jabal Al Nour' },
  { ar: 'جبل ثور', fr: 'Jabal Thawr' },
  { ar: 'مسجد قباء', fr: 'Mosquée Quba' },
  { ar: 'جبل أحد', fr: 'Jabal Uhud' }
];

const PREDEFINED_PROGRAM = [
  { ar: 'استقبال في المطار', fr: "Accueil à l'aéroport" },
  { ar: 'تسكين في الفندق', fr: "Installation à l'hôtel" },
  { ar: 'أداء مناسك العمرة', fr: "Accomplissement de la Omra" },
  { ar: 'وقت حر والزيارات', fr: "Temps libre et visites" }
];

export default function OmraHotelModal({ isOpen, onClose, onSave, initialData }: HotelModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Tab 1: Basic Info

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
  const [priceEur, setPriceEur] = useState(initialData?.priceStartEur || '');
  
  // Images
  const [imageMain, setImageMain] = useState(initialData?.image || '');
  const [imageRooms, setImageRooms] = useState(initialData?.images?.rooms || '');
  const [imageRestaurant, setImageRestaurant] = useState(initialData?.images?.restaurant || '');
  const [imageServices, setImageServices] = useState(initialData?.images?.services || '');

  // Tab 2: Rooms & Food
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

  // Tab 3: Ziyarat & Program
  const [ziyarat, setZiyarat] = useState<any[]>(initialData?.ziyarat || PREDEFINED_ZIYARAT);
  const [program, setProgram] = useState<any[]>(initialData?.program || PREDEFINED_PROGRAM);

  // Tab 4: Flights
  const [schedules, setSchedules] = useState<any[]>(initialData?.schedule || []);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
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
        setter(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    let includesAr = ['تأشيرة (Visa)'];
    let includesFr = ['Visa'];
    if (hasTransport) { includesAr.push('النقل'); includesFr.push('Transport'); }
    if (ziyarat.length > 0) { includesAr.push('المزارات'); includesFr.push('Ziyarat'); }

    const hotelData = {
      ...initialData,
      code,
      name: { ar: nameAr, fr: nameFr },
      image: imageMain,
      images: { rooms: imageRooms, restaurant: imageRestaurant, services: imageServices },
      stars: Number(stars),
      transportAvailable: hasTransport,
      shuttleAvailable,
      shuttleSchedule: { ar: shuttleScheduleAr, fr: shuttleScheduleFr },
      makkahHotel: { ar: makkahHotelAr, fr: makkahHotelFr },
      madinahHotel: { ar: madinahHotelAr, fr: madinahHotelFr },
      additionalNotes: { ar: additionalNotesAr, fr: additionalNotesFr },

      region: { ar: regionAr, fr: regionFr },
      distanceMakkah: distMakkah,
      daysMakkah: Number(daysMakkah),
      daysMadinah: Number(daysMadinah),
      priceStartDzd: priceDzd,
      priceStartEur: priceEur,
      googleMapsLink,
      roomPrices,
      ziyarat: ziyarat.filter(z => z.selected !== false),
      program: program.filter(p => p.selected !== false),
      schedule: schedules,
      food: hasFood ? { type: { ar: foodTypeAr, fr: foodTypeFr }, price: 'مشمول / Inclus' } : null,
      includes: { ar: includesAr, fr: includesFr }
    };
    
    await onSave(hotelData);
    setLoading(false);
    onClose();
  };

  const renderImageUploader = (label: string, img: string, setter: any) => (
    <div className="border rounded-xl p-4 text-center bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden h-32">
      {img ? (
        <>
          <img src={img} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
          <button onClick={(e) => {e.stopPropagation(); setter('')}} className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full"><X className="w-4 h-4"/></button>
        </>
      ) : (
        <label className="cursor-pointer flex flex-col items-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm font-medium text-gray-600">{label}</span>
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setter)} className="hidden" />
        </label>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-primary">{initialData ? 'تعديل الفندق' : 'إضافة فندق جديد بمواصفات كاملة'}</h2>
          <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-red-100 hover:text-red-600 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-l p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  <Icon className="w-5 h-5" /> {tab.label}
                </button>
              );
            })}
          </div>

          {/* Main Form Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-white">
            
            {/* TAB 1: BASIC & IMAGES */}
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm mb-1">الاسم (عربي)</label><input value={nameAr} onChange={e=>setNameAr(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1">الاسم (فرنسي)</label><input value={nameFr} onChange={e=>setNameFr(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr" /></div>
                  <div><label className="block text-sm mb-1">المنطقة (عربي)</label><input value={regionAr} onChange={e=>setRegionAr(e.target.value)} placeholder="مكة المكرمة" className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1">المنطقة (فرنسي)</label><input value={regionFr} onChange={e=>setRegionFr(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr" /></div>
                  <div><label className="block text-sm mb-1">الكود</label><input value={code} onChange={e=>setCode(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr"/></div>
                  <div><label className="block text-sm mb-1">البعد عن الحرم</label><input value={distMakkah} onChange={e=>setDistMakkah(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1">السعر المبدئي (دج)</label><input value={priceDzd} onChange={e=>setPriceDzd(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1">السعر المبدئي (يورو)</label><input value={priceEur} onChange={e=>setPriceEur(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm mb-1">رابط خرائط جوجل</label>
                    <input value={googleMapsLink} onChange={e=>setGoogleMapsLink(e.target.value)} placeholder="https://goo.gl/maps/..." className="w-full border rounded-lg p-2" dir="ltr" />
                  </div>
                  <div><label className="block text-sm mb-1">فندق مكة (عربي)</label><input value={makkahHotelAr} onChange={e=>setMakkahHotelAr(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1">فندق مكة (فرنسي)</label><input value={makkahHotelFr} onChange={e=>setMakkahHotelFr(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr" /></div>
                  <div><label className="block text-sm mb-1">فندق المدينة (عربي)</label><input value={madinahHotelAr} onChange={e=>setMadinahHotelAr(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1">فندق المدينة (فرنسي)</label><input value={madinahHotelFr} onChange={e=>setMadinahHotelFr(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr" /></div>
                  <div><label className="block text-sm mb-1">ملاحظات إضافية (عربي)</label><input value={additionalNotesAr} onChange={e=>setAdditionalNotesAr(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1">ملاحظات إضافية (فرنسي)</label><input value={additionalNotesFr} onChange={e=>setAdditionalNotesFr(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr" /></div>
                  <div><label className="block text-sm mb-1">النجوم</label>
                    <select value={stars} onChange={e=>setStars(Number(e.target.value))} className="w-full border rounded-lg p-2">
                      {[1,2,3,4,5].map(s => <option key={s} value={s}>{s} نجوم</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div><label className="block text-sm mb-1">أيام مكة</label><input type="number" value={daysMakkah} onChange={e=>setDaysMakkah(Number(e.target.value))} className="w-full border rounded-lg p-2" /></div>
                    <div><label className="block text-sm mb-1">أيام المدينة</label><input type="number" value={daysMadinah} onChange={e=>setDaysMadinah(Number(e.target.value))} className="w-full border rounded-lg p-2" /></div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-bold mb-3">صور الفندق (اختيارية لكن تعطي فخامة)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {renderImageUploader("الصورة الرئيسية", imageMain, setImageMain)}
                    {renderImageUploader("صورة الغرف", imageRooms, setImageRooms)}
                    {renderImageUploader("صورة المطعم", imageRestaurant, setImageRestaurant)}
                    {renderImageUploader("صورة الخدمات", imageServices, setImageServices)}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROOMS & FOOD */}
            {activeTab === 'rooms' && (
              <div className="space-y-6 animate-in fade-in">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">أسعار وأنواع الغرف</h3>
                    <button onClick={() => setRoomPrices([...roomPrices, { type: {ar:'', fr:''}, priceDzd: '', priceEur: '' }])} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4"/> إضافة غرفة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {roomPrices.map((room, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border">
                        <input value={room.type.ar} onChange={(e) => {const n=[...roomPrices]; n[idx].type.ar=e.target.value; setRoomPrices(n)}} placeholder="النوع (عربي)" className="flex-1 p-2 border rounded" />
                        <input value={room.type.fr} onChange={(e) => {const n=[...roomPrices]; n[idx].type.fr=e.target.value; setRoomPrices(n)}} placeholder="النوع (فرنسي)" className="flex-1 p-2 border rounded" dir="ltr" />
                        <input value={room.priceDzd} onChange={(e) => {const n=[...roomPrices]; n[idx].priceDzd=e.target.value; setRoomPrices(n)}} placeholder="السعر دج" className="w-24 p-2 border rounded" />
                        <input value={room.priceEur} onChange={(e) => {const n=[...roomPrices]; n[idx].priceEur=e.target.value; setRoomPrices(n)}} placeholder="السعر €" className="w-24 p-2 border rounded" />
                        <button onClick={() => setRoomPrices(roomPrices.filter((_, i) => i !== idx))} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 className="w-5 h-5"/></button>
                      </div>
                    ))}
                    {roomPrices.length === 0 && <p className="text-gray-400 text-center py-4">لم تقم بإضافة غرف بعد</p>}
                  </div>
                </div>

                <div className="pt-6 border-t space-y-4">
                  <h3 className="font-bold">خدمات إضافية (الإطعام والنقل)</h3>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                    <input type="checkbox" checked={hasFood} onChange={e=>setHasFood(e.target.checked)} className="w-5 h-5 text-primary" />
                    <span className="font-medium">الإطعام متوفر في هذا الفندق؟</span>
                  </label>
                  {hasFood && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                      <div><label className="block text-sm mb-1">نوع الإطعام (عربي)</label><input value={foodTypeAr} onChange={e=>setFoodTypeAr(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                      <div><label className="block text-sm mb-1">نوع الإطعام (فرنسي)</label><input value={foodTypeFr} onChange={e=>setFoodTypeFr(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr" /></div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-gray-50">
                    <input type="checkbox" checked={hasTransport} onChange={e=>setHasTransport(e.target.checked)} className="w-5 h-5 text-primary" />
                    <span className="font-medium">توفير خدمات النقل (Transport)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl hover:bg-gray-50 mt-4">
                    <input type="checkbox" checked={shuttleAvailable} onChange={e=>setShuttleAvailable(e.target.checked)} className="w-5 h-5 text-primary" />
                    <span className="font-medium">النقل الترددي متوفر (Shuttle Available)</span>
                  </label>
                  
                  {shuttleAvailable && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 mt-2">
                      <div>
                        <label className="block text-sm mb-1">تفاصيل النقل الترددي (عربي)</label>
                        <input value={shuttleScheduleAr} onChange={e=>setShuttleScheduleAr(e.target.value)} placeholder="مثال: كل نصف ساعة للحرم" className="w-full border rounded-lg p-2" />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">تفاصيل النقل الترددي (فرنسي)</label>
                        <input value={shuttleScheduleFr} onChange={e=>setShuttleScheduleFr(e.target.value)} placeholder="Ex: Chaque demi-heure" className="w-full border rounded-lg p-2" dir="ltr" />
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
                    <button onClick={() => setZiyarat([...ziyarat, { ar:'', fr:'', selected: true }])} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4"/> إضافة مزار مخصص
                    </button>
                  </div>
                  <div className="space-y-3">
                    {ziyarat.map((z, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border">
                        <input type="checkbox" checked={z.selected !== false} onChange={(e) => {const n=[...ziyarat]; n[idx].selected=e.target.checked; setZiyarat(n)}} className="w-5 h-5 text-primary" />
                        <input value={z.ar} onChange={(e) => {const n=[...ziyarat]; n[idx].ar=e.target.value; setZiyarat(n)}} placeholder="عربي" className="flex-1 p-2 border rounded bg-white" />
                        <input value={z.fr} onChange={(e) => {const n=[...ziyarat]; n[idx].fr=e.target.value; setZiyarat(n)}} placeholder="فرنسي" className="flex-1 p-2 border rounded bg-white" dir="ltr" />
                        <button onClick={() => setZiyarat(ziyarat.filter((_, i) => i !== idx))} className="text-red-500 p-2"><Trash2 className="w-5 h-5"/></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">برنامج الرحلة خطوة بخطوة</h3>
                    <button onClick={() => setProgram([...program, { ar:'', fr:'', selected: true }])} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4"/> إضافة خطوة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {program.map((p, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border">
                        <input type="checkbox" checked={p.selected !== false} onChange={(e) => {const n=[...program]; n[idx].selected=e.target.checked; setProgram(n)}} className="w-5 h-5 text-primary" />
                        <input value={p.ar} onChange={(e) => {const n=[...program]; n[idx].ar=e.target.value; setProgram(n)}} placeholder="عربي" className="flex-1 p-2 border rounded bg-white" />
                        <input value={p.fr} onChange={(e) => {const n=[...program]; n[idx].fr=e.target.value; setProgram(n)}} placeholder="فرنسي" className="flex-1 p-2 border rounded bg-white" dir="ltr" />
                        <button onClick={() => setProgram(program.filter((_, i) => i !== idx))} className="text-red-500 p-2"><Trash2 className="w-5 h-5"/></button>
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
                  <button onClick={() => setSchedules([...schedules, { 
                    departLoc: {ar:'الجزائر', fr:'Alger'}, departDate: '', returnDate: '',
                    flightType: {ar:'مباشرة', fr:'Directe'}, duration: {ar:'14 يوماً', fr:'14 Jours'},
                    entry: {ar:'جدة', fr:'Djeddah'}, exit: {ar:'المدينة', fr:'Médine'}, airline: {ar:'', fr:''} 
                  }])} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                    <Plus className="w-4 h-4"/> إضافة جدول / تاريخ جديد
                  </button>
                </div>
                
                {schedules.map((sch, idx) => (
                  <div key={idx} className="bg-gray-50 border rounded-xl p-4 relative mb-4">
                    <button onClick={() => setSchedules(schedules.filter((_, i) => i !== idx))} className="absolute top-4 left-4 text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="w-5 h-5"/></button>
                    <h4 className="font-bold mb-4 text-primary border-b pb-2">جدول الرحلة #{idx + 1}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div><label className="block text-xs mb-1 text-gray-500">تاريخ الذهاب</label><input value={sch.departDate} onChange={e=>{const n=[...schedules]; n[idx].departDate=e.target.value; setSchedules(n)}} placeholder="15 Oct 2026" className="w-full border rounded p-2" dir="ltr"/></div>
                      <div><label className="block text-xs mb-1 text-gray-500">تاريخ الرجوع</label><input value={sch.returnDate} onChange={e=>{const n=[...schedules]; n[idx].returnDate=e.target.value; setSchedules(n)}} placeholder="30 Oct 2026" className="w-full border rounded p-2" dir="ltr"/></div>
                      <div><label className="block text-xs mb-1 text-gray-500">الخطوط (عربي)</label><input value={sch.airline.ar} onChange={e=>{const n=[...schedules]; n[idx].airline.ar=e.target.value; setSchedules(n)}} placeholder="الخطوط السعودية" className="w-full border rounded p-2" /></div>
                      <div><label className="block text-xs mb-1 text-gray-500">الخطوط (فرنسي)</label><input value={sch.airline.fr} onChange={e=>{const n=[...schedules]; n[idx].airline.fr=e.target.value; setSchedules(n)}} placeholder="Saudia" className="w-full border rounded p-2" dir="ltr"/></div>
                      <div><label className="block text-xs mb-1 text-gray-500">من (عربي)</label><input value={sch.departLoc.ar} onChange={e=>{const n=[...schedules]; n[idx].departLoc.ar=e.target.value; setSchedules(n)}} className="w-full border rounded p-2" /></div>
                      <div><label className="block text-xs mb-1 text-gray-500">من (فرنسي)</label><input value={sch.departLoc.fr} onChange={e=>{const n=[...schedules]; n[idx].departLoc.fr=e.target.value; setSchedules(n)}} className="w-full border rounded p-2" dir="ltr"/></div>
                      <div><label className="block text-xs mb-1 text-gray-500">الدخول (عربي)</label><input value={sch.entry.ar} onChange={e=>{const n=[...schedules]; n[idx].entry.ar=e.target.value; setSchedules(n)}} placeholder="جدة" className="w-full border rounded p-2" /></div>
                      <div><label className="block text-xs mb-1 text-gray-500">الدخول (فرنسي)</label><input value={sch.entry.fr} onChange={e=>{const n=[...schedules]; n[idx].entry.fr=e.target.value; setSchedules(n)}} placeholder="Djeddah" className="w-full border rounded p-2" dir="ltr"/></div>
                      <div><label className="block text-xs mb-1 text-gray-500">الخروج (عربي)</label><input value={sch.exit.ar} onChange={e=>{const n=[...schedules]; n[idx].exit.ar=e.target.value; setSchedules(n)}} placeholder="المدينة" className="w-full border rounded p-2" /></div>
                      <div><label className="block text-xs mb-1 text-gray-500">الخروج (فرنسي)</label><input value={sch.exit.fr} onChange={e=>{const n=[...schedules]; n[idx].exit.fr=e.target.value; setSchedules(n)}} placeholder="Médine" className="w-full border rounded p-2" dir="ltr"/></div>
                      <div><label className="block text-xs mb-1 text-gray-500">نوع الرحلة</label><input value={sch.flightType.ar} onChange={e=>{const n=[...schedules]; n[idx].flightType.ar=e.target.value; setSchedules(n)}} placeholder="مباشرة" className="w-full border rounded p-2" /></div>
                      <div><label className="block text-xs mb-1 text-gray-500">مدة الرحلة</label><input value={sch.duration.ar} onChange={e=>{const n=[...schedules]; n[idx].duration.ar=e.target.value; setSchedules(n)}} placeholder="14 يوماً" className="w-full border rounded p-2" /></div>
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
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-200">إلغاء</button>
          <button onClick={handleSave} disabled={loading || !nameAr || !code} className="px-8 py-2 bg-primary text-white rounded-xl font-bold hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? 'جاري الحفظ...' : 'حفظ الفندق بالكامل'}
          </button>
        </div>
      </div>
    </div>
  );
}

