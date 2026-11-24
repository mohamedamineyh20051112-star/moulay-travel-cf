export type ServiceCategory =
  | 'vip_trips'
  | 'organized_trips'
  | 'hammams'
  | 'omra'
  | 'cars';

export type FeatureIconKey =
  | 'wifi'
  | 'utensils'
  | 'bus'
  | 'plane'
  | 'shield'
  | 'sparkles'
  | 'waves'
  | 'car'
  | 'bell'
  | 'compass'
  | 'mapPin'
  | 'snowflake'
  | 'check';

export interface ServiceFeaturePreset {
  id: string;
  icon: FeatureIconKey;
  label: {
    ar: string;
    fr: string;
    en: string;
  };
  defaultEnabled?: boolean;
}

export interface CustomServiceFeature {
  id: string;
  ar: string;
  fr?: string;
  en?: string;
}

export const SERVICE_FEATURES_CATALOG: Record<ServiceCategory, ServiceFeaturePreset[]> = {
  vip_trips: [
    { id: 'vip_concierge', icon: 'sparkles', label: { ar: 'مرافقة وخدمة VIP 24/7', fr: 'Conciergerie VIP 24h/24', en: '24/7 VIP Concierge' }, defaultEnabled: true },
    { id: 'private_transfer', icon: 'car', label: { ar: 'نقل خاص بسيارة فخمة', fr: 'Transfert privé de luxe', en: 'Private Luxury Transfer' }, defaultEnabled: true },
    { id: 'flight_included', icon: 'plane', label: { ar: 'تذاكر الطيران مشمولة', fr: 'Billets d’avion inclus', en: 'Flights Included' }, defaultEnabled: true },
    { id: 'wifi', icon: 'wifi', label: { ar: 'إنترنت واي فاي مجاني', fr: 'Wi-Fi haut débit gratuit', en: 'Free High-Speed Wi-Fi' }, defaultEnabled: true },
    { id: 'gourmet_food', icon: 'utensils', label: { ar: 'إطعام فاخر / فطور الصباح', fr: 'Restauration gastronomique', en: 'Fine Dining / Breakfast' }, defaultEnabled: true },
    { id: 'spa_access', icon: 'waves', label: { ar: 'سبا ومسبح خاص', fr: 'Accès Spa & Piscine', en: 'Spa & Pool Access' }, defaultEnabled: false },
    { id: 'private_tours', icon: 'compass', label: { ar: 'جولات سياحية خاصة', fr: 'Excursions privées', en: 'Private Guided Tours' }, defaultEnabled: true },
    { id: 'travel_insurance', icon: 'shield', label: { ar: 'تأمين سفر شامل', fr: 'Assurance voyage complète', en: 'Full Travel Insurance' }, defaultEnabled: false },
  ],
  organized_trips: [
    { id: 'flight_included', icon: 'plane', label: { ar: 'تذكرة الطيران ذهاباً وإياباً', fr: 'Vol aller-retour inclus', en: 'Round-trip Flight Included' }, defaultEnabled: true },
    { id: 'hotel_stay', icon: 'bell', label: { ar: 'إقامة فندقية مريحة', fr: 'Hébergement hôtelier confortable', en: 'Comfortable Hotel Stay' }, defaultEnabled: true },
    { id: 'food_included', icon: 'utensils', label: { ar: 'وجبة الإفطار / الإطعام', fr: 'Petit-déjeuner / Pension', en: 'Breakfast / Meals' }, defaultEnabled: true },
    { id: 'group_transport', icon: 'bus', label: { ar: 'نقل سياحي مريح', fr: 'Transport touristique inclus', en: 'Tour Transport Included' }, defaultEnabled: true },
    { id: 'guided_excursions', icon: 'compass', label: { ar: 'خرجات وجولات منظمة', fr: 'Visites et excursions guidées', en: 'Guided Sightseeing Tours' }, defaultEnabled: true },
    { id: 'tour_leader', icon: 'sparkles', label: { ar: 'مرشد مرافق طيلة الرحلة', fr: 'Guide accompagnateur dédié', en: 'Dedicated Tour Leader' }, defaultEnabled: true },
    { id: 'wifi', icon: 'wifi', label: { ar: 'واي فاي مجاني بالفندق', fr: 'Wi-Fi gratuit à l’hôtel', en: 'Free Hotel Wi-Fi' }, defaultEnabled: false },
    { id: 'visa_help', icon: 'shield', label: { ar: 'مرافقة ملف التأشيرة', fr: 'Assistance visa', en: 'Visa Assistance' }, defaultEnabled: false },
  ],
  hammams: [
    { id: 'thermal_water', icon: 'waves', label: { ar: 'مياه معدنية علاجية', fr: 'Eaux thermales naturelles', en: 'Natural Thermal Waters' }, defaultEnabled: true },
    { id: 'food_included', icon: 'utensils', label: { ar: 'مطعم وإطعام', fr: 'Restaurant & Pension', en: 'Restaurant & Dining' }, defaultEnabled: true },
    { id: 'transport', icon: 'bus', label: { ar: 'خدمة النقل متوفرة', fr: 'Transport disponible', en: 'Transport Available' }, defaultEnabled: false },
    { id: 'wifi', icon: 'wifi', label: { ar: 'واي فاي مجاني', fr: 'Wi-Fi gratuit', en: 'Free Wi-Fi' }, defaultEnabled: true },
    { id: 'parking', icon: 'car', label: { ar: 'موقف سيارات مؤمن', fr: 'Parking sécurisé', en: 'Secure Parking' }, defaultEnabled: true },
    { id: 'reception_24', icon: 'bell', label: { ar: 'استقبال 24/24', fr: 'Réception 24h/24', en: '24/7 Reception' }, defaultEnabled: true },
    { id: 'spa_massage', icon: 'sparkles', label: { ar: 'جلسات تدليك واسترخاء', fr: 'Massages & Bien-être', en: 'Massage & Wellness' }, defaultEnabled: true },
  ],
  omra: [
    { id: 'visa_included', icon: 'shield', label: { ar: 'تأشيرة العمرة مشمولة', fr: 'Visa Omra inclus', en: 'Omra Visa Included' }, defaultEnabled: true },
    { id: 'flight_included', icon: 'plane', label: { ar: 'تذكرة الطيران ذهاباً وإياباً', fr: 'Billet d’avion A/R', en: 'Round-trip Flight' }, defaultEnabled: true },
    { id: 'transport', icon: 'bus', label: { ar: 'النقل بين المطار ومكة والمدينة', fr: 'Transferts Mekka / Médine', en: 'Makkah & Madinah Transfers' }, defaultEnabled: true },
    { id: 'ziyarat', icon: 'mapPin', label: { ar: 'مزارات دينية مؤطرة', fr: 'Visites guidées (Ziyarat)', en: 'Guided Ziyarat Tours' }, defaultEnabled: true },
    { id: 'food_included', icon: 'utensils', label: { ar: 'الإطعام / فطور الصباح', fr: 'Restauration incluse', en: 'Meals / Breakfast' }, defaultEnabled: true },
    { id: 'guide_religious', icon: 'sparkles', label: { ar: 'مرشد ديني ومرافق', fr: 'Encadrement religieux', en: 'Religious Guide' }, defaultEnabled: true },
    { id: 'installment', icon: 'check', label: { ar: 'متاح بالتقسيط الميسر', fr: 'Paiement par facilité', en: 'Installment Available' }, defaultEnabled: false },
  ],
  cars: [
    { id: 'ac', icon: 'snowflake', label: { ar: 'مكيف هواء', fr: 'Climatisation', en: 'Air Conditioning' }, defaultEnabled: true },
    { id: 'insurance', icon: 'shield', label: { ar: 'تأمين شامل', fr: 'Assurance incluse', en: 'Insurance Included' }, defaultEnabled: true },
    { id: 'airport_delivery', icon: 'plane', label: { ar: 'توصيل للمطار والفندق', fr: 'Livraison aéroport & hôtel', en: 'Airport & Hotel Delivery' }, defaultEnabled: true },
    { id: 'unlimited_km', icon: 'compass', label: { ar: 'كيلومتراج مريح', fr: 'Kilométrage avantageux', en: 'Generous Mileage' }, defaultEnabled: false },
    { id: 'support_24', icon: 'bell', label: { ar: 'مساعدة 24/7 على الطريق', fr: 'Assistance 24h/24', en: '24/7 Roadside Support' }, defaultEnabled: true },
    { id: 'baby_seat', icon: 'sparkles', label: { ar: 'مقعد أطفال متاح', fr: 'Siège bébé disponible', en: 'Child Seat Available' }, defaultEnabled: false },
  ],
};

