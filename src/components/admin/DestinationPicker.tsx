'use client';

import { useState } from 'react';
import { Globe, Search, Plus, Check, Loader2, Upload, MapPin } from 'lucide-react';
import {
  WORLD_DESTINATIONS,
  WorldDestinationPreset,
  filterLocalWorldDestinations,
  searchGlobalCountries,
} from '@/data/worldDestinations';
import { compressImageFileToBase64 } from '@/lib/smartImageCompress';

interface DestinationPickerProps {
  destinations: any[];
  destinationId: string;
  newDestNameAr: string;
  newDestNameFr: string;
  newDestImage: string;
  onSelectExisting: (id: string) => void;
  onSelectPresetNew: (preset: { nameAr: string; nameFr: string; image: string; code?: string }) => void;
  onUpdateNewFields: (fields: { nameAr?: string; nameFr?: string; image?: string }) => void;
}

export default function DestinationPicker({
  destinations,
  destinationId,
  newDestNameAr,
  newDestNameFr,
  newDestImage,
  onSelectExisting,
  onSelectPresetNew,
  onUpdateNewFields,
}: DestinationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<WorldDestinationPreset[] | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [selectedPresetCode, setSelectedPresetCode] = useState<string | null>(null);

  const localPresets = filterLocalWorldDestinations(searchQuery);
  const displayedPresets = globalResults !== null ? globalResults : localPresets;

  const handleGlobalSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setIsSearchingGlobal(true);
    const res = await searchGlobalCountries(searchQuery);
    setGlobalResults(res);
    setIsSearchingGlobal(false);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setGlobalResults(null);
    }
  };

  const findMatchingExistingDest = (preset: WorldDestinationPreset) => {
    const pAr = preset.nameAr.trim().toLowerCase();
    const pFr = preset.nameFr.trim().toLowerCase();
    return destinations.find((d) => {
      const dAr = String(d.nameAr || '').trim().toLowerCase();
      const dFr = String(d.nameFr || '').trim().toLowerCase();
      const dCode = String(d.countryCode || '').trim().toLowerCase();
      return (
        (dCode && dCode === preset.code.toLowerCase()) ||
        (dAr && dAr === pAr) ||
        (dFr && dFr === pFr)
      );
    });
  };

  const handlePickPreset = (preset: WorldDestinationPreset) => {
    const existing = findMatchingExistingDest(preset);
    if (existing) {
      setSelectedPresetCode(null);
      onSelectExisting(existing.id);
    } else {
      setSelectedPresetCode(preset.code);
      onSelectPresetNew({
        nameAr: preset.nameAr,
        nameFr: preset.nameFr,
        image: preset.flag,
        code: preset.code,
      });
    }
  };

  const handleUploadCustomImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const compressed = await compressImageFileToBase64(file, {
        maxDimension: 850,
        maxBytes: 110_000,
      });
      onUpdateNewFields({ image: compressed });
    } catch (err: any) {
      alert(err?.message || 'تعذر ضغط الصورة');
    }
  };

  return (
    <div className="col-span-1 md:col-span-2 bg-gray-50/80 border border-gray-200 rounded-2xl p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          الوجهة (البلد / المنطقة) *
        </label>
        <button
          type="button"
          onClick={() => {
            setSelectedPresetCode(null);
            onSelectPresetNew({ nameAr: '', nameFr: '', image: '' });
          }}
          className="text-xs font-bold bg-white border border-primary/30 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة وجهة أخرى مخصصة
        </button>
      </div>

      {/* Existing Saved Destinations Dropdown */}
      {destinations.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5 font-medium">الوجهات المضافة مسبقاً في موقعك:</p>
          <select
            value={destinationId === 'NEW' ? '' : destinationId}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedPresetCode(null);
                onSelectExisting(e.target.value);
              }
            }}
            className="w-full border border-gray-300 rounded-xl p-2.5 bg-white text-gray-900 font-medium"
          >
            <option value="">-- اختر من وجهاتك المحفوظة أو اختر دولة بالأعلام بالأسفل --</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameAr} {d.nameFr && d.nameFr !== d.nameAr ? `(${d.nameFr})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search Bar + Global World Country Search */}
      <div className="space-y-2">
        <p className="text-xs text-gray-600 font-bold">
          أو اختر مباشرة من أشهر وجهات العالم بالأعلام (أو ابحث عن أي دولة أخرى):
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGlobalSearch();
                }
              }}
              placeholder="ابحث عن دولة (مثال: تركيا، دبي، اليونان، Maldives...)"
              className="w-full pr-9 pl-3 py-2 border border-gray-300 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="button"
            onClick={handleGlobalSearch}
            disabled={isSearchingGlobal || searchQuery.trim().length < 2}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-gold transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
          >
            {isSearchingGlobal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            بحث عالمي
          </button>
        </div>
      </div>

      {/* Presets / Global Search Grid */}
      <div className="max-h-48 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-1">
        {displayedPresets.length === 0 ? (
          <div className="col-span-full text-center py-4 text-xs text-gray-500 flex flex-col items-center gap-2">
            <span>لم يتم العثور على هذه الوجهة في القائمة المختصرة.</span>
            <div className="flex gap-2">
              {searchQuery.trim().length >= 2 && (
                <button
                  type="button"
                  onClick={handleGlobalSearch}
                  className="bg-primary text-white px-3 py-1.5 rounded-lg font-bold"
                >
                  بحث في دول العالم
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedPresetCode(null);
                  onSelectPresetNew({ nameAr: searchQuery.trim(), nameFr: '', image: '' });
                }}
                className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-bold"
              >
                + إضافة "{searchQuery.trim() || 'وجهة مخصصة'}" يدوياً
              </button>
            </div>
          </div>
        ) : (
          displayedPresets.map((preset) => {
            const existing = findMatchingExistingDest(preset);
            const isSelected =
              (existing && existing.id === destinationId) ||
              (destinationId === 'NEW' && selectedPresetCode === preset.code);

            return (
              <button
                key={preset.code}
                type="button"
                onClick={() => handlePickPreset(preset)}
                className={`flex items-center gap-2 p-2 rounded-xl border text-right transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                    : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <img
                  src={preset.flag}
                  alt={preset.nameAr}
                  className="w-7 h-5 rounded object-cover border border-gray-200 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{preset.nameAr}</p>
                  <p className="text-[10px] text-gray-500 truncate" dir="ltr">
                    {preset.nameFr}
                  </p>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
              </button>
            );
          })
        )}
      </div>

      {/* Selected Preset Preview OR Custom Destination Inputs */}
      {destinationId === 'NEW' && (
        <div className="bg-white border border-primary/25 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-primary flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {selectedPresetCode
                ? 'وجهة عالمية جديدة (ستُحفظ تلقائياً بالعربية والفرنسية مع العلم)'
                : 'إضافة وجهة جديدة مخصصة'}
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">اسم الوجهة (عربي) *</label>
              <input
                type="text"
                value={newDestNameAr}
                onChange={(e) => onUpdateNewFields({ nameAr: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white"
                placeholder="مثال: تركيا / جيجل / دبي"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">اسم الوجهة (فرنسي)</label>
              <input
                type="text"
                value={newDestNameFr}
                onChange={(e) => onUpdateNewFields({ nameFr: e.target.value })}
                className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white"
                dir="ltr"
                placeholder="Ex: Turquie / Jijel / Dubaï"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            {newDestImage ? (
              <div className="flex items-center gap-3">
                <img
                  src={newDestImage}
                  alt={newDestNameAr}
                  className="w-16 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => onUpdateNewFields({ image: '' })}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  إزالة الصورة
                </button>
              </div>
            ) : null}

            <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {newDestImage ? 'تغيير صورة الوجهة / العلم' : 'رفع صورة للوجهة (اختياري)'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCustomImage}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
