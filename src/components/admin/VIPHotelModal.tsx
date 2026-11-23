'use client';
import { useState } from 'react';
import { X, Image as ImageIcon, Plus, Trash2, MapPin, Calendar, Plane, BedDouble, CheckCircle } from 'lucide-react';

interface VIPHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
  destinations: any[];
  defaultDestinationId?: string;
  onCreateDestination?: (data: { nameAr: string; nameFr?: string; image?: string; }) => Promise<string | null>;
}

const TABS = [
  { id: 'basic', label: 'الأساسية والصور', icon: MapPin },
  { id: 'rooms', label: 'الغرف والإطعام', icon: BedDouble },
  { id: 'program', label: 'البرنامج السياحي', icon: CheckCircle },
  { id: 'flights', label: 'جداول الرحلات', icon: Plane },
];

export default function VIPHotelModal({ isOpen, onClose, onSave, initialData, destinations, defaultDestinationId, onCreateDestination }: VIPHotelModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Tab 1: Basic Info
  const [destinationId, setDestinationId] = useState(initialData?.destinationId || defaultDestinationId || '');
  const [newDestNameAr, setNewDestNameAr] = useState('');
  const [newDestNameFr, setNewDestNameFr] = useState('');
  const [newDestImage, setNewDestImage] = useState('');
  const [nameAr, setNameAr] = useState(initialData?.nameAr || '');
  const [nameFr, setNameFr] = useState(initialData?.nameFr || '');
  const [googleMapsLink, setGoogleMapsLink] = useState(initialData?.googleMapsLink || '');
  const [stars, setStars] = useState(initialData?.stars || 4);
  const [price, setPrice] = useState(initialData?.price || '');
  const [priceEuro, setPriceEuro] = useState(initialData?.priceEuro || '');
  const [days, setDays] = useState(initialData?.days || 7);
  const [descriptionAr, setDescriptionAr] = useState(initialData?.descriptionAr || '');
  const [descriptionFr, setDescriptionFr] = useState(initialData?.descriptionFr || '');
  
  // New Omra Fields
  const [zone, setZone] = useState(initialData?.zone || '');
  const [distanceToHaram, setDistanceToHaram] = useState(initialData?.distanceToHaram || '');
  const [mekkaDays, setMekkaDays] = useState(initialData?.mekkaDays || '');
  const [madinaDays, setMadinaDays] = useState(initialData?.madinaDays || '');
  
  // Images (Strings)
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [roomImages, setRoomImages] = useState<string[]>(initialData?.roomImages || []);
  const [foodImages, setFoodImages] = useState<string[]>(initialData?.foodImages || []);

  const [newImage, setNewImage] = useState('');
  const [newRoomImage, setNewRoomImage] = useState('');
  const [newFoodImage, setNewFoodImage] = useState('');

  // Tab 2: Rooms & Food
  const [roomPrices, setRoomPrices] = useState<any[]>(initialData?.roomPrices || []);
  const [hasFood, setHasFood] = useState(initialData?.hasFood !== false);
  const [foodTypeAr, setFoodTypeAr] = useState(initialData?.foodTypeAr || 'فطور الصباح');
  const [foodTypeFr, setFoodTypeFr] = useState(initialData?.foodTypeFr || 'Petit déjeuner');
  const [hasTransport, setHasTransport] = useState(initialData?.hasTransport !== false);

  // Tab 3: Program
  const [program, setProgram] = useState<any[]>(initialData?.program || []);

  // Tab 4: Flights/Schedules
  const [schedules, setSchedules] = useState<any[]>(initialData?.schedules || []);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!destinationId) {
      alert('يرجى اختيار الوجهة أولاً');
      return;
    }
    setLoading(true);
    let finalDestId = destinationId;
    if (destinationId === 'NEW') {
       if (!newDestNameAr) {
          alert('يرجى إدخال اسم الوجهة الجديدة بالعربية');
          setLoading(false);
          return;
       }
       if (onCreateDestination) {
          const createdId = await onCreateDestination({ nameAr: newDestNameAr, nameFr: newDestNameFr, image: newDestImage });
          if (createdId) {
             finalDestId = createdId;
             setDestinationId(createdId);
          } else {
             setLoading(false);
             return;
          }
       }
    }
    const hotelData = {
      destinationId: finalDestId,
      nameAr,
      nameFr,
      stars: Number(stars),
      price: Number(price),
      priceEuro: Number(priceEuro),
      days: Number(days),
      descriptionAr,
      descriptionFr,
      zone,
      distanceToHaram,
      mekkaDays: mekkaDays ? Number(mekkaDays) : 0,
      madinaDays: madinaDays ? Number(madinaDays) : 0,
      googleMapsLink,
      images,
      roomImages,
      foodImages,
      roomPrices,
      hasFood,
      foodTypeAr,
      foodTypeFr,
      hasTransport,
      program,
      schedules
    };
    
    await onSave(hotelData);
    setLoading(false);
  };

  const handleAddImage = (setter: any, stateList: string[], url: string, resetUrl: any) => {
    if (url.trim()) {
      setter([...stateList, url.trim()]);
      resetUrl('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold text-primary">{initialData ? 'تعديل الرحلة/الفندق' : 'إضافة رحلة/فندق VIP بمواصفات كاملة'}</h2>
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
                  <div>
                    <label className="block text-sm mb-1 text-gray-700">الوجهة (البلد) *</label>
                    <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className="w-full border rounded-lg p-2" required>
                      <option value="">-- اختر الوجهة --</option>
                      {destinations.map(d => <option key={d.id} value={d.id}>{d.nameAr}</option>)}
                      {onCreateDestination && <option value="NEW" className="font-bold text-primary bg-primary/5">+ إضافة وجهة جديدة</option>}
                    </select>
                    {destinationId === 'NEW' && (
                       <div className="col-span-1 md:col-span-2 bg-primary/5 border border-primary/20 p-4 rounded-xl mt-4 space-y-4">
                          <h4 className="font-bold text-primary">إضافة وجهة جديدة (دولة)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div><label className="block text-sm mb-1">اسم الدولة (عربي)</label><input value={newDestNameAr} onChange={e=>setNewDestNameAr(e.target.value)} className="w-full border rounded-lg p-2 bg-white" placeholder="مثال: تركيا" /></div>
                             <div><label className="block text-sm mb-1">اسم الدولة (فرنسي)</label><input value={newDestNameFr} onChange={e=>setNewDestNameFr(e.target.value)} className="w-full border rounded-lg p-2 bg-white" dir="ltr" placeholder="Ex: Turquie" /></div>
                          </div>
                          <div>
                             <label className="block text-sm mb-1">صورة الوجهة</label>
                             <input type="file" accept="image/*" onChange={(e) => {
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
                                     setNewDestImage(canvas.toDataURL('image/jpeg', 0.7));
                                   };
                                   img.src = (event.target?.result as string) || '';
                                 };
                                 reader.readAsDataURL(file);
                             }} className="w-full border rounded-lg p-2 bg-white" />
                             {newDestImage && <img src={newDestImage} className="h-20 mt-2 rounded-lg object-cover" />}
                          </div>
                       </div>
                    )}
                  </div>
                  <div><label className="block text-sm mb-1">النجوم</label>
                    <select value={stars} onChange={e=>setStars(Number(e.target.value))} className="w-full border rounded-lg p-2">
                      {[1,2,3,4,5,6,7].map(s => <option key={s} value={s}>{s} نجوم</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm mb-1">اسم الفندق/البرنامج (عربي)</label><input value={nameAr} onChange={e=>setNameAr(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1">اسم الفندق/البرنامج (فرنسي)</label><input value={nameFr} onChange={e=>setNameFr(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr" /></div>
                  
                  <div><label className="block text-sm mb-1">السعر المبدئي (د.ج)</label><input type="number" value={price} onChange={e=>setPrice(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1">السعر المبدئي (يورو)</label><input type="number" value={priceEuro} onChange={e=>setPriceEuro(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  
                  <div><label className="block text-sm mb-1">عدد الأيام</label><input type="number" value={days} onChange={e=>setDays(Number(e.target.value))} className="w-full border rounded-lg p-2" /></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div><label className="block text-sm mb-1 text-gray-700">المنطقة / Zone (مثال: أجياد)</label><input value={zone} onChange={e=>setZone(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1 text-gray-700">المسافة للحرم (مثال: 460m)</label><input value={distanceToHaram} onChange={e=>setDistanceToHaram(e.target.value)} className="w-full border rounded-lg p-2" dir="ltr" /></div>
                  <div><label className="block text-sm mb-1 text-gray-700">ليالي مكة (Mekka)</label><input type="number" value={mekkaDays} onChange={e=>setMekkaDays(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                  <div><label className="block text-sm mb-1 text-gray-700">ليالي المدينة (Madina)</label><input type="number" value={madinaDays} onChange={e=>setMadinaDays(e.target.value)} className="w-full border rounded-lg p-2" /></div>
                </div>

                <div>
                  <label className="block text-sm mb-1">وصف موجز (عربي)</label>
                  <textarea value={descriptionAr} onChange={e=>setDescriptionAr(e.target.value)} className="w-full border rounded-lg p-2 h-20"></textarea>
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
                        <input type="file" accept="image/*" onChange={(e) => {
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
                              setImages([...images, canvas.toDataURL('image/jpeg', 0.7)]);
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }} className="hidden" />
                      </label>
                      <div className="flex gap-2 overflow-x-auto mt-2 w-full">
                        {images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 shrink-0">
                            <img src={img} className="w-full h-full object-cover rounded-lg border"/>
                            <button onClick={()=>setImages(images.filter((_, idx)=>idx!==i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3"/></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Room Images */}
                    <div className="bg-gray-50 p-4 rounded-xl border flex flex-col items-center">
                      <label className="block text-sm font-bold mb-2 w-full text-center">صور الغرف</label>
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">اختر صورة</span>
                        <input type="file" accept="image/*" onChange={(e) => {
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
                              setRoomImages([...roomImages, canvas.toDataURL('image/jpeg', 0.7)]);
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }} className="hidden" />
                      </label>
                      <div className="flex gap-2 overflow-x-auto mt-2 w-full">
                        {roomImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 shrink-0">
                            <img src={img} className="w-full h-full object-cover rounded-lg border"/>
                            <button onClick={()=>setRoomImages(roomImages.filter((_, idx)=>idx!==i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3"/></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Food Images */}
                    <div className="bg-gray-50 p-4 rounded-xl border flex flex-col items-center">
                      <label className="block text-sm font-bold mb-2 w-full text-center">صور الإطعام/المطعم</label>
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 transition">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">اختر صورة</span>
                        <input type="file" accept="image/*" onChange={(e) => {
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
                              setFoodImages([...foodImages, canvas.toDataURL('image/jpeg', 0.7)]);
                            };
                            img.src = event.target?.result as string;
                          };
                          reader.readAsDataURL(file);
                        }} className="hidden" />
                      </label>
                      <div className="flex gap-2 overflow-x-auto mt-2 w-full">
                        {foodImages.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 shrink-0">
                            <img src={img} className="w-full h-full object-cover rounded-lg border"/>
                            <button onClick={()=>setFoodImages(foodImages.filter((_, idx)=>idx!==i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3"/></button>
                          </div>
                        ))}
                      </div>
                    </div>

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
                    <button onClick={() => setRoomPrices([...roomPrices, { typeAr:'', typeFr:'', priceDzd: '', priceEur: '' }])} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4"/> إضافة غرفة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {roomPrices.map((room, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded-lg border">
                        <input value={room.typeAr} onChange={(e) => {const n=[...roomPrices]; n[idx].typeAr=e.target.value; setRoomPrices(n)}} placeholder="النوع (عربي)" className="flex-1 p-2 border rounded" />
                        <input value={room.typeFr} onChange={(e) => {const n=[...roomPrices]; n[idx].typeFr=e.target.value; setRoomPrices(n)}} placeholder="النوع (فرنسي)" className="flex-1 p-2 border rounded" dir="ltr" />
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
                </div>
              </div>
            )}

            {/* TAB 3: PROGRAM */}
            {activeTab === 'program' && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">برنامج الرحلة خطوة بخطوة / الأيام</h3>
                    <button onClick={() => setProgram([...program, { ar:'', fr:'' }])} className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                      <Plus className="w-4 h-4"/> إضافة خطوة
                    </button>
                  </div>
                  <div className="space-y-3">
                    {program.map((p, idx) => (
                      <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border">
                        <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mt-1 shrink-0">{idx+1}</span>
                        <div className="flex-1 space-y-2">
                          <input value={p.ar} onChange={(e) => {const n=[...program]; n[idx].ar=e.target.value; setProgram(n)}} placeholder="مثال: اليوم الأول: الاستقبال والتسكين..." className="w-full p-2 border rounded bg-white" />
                          <input value={p.fr} onChange={(e) => {const n=[...program]; n[idx].fr=e.target.value; setProgram(n)}} placeholder="Ex: Jour 1: Accueil..." className="w-full p-2 border rounded bg-white" dir="ltr" />
                        </div>
                        <button onClick={() => setProgram(program.filter((_, i) => i !== idx))} className="text-red-500 p-2 mt-1"><Trash2 className="w-5 h-5"/></button>
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
                  <button onClick={() => setSchedules([...schedules, { 
                    departLoc: {ar:'الجزائر', fr:'Alger'}, departDate: '', returnDate: '',
                    flightType: {ar:'مباشرة', fr:'Directe'},
                    entry: {ar:'', fr:''}, exit: {ar:'', fr:''}, airline: {ar:'', fr:''} 
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
                      <div><label className="block text-xs mb-1 text-gray-500">الخطوط (عربي)</label><input value={sch.airline.ar} onChange={e=>{const n=[...schedules]; n[idx].airline.ar=e.target.value; setSchedules(n)}} placeholder="الخطوط الجوية الجزائرية" className="w-full border rounded p-2" /></div>
                      <div><label className="block text-xs mb-1 text-gray-500">الخطوط (فرنسي)</label><input value={sch.airline.fr} onChange={e=>{const n=[...schedules]; n[idx].airline.fr=e.target.value; setSchedules(n)}} placeholder="Air Algérie" className="w-full border rounded p-2" dir="ltr"/></div>
                      <div><label className="block text-xs mb-1 text-gray-500">من (مطار)</label><input value={sch.departLoc.ar} onChange={e=>{const n=[...schedules]; n[idx].departLoc.ar=e.target.value; setSchedules(n)}} className="w-full border rounded p-2" /></div>
                      <div><label className="block text-xs mb-1 text-gray-500">نوع الرحلة</label><input value={sch.flightType.ar} onChange={e=>{const n=[...schedules]; n[idx].flightType.ar=e.target.value; setSchedules(n)}} placeholder="مباشرة / ترانزيت" className="w-full border rounded p-2" /></div>
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
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-gray-600 font-medium hover:bg-gray-200">إلغاء</button>
          <button onClick={handleSave} disabled={loading || !nameAr || !destinationId} className="px-8 py-2 bg-primary text-white rounded-xl font-bold hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-2">
            {loading ? 'جاري الحفظ...' : 'حفظ الفندق/البرنامج'}
          </button>
        </div>
      </div>
    </div>
  );
}

