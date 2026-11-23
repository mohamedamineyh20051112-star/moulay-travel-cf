"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FormField {
  id: string;
  type: string;
  label: Record<string, string>;
  required: boolean;
  options?: Record<string, string>[];
  defaultValue?: string;
  readOnly?: boolean;
  hidden?: boolean;
}

interface DynamicFormProps {
  formId: string;
  config: {
    title: Record<string, string>;
    fields: FormField[];
  };
  locale: string;
}

export default function DynamicForm({ formId, config, locale }: DynamicFormProps) {
  const isRtl = locale === 'ar';
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    config.fields.forEach(f => {
      if (f.defaultValue) initial[f.id] = f.defaultValue;
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const res = await fetch('/api/submit-dynamic-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, data: formData })
      });

      if (res.ok) {
        setSubmitStatus("success");
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error(error);
      setSubmitStatus("error");
    }

    setIsSubmitting(false);
  };

  if (submitStatus === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto my-8 text-center"
      >
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
        <h3 className="text-3xl font-bold text-gray-800 mb-4">
          {locale === 'ar' ? 'تمت العملية بنجاح' : locale === 'fr' ? 'Demande reçue avec succès!' : 'Request received successfully!'}
        </h3>
        <p className="text-gray-600 text-lg mb-8">
          {locale === 'ar' ? 'سيتواصل معك فريقنا قريباً لتأكيد التفاصيل.' : locale === 'fr' ? 'Notre équipe vous contactera bientôt.' : 'Our team will contact you soon.'}
        </p>
        <button 
          onClick={() => { setSubmitStatus("idle"); setFormData({}); }}
          className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          {locale === 'ar' ? 'إرسال طلب آخر' : locale === 'fr' ? 'Envoyer une autre demande' : 'Send another request'}
        </button>
      </motion.div>
    );
  }

  return (
    <div className={`bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto my-8 ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? "rtl" : "ltr"}>
      <h2 className="text-3xl font-bold text-primary mb-4 text-center">
        {config.title[locale] || config.title['en']}
      </h2>
      <div className="w-16 h-1 bg-gold rounded-full mx-auto mb-8"></div>

      {submitStatus === "error" && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center font-medium">
          {locale === 'ar' ? 'حدث خطأ أثناء الإرسال. يرجى المحاولة لاحقاً.' : locale === 'fr' ? 'Une erreur est survenue.' : 'An error occurred.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {config.fields.map((field) => {
          if (field.hidden) {
            return (
              <input 
                key={field.id} 
                type="hidden" 
                name={field.id} 
                value={formData[field.id] || ''} 
              />
            );
          }
          return (
          <div key={field.id}>
            <label className="block text-gray-700 font-bold mb-2">
              {field.label[locale] || field.label['en']}
              {field.required && <span className="text-red-500 mr-1">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                required={field.required}
                readOnly={field.readOnly}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className={`w-full border border-gray-300 rounded-xl p-4 transition-all min-h-[120px] outline-none ${
                  field.readOnly 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-transparent' 
                    : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gold focus:border-transparent'
                }`}
              />
            ) : field.type === 'select' ? (
              <select
                required={field.required}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-4 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition-all"
              >
                <option value="">{locale === 'ar' ? 'اختر...' : locale === 'fr' ? 'Sélectionner...' : 'Select...'}</option>
                {field.options?.map((opt, idx) => (
                  <option key={idx} value={opt[locale] || opt['en']}>
                    {opt[locale] || opt['en']}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : field.type === 'tel' ? 'tel' : field.type === 'date' ? 'date' : 'text'}
                required={field.required}
                readOnly={field.readOnly}
                value={formData[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                dir={field.type === 'tel' ? 'ltr' : isRtl ? 'rtl' : 'ltr'}
                className={`w-full border border-gray-300 rounded-xl p-4 transition-all outline-none ${field.type === 'tel' ? (isRtl ? 'text-right' : 'text-left') : ''} ${
                  field.readOnly 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-transparent font-medium' 
                    : 'bg-gray-50 focus:bg-white focus:ring-2 focus:ring-gold focus:border-transparent'
                }`}
              />
            )}
          </div>
        )})}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gold hover:bg-yellow-500 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-colors mt-8 text-lg"
        >
          {isSubmitting && <Loader2 className="w-6 h-6 animate-spin" />}
          {locale === 'ar' ? 'إرسال الطلب' : locale === 'fr' ? 'Envoyer la demande' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
