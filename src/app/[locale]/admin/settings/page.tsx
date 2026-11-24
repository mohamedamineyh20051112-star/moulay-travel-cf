'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight, Save, Clock, Link as LinkIcon, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsAdmin({ params }: { params: { locale: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [exchangeRateMode, setExchangeRateMode] = useState<'auto' | 'manual'>('auto');
  const [customEurRate, setCustomEurRate] = useState('250');
  
  // Working Hours
  const [hoursAr, setHoursAr] = useState('');
  const [hoursFr, setHoursFr] = useState('');
  
  // Form URLs
  const [forms, setForms] = useState({
    organizedTrips: '',
    wellness: '',
    vip: '',
    visa: '',
    carRental: '',
    insurance: '',
    customTrips: '',
    payment: '',
    omra: '',
    flights: '',
    hotels: ''
  });

  // Contact Info
  const [contact, setContact] = useState({
    phone1: '0555536525',
    phone2: '042187559',
    email: 'moulaytravel31@gmail.com',
    whatsapp: '213555536525',
    facebook: '',
    instagram: '',
    tiktok: '',
    customApp: '',
    customAppName: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'siteSettings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.workingHours) {
            setHoursAr(data.workingHours.ar || '');
            setHoursFr(data.workingHours.fr || '');
          }
          if (data.forms) {
            setForms({ ...forms, ...data.forms });
          }
          if (data.logoUrl) {
            setLogoUrl(data.logoUrl);
          }
          if (data.exchangeRateMode) setExchangeRateMode(data.exchangeRateMode);
          if (data.customEurRate) setCustomEurRate(String(data.customEurRate));
          if (data.contact) {
            setContact({ ...contact, ...data.contact });
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteSettings', 'global'), {
        workingHours: { ar: hoursAr, fr: hoursFr },
        forms: forms,
        logoUrl: logoUrl,
        contact: contact,
        exchangeRateMode,
        customEurRate: Number(customEurRate) || 250
      }, { merge: true });
      alert('تم حفظ الإعدادات بنجاح!');
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحفظ');
    }
    setSaving(false);
  };

  const handleFormChange = (key: keyof typeof forms, value: string) => {
    setForms(prev => ({ ...prev, [key]: value }));
  };

  const handleContactChange = (key: keyof typeof contact, value: string) => {
    setContact(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width, height = img.height;
        const maxSize = 400;
        if (width > height && width > maxSize) { height *= maxSize / width; width = maxSize; }
        else if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        setLogoUrl(canvas.toDataURL('image/png', 0.9));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><div className="animate-spin h-10 w-10 border-t-2 border-primary rounded-full"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-gray-500 mb-6">
          <Link href={`/${params.locale}/admin`} className="hover:text-primary">لوحة التحكم</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">إعدادات الموقع</span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"><SettingsIcon className="w-6 h-6"/></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">إعدادات الموقع العامة</h1>
          </div>

          <button 
            onClick={handleSave} disabled={saving}
            className="w-full sm:w-auto justify-center bg-primary hover:bg-gold text-white px-8 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            <Save className="w-5 h-5" /> {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>

        <div className="space-y-6">
          {/* Exchange Rate Settings (DZD -> EUR) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">سعر الصرف التلقائي (دينار ⇄ يورو)</h2>
            <p className="text-sm text-gray-500 mb-4">
              أدخل الأسعار بالدينار الجزائري فقط في لوحة التحكم، وسيتم تحويلها تلقائياً لليورو للزوار.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-start sm:items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exchangeRateMode"
                  checked={exchangeRateMode === 'auto'}
                  onChange={() => setExchangeRateMode('auto')}
                  className="w-5 h-5 mt-0.5 sm:mt-0 text-primary shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-bold block text-gray-800">تلقائي يومي (API)</span>
                  <span className="text-xs text-gray-500">يجلب سعر الصرف اليومي تلقائياً عبر الإنترنت.</span>
                </div>
              </label>
              <label className="flex items-start sm:items-center gap-3 p-4 rounded-xl border cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="exchangeRateMode"
                  checked={exchangeRateMode === 'manual'}
                  onChange={() => setExchangeRateMode('manual')}
                  className="w-5 h-5 mt-0.5 sm:mt-0 text-primary shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-bold block text-gray-800">سعر مخصص (مثل سعر السكوار)</span>
                  <span className="text-xs text-gray-500">تحدد قيمة 1 يورو بالدينار بنفسك.</span>
                </div>
              </label>
            </div>
            {exchangeRateMode === 'manual' && (
              <div className="mt-4 w-full sm:max-w-xs">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">قيمة 1 يورو (€) بالدينار الجزائري:</label>
                <input
                  type="number"
                  min={50}
                  max={999}
                  value={customEurRate}
                  onChange={(e) => setCustomEurRate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-left font-bold text-gray-900 bg-gray-50 focus:bg-white focus:border-primary outline-none"
                  dir="ltr"
                />
              </div>
            )}
          </div>
          {/* Logo Upload */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary"/> شعار الموقع (Logo)
            </h2>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-50 border rounded-full flex items-center justify-center overflow-hidden">
                {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <span className="text-gray-400 text-sm">بدون شعار</span>}
              </div>
              <div className="flex-1">
                <label className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors inline-block">
                  رفع شعار جديد
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                <p className="text-gray-400 text-sm mt-2">يُفضل استخدام صورة بخلفية شفافة (PNG) بحجم لا يتجاوز 400 بكسل.</p>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary"/> أوقات العمل
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-600">أوقات العمل (عربي)</label>
                <input value={hoursAr} onChange={e=>setHoursAr(e.target.value)} placeholder="مثال: من الأحد إلى الخميس: 09:00 ص - 05:00 م" className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white transition-colors" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">أوقات العمل (فرنسي)</label>
                <input value={hoursFr} onChange={e=>setHoursFr(e.target.value)} placeholder="Ex: Dim - Jeu : 09:00 - 17:00" dir="ltr" className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Contact & Social Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary"/> أرقام التواصل والسوشيال ميديا
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2 text-gray-600">رقم الهاتف 1</label>
                <input value={contact.phone1} onChange={e=>handleContactChange('phone1', e.target.value)} dir="ltr" className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">رقم الهاتف 2</label>
                <input value={contact.phone2} onChange={e=>handleContactChange('phone2', e.target.value)} dir="ltr" className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">البريد الإلكتروني</label>
                <input value={contact.email} onChange={e=>handleContactChange('email', e.target.value)} dir="ltr" className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">رقم الواتساب (بالصيغة الدولية، بدون +)</label>
                <input value={contact.whatsapp} onChange={e=>handleContactChange('whatsapp', e.target.value)} placeholder="213555536525" dir="ltr" className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">رابط فيسبوك</label>
                <input value={contact.facebook} onChange={e=>handleContactChange('facebook', e.target.value)} dir="ltr" placeholder="https://facebook.com/..." className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">رابط إنستغرام</label>
                <input value={contact.instagram} onChange={e=>handleContactChange('instagram', e.target.value)} dir="ltr" placeholder="https://instagram.com/..." className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-600">رابط تيك توك</label>
                <input value={contact.tiktok} onChange={e=>handleContactChange('tiktok', e.target.value)} dir="ltr" placeholder="https://tiktok.com/..." className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" />
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-gray-800 mb-4">تطبيق إضافي مخصص (مثال: Telegram, YouTube)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-gray-600">اسم التطبيق</label>
                  <input value={contact.customAppName} onChange={e=>handleContactChange('customAppName', e.target.value)} placeholder="مثال: يوتيوب" className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-gray-600">الرابط</label>
                  <input value={contact.customApp} onChange={e=>handleContactChange('customApp', e.target.value)} dir="ltr" placeholder="https://..." className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Form Links */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary"/> إدارة روابط الفورميلا (Google Forms / Tally)
            </h2>
            <p className="text-gray-500 mb-6 text-sm">ضع رابط الاستمارة الخاص بكل خدمة ليتم توجيه الزبون إليها عند الضغط على زر الحجز أو الاستفسار.</p>
            
            <div className="space-y-4">
              {[
                { key: 'omra', label: 'استمارة حجز العمرة' },
                { key: 'organizedTrips', label: 'استمارة الرحلات المنظمة' },
                { key: 'visa', label: 'استمارة التأشيرة والإقامة' },
                { key: 'wellness', label: 'استمارة الرفاهية والاستشفاء' },
                { key: 'carRental', label: 'استمارة تأجير السيارات' },
                { key: 'vip', label: 'استمارة رحلات VIP' },
                { key: 'insurance', label: 'استمارة تأمين السفر' },
                { key: 'payment', label: 'استمارة حلول الدفع' }
              ].map((item) => (
                <div key={item.key} className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="md:w-1/3 font-bold text-gray-700">{item.label}</label>
                  <input 
                    value={forms[item.key as keyof typeof forms]} 
                    onChange={e => handleFormChange(item.key as keyof typeof forms, e.target.value)} 
                    placeholder="https://tally.so/r/..." 
                    dir="ltr"
                    className="flex-1 border-gray-200 border rounded-lg p-2 bg-white w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
