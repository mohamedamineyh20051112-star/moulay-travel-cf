"use client";

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { defaultFormsConfig } from '@/data/defaultForms';
import { CheckCircle, Info, Settings, LayoutTemplate } from 'lucide-react';

export default function AdminFormsPage({ params: { locale } }: { params: { locale: string } }) {
  const [activeForm, setActiveForm] = useState<string>('visas');
  
  const formsList = Object.keys(defaultFormsConfig);
  const config = defaultFormsConfig[activeForm];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <LayoutTemplate className="w-8 h-8 text-primary" />
            {locale === 'ar' ? 'منشئ النماذج التلقائية' : 'Générateur de formulaires'}
          </h1>
          <p className="text-gray-500 mt-2">
            {locale === 'ar' ? 'تم إنشاء الاستمارات التالية تلقائياً للخدمات التي ليس لديها استمارة مخصصة.' : 'Formulaires générés automatiquement.'}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4 mb-8">
        <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-blue-900 mb-2">
            {locale === 'ar' ? 'استمارات مدمجة وجاهزة' : 'Formulaires intégrés et prêts'}
          </h3>
          <p className="text-blue-800/80 leading-relaxed text-sm">
            {locale === 'ar' 
              ? 'لقد قمنا بتصميم وبناء استمارات ديناميكية مخصصة لكل خدمة (تأشيرات، تأجير سيارات، رحلات VIP، الخ). هذه الاستمارات تعمل تلقائياً الآن في الموقع وترسل البيانات مباشرة إلى Google Sheets بدون الحاجة لاستخدام Tally أو Google Forms.' 
              : 'Nous avons conçu des formulaires dynamiques. Ils sont prêts à être utilisés.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">
              {locale === 'ar' ? 'النماذج المتاحة' : 'Formulaires'}
            </div>
            <div className="p-2">
              {formsList.map((formKey) => (
                <button
                  key={formKey}
                  onClick={() => setActiveForm(formKey)}
                  className={`w-full text-start p-4 rounded-xl mb-1 transition-all flex justify-between items-center ${
                    activeForm === formKey 
                      ? 'bg-primary/10 text-primary font-bold' 
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>{defaultFormsConfig[formKey].title[locale] || defaultFormsConfig[formKey].title['en']}</span>
                  <CheckCircle className={`w-4 h-4 ${activeForm === formKey ? 'text-primary' : 'text-green-500/50'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">
                {config.title[locale] || config.title['en']}
              </h2>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {locale === 'ar' ? 'نشط الآن' : 'Actif'}
              </span>
            </div>
            
            <div className="p-6">
              <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" /> 
                {locale === 'ar' ? 'الحقول المبرمجة' : 'Champs'}
              </h3>
              
              <div className="space-y-3">
                {config.fields.map((field: any, idx: number) => (
                  <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="bg-white w-10 h-10 rounded-lg shadow-sm flex items-center justify-center font-bold text-gray-400">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {field.label[locale] || field.label['en']}
                          {field.required && <span className="text-red-500 mx-1">*</span>}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{field.type}</p>
                      </div>
                    </div>
                    
                    {field.options && (
                      <div className="mt-3 md:mt-0 md:w-1/3">
                        <p className="text-xs text-gray-500 mb-1">{locale === 'ar' ? 'الخيارات المتاحة:' : 'Options:'}</p>
                        <div className="flex flex-wrap gap-1">
                          {field.options.map((opt: any, oIdx: number) => (
                            <span key={oIdx} className="bg-white border border-gray-200 text-gray-600 text-[10px] px-2 py-1 rounded-md">
                              {opt[locale] || opt['en']}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
