'use client';
import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface OTDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

export default function OTDestinationModal({ isOpen, onClose, onSave, initialData }: OTDestinationModalProps) {
  const [formData, setFormData] = useState({
    nameAr: initialData?.nameAr || '',
    nameFr: initialData?.nameFr || '',
    countryAr: initialData?.countryAr || '',
    countryFr: initialData?.countryFr || '',
    image: initialData?.image || ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.image || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;
      if (imageFile) {
        const storageRef = ref(storage, `destinations/organized/${Date.now()}_${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);
        
        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }
      
      await onSave({
        ...formData,
        image: imageUrl
      });
    } catch (error) {
      console.error("Error uploading image: ", error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {initialData ? 'تعديل الوجهة' : 'إضافة وجهة جديدة'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="dest-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الوجهة / العاصمة (عربي) *</label>
                <input
                  required
                  type="text"
                  value={formData.nameAr}
                  onChange={e => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="مثال: إسطنبول"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم / العاصمة (فرنسي)</label>
                <input
                  type="text"
                  value={formData.nameFr}
                  onChange={e => setFormData({ ...formData, nameFr: e.target.value })}
                  className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: Istanbul"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدولة (عربي)</label>
                <input
                  type="text"
                  value={formData.countryAr}
                  onChange={e => setFormData({ ...formData, countryAr: e.target.value })}
                  className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="مثال: تركيا"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الدولة (فرنسي)</label>
                <input
                  type="text"
                  value={formData.countryFr}
                  onChange={e => setFormData({ ...formData, countryFr: e.target.value })}
                  className="w-full border rounded-xl p-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ex: Turquie"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة الوجهة</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-gray-500 text-sm">انقر لرفع صورة</span>
              </div>
              
              {previewUrl && (
                <div className="mt-4 rounded-xl overflow-hidden h-40 border border-gray-100 relative">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-white font-bold">{Math.round(uploadProgress)}%</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            form="dest-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-medium bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ الوجهة'}
          </button>
        </div>
      </div>
    </div>
  );
}