export function getDefaultEnabledFeatureIds(category: ServiceCategory): string[] {
  return SERVICE_FEATURES_CATALOG[category]
    .filter((f) => f.defaultEnabled)
    .map((f) => f.id);
}

export interface ResolvedFeatureBadge {
  id: string;
  icon: FeatureIconKey;
  label: string;
}

/**
 * Resolves visible feature badges for a card or details page.
 * - For `cars`: strictly renders only explicitly saved `enabledFeatures` + `customFeatures`
 *   (no automatic default perks on unconfigured cars).
 * - For other categories: respects `enabledFeatures` + `customFeatures` directly whenever
 *   `enabledFeatures` array exists (works with or without `featuresConfigured`), and falls back
 *   to catalog defaults only for legacy documents without `enabledFeatures`.
 */
export function resolveItemFeatures(
  category: ServiceCategory,
  item: any,
  locale: string
): ResolvedFeatureBadge[] {
  const catalog = SERVICE_FEATURES_CATALOG[category];
  const langKey = locale === 'en' ? 'en' : locale === 'fr' ? 'fr' : 'ar';

  const result: ResolvedFeatureBadge[] = [];

  const getMealDetail = (): string => {
    const raw =
      langKey === 'en'
        ? item?.foodTypeEn || item?.foodTypeFr || item?.foodTypeAr || item?.food?.type?.en || item?.food?.type?.fr || item?.food?.type?.ar
        : langKey === 'fr'
          ? item?.foodTypeFr || item?.foodTypeAr || item?.food?.type?.fr || item?.food?.type?.ar
          : item?.foodTypeAr || item?.food?.type?.ar || item?.food?.type?.fr;
    return typeof raw === 'string' ? raw.trim() : '';
  };

  const formatPresetLabel = (preset: ServiceFeaturePreset): string => {
    const baseLabel = preset.label[langKey] || preset.label.fr || preset.label.ar;
    if (preset.id === 'food_included' || preset.id === 'gourmet_food') {
      const mealDetail = getMealDetail();
      if (
        mealDetail &&
        !baseLabel.toLowerCase().includes(mealDetail.toLowerCase()) &&
        mealDetail !== 'متوفر' &&
        mealDetail.toLowerCase() !== 'inclus'
      ) {
        return `${baseLabel} (${mealDetail})`;
      }
    }
    return baseLabel;
  };

  if (Array.isArray(item?.enabledFeatures)) {
    const enabledSet = new Set<string>(item.enabledFeatures);
    for (const preset of catalog) {
      if (enabledSet.has(preset.id)) {
        result.push({
          id: preset.id,
          icon: preset.icon,
          label: formatPresetLabel(preset),
        });
      }
    }
  } else if (category !== 'cars') {
    // Backward compatibility with legacy boolean flags for non-car categories
    for (const preset of catalog) {
      let enabled = Boolean(preset.defaultEnabled);
      if (preset.id === 'food_included' || preset.id === 'gourmet_food') {
        if (typeof item?.hasFood === 'boolean') enabled = item.hasFood;
      }
      if (preset.id === 'transport' || preset.id === 'group_transport' || preset.id === 'private_transfer') {
        if (typeof item?.hasTransport === 'boolean') enabled = item.hasTransport;
        if (typeof item?.transportAvailable === 'boolean') enabled = item.transportAvailable;
      }
      if (enabled) {
        result.push({
          id: preset.id,
          icon: preset.icon,
          label: formatPresetLabel(preset),
        });
      }
    }
  }

  if (Array.isArray(item?.customFeatures)) {
    for (const cf of item.customFeatures as CustomServiceFeature[]) {
      const label =
        langKey === 'en'
          ? cf.en || cf.fr || cf.ar
          : langKey === 'fr'
            ? cf.fr || cf.ar
            : cf.ar;
      if (label?.trim()) {
        result.push({
          id: cf.id || label,
          icon: 'check',
          label: label.trim(),
        });
      }
    }
  }

  return result;
}
