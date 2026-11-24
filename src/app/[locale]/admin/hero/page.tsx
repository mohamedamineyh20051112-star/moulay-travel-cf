'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Link from 'next/link';
import { ChevronRight, Trash2, Plus, Laptop, Smartphone, Download } from 'lucide-react';

interface HeroImageDoc {
  id: string;
  type: 'desktop' | 'mobile';
  imageBase64: string;
  createdAt?: string;
}

export default function HeroAdmin({ params }: { params: { locale: string } }) {
  const [images, setImages] = useState<HeroImageDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'heroImages'));
      setImages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<HeroImageDoc, 'id'>) })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      try {
        await deleteDoc(doc(db, 'heroImages', id));
        fetchImages();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'desktop' | 'mobile'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = type === 'desktop' ? 1400 : 1000;
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
        const base64 = canvas.toDataURL('image/jpeg', 0.8);

        try {
          await addDoc(collection(db, 'heroImages'), {
            type,
            imageBase64: base64,
            createdAt: new Date().toISOString(),
          });
          fetchImages();
        } catch (err) {
          console.error(err);
          alert('حدث خطأ أثناء رفع الصورة');
        }
        setUploading(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleImportDefaults = async () => {
    if (!confirm('هل تريد استيراد الصور الأصلية للموقع إلى قاعدة البيانات؟')) return;
    setUploading(true);
    try {
      const urls: Array<{ url: string; type: 'desktop' | 'mobile' }> = [
        { url: '/hero-desktop.jpg', type: 'desktop' },
        { url: '/hero-desktop-2.jpg', type: 'desktop' },
        { url: '/hero-desktop-3.jpg', type: 'desktop' },
        { url: '/hero-desktop-4.jpg', type: 'desktop' },
        { url: '/hero-desktop-5.jpg', type: 'desktop' },
        { url: '/hero-desktop-6.jpg', type: 'desktop' },
        { url: '/hero-mobile.jpg', type: 'mobile' },
        { url: '/hero-mobile-2.jpg', type: 'mobile' },
        { url: '/hero-mobile-3.jpg', type: 'mobile' },
        { url: '/hero-mobile-4.jpg', type: 'mobile' },
        { url: '/hero-mobile-5.jpg', type: 'mobile' },
        { url: '/hero-mobile-6.jpg', type: 'mobile' },
      ];
      const existingBase64 = new Set(images.map((img) => img.imageBase64));
      for (const item of urls) {
        const res = await fetch(item.url);
        if (!res.ok) continue;
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve) => {
          const r = new FileReader();
          r.onloadend = () => resolve(r.result as string);
          r.readAsDataURL(blob);
        });
        if (existingBase64.has(base64)) continue;
        existingBase64.add(base64);
        await addDoc(collection(db, 'heroImages'), {
          type: item.type,
          imageBase64: base64,
          createdAt: new Date().toISOString(),
        });
      }
      alert('تم الاستيراد بنجاح!');
      fetchImages();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الاستيراد');
    }
    setUploading(false);
  };

  const desktopImages = images.filter((i) => i.type === 'desktop');
  const mobileImages = images.filter((i) => i.type === 'mobile');

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href={`/${params.locale}/admin`} className="hover:text-primary">
            لوحة التحكم
          </Link>
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-gray-800 font-medium">صور الواجهة (Hero Slider)</span>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">إدارة صور الواجهة الرئيسية</h1>
          <button
            type="button"
            onClick={handleImportDefaults}
            disabled={uploading}
            className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            استيراد الصور الأصلية
          </button>
        </div>

        {uploading && (
          <div className="bg-blue-50 text-blue-700 p-4 rounded-xl mb-6 font-medium text-center">
            جاري رفع الصورة وضغطها، يرجى الانتظار...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Desktop Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Laptop className="text-primary w-6 h-6" /> صور الحاسوب (أفقية)
              </h2>
              <label className="cursor-pointer bg-primary hover:bg-gold text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> إضافة صورة
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'desktop')}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              هذه الصور تظهر للزوار الذين يستخدمون جهاز الحاسوب وتتبدل تلقائياً في كل زيارة.
            </p>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : desktopImages.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                لا توجد صور حاسوب مخصصة، سيتم استخدام الصور الافتراضية المتجددة.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {desktopImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100"
                  >
                    <img src={img.imageBase64} alt="Hero Desktop" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      className="absolute top-2 left-2 bg-red-600 text-white p-2 rounded-lg opacity-90 hover:opacity-100 transition-opacity shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Images */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Smartphone className="text-primary w-6 h-6" /> صور الهاتف (عمودية)
              </h2>
              <label className="cursor-pointer bg-primary hover:bg-gold text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> إضافة صورة
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(e, 'mobile')}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              هذه الصور تظهر للزوار الذين يستخدمون الهاتف وتتبدل تلقائياً في كل زيارة.
            </p>
            {loading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : mobileImages.length === 0 ? (
              <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                لا توجد صور هاتف مخصصة، سيتم استخدام الصور الافتراضية المتجددة.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {mobileImages.map((img) => (
                  <div
                    key={img.id}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-[9/16] bg-gray-100"
                  >
                    <img src={img.imageBase64} alt="Hero Mobile" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      className="absolute top-2 left-2 bg-red-600 text-white p-2 rounded-lg opacity-90 hover:opacity-100 transition-opacity shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
