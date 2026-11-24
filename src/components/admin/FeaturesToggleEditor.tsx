'use client';

import { useState } from 'react';
import { CheckSquare, Square, Plus, Trash2, Sparkles } from 'lucide-react';
import {
  SERVICE_FEATURES_CATALOG,
  ServiceCategory,
  CustomServiceFeature,
} from '@/data/serviceFeatures';

interface FeaturesToggleEditorProps {
  category: ServiceCategory;
  enabledFeatures: string[];
  customFeatures: CustomServiceFeature[];
  onChangeEnabled: (ids: string[]) => void;
  onChangeCustom: (items: CustomServiceFeature[]) => void;
}

export default function FeaturesToggleEditor({
  category,
  enabledFeatures,
  customFeatures,
  onChangeEnabled,
  onChangeCustom,
}: FeaturesToggleEditorProps) {
  const [newAr, setNewAr] = useState('');
  const [newFr, setNewFr] = useState('');

  const presets = SERVICE_FEATURES_CATALOG[category] || [];

  const toggleFeature = (id: string) => {
    if (enabledFeatures.includes(id)) {
      onChangeEnabled(enabledFeatures.filter((x) => x !== id));
    } else {
      onChangeEnabled([...enabledFeatures, id]);
    }
  };

  const handleAddCustom = () => {
    if (!newAr.trim()) return;
    const item: CustomServiceFeature = {
      id: `custom_${Date.now()}`,
      ar: newAr.trim(),
      fr: newFr.trim() || '',
    };
    onChangeCustom([...customFeatures, item]);
    setNewAr('');
    setNewFr('');
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
      <div>
        <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-primary" />
          الخدمات والمميزات المعروضة في البطاقة (يمكنك تفعيل أو إخفاء أي خدمة)
        </h4>
        <p className="text-xs text-gray-500 mt-0.5">
          اختر الخدمات التي تظهر للزبون في البطاقة وصفحة التفاصيل.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {presets.map((feat) => {
          const active = enabledFeatures.includes(feat.id);
          return (
            <button
              key={feat.id}
              type="button"
              onClick={() => toggleFeature(feat.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition-all ${
                active
                  ? 'bg-primary/10 border-primary text-primary font-bold'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {active ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-gray-400 shrink-0" />
              )}
              <span className="text-xs sm:text-sm truncate">{feat.label.ar}</span>
            </button>
          );
        })}
      </div>

      {/* Custom added features */}
      {customFeatures.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <p className="text-xs font-bold text-gray-700">مميزات مخصصة مضافة:</p>
          <div className="flex flex-wrap gap-2">
            {customFeatures.map((cf, idx) => (
              <div
                key={cf.id || idx}
                className="inline-flex items-center gap-2 bg-white border border-primary/30 text-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                <span>{cf.ar}</span>
                {cf.fr && <span className="text-gray-400">({cf.fr})</span>}
                <button
                  type="button"
                  onClick={() => onChangeCustom(customFeatures.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add custom feature input */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs font-bold text-gray-700 mb-2">إضافة خدمة / ميزة إضافية خاصة بهذه البطاقة:</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newAr}
            onChange={(e) => setNewAr(e.target.value)}
            placeholder="الميزة بالعربية (مثال: جولة باليخت)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
          />
          <input
            type="text"
            value={newFr}
            onChange={(e) => setNewFr(e.target.value)}
            placeholder="بالفرنسية (اختياري - تترجم تلقائياً)"
            dir="ltr"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            disabled={!newAr.trim()}
            className="bg-primary hover:bg-gold text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة
          </button>
        </div>
      </div>
    </div>
  );
}
