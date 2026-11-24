function extractSafeString(val: any, fallback: string = ''): string {
  if (typeof val === 'string') return val;
  if (!val || typeof val !== 'object') return fallback;
  if (typeof val.nameAr === 'string' && val.nameAr.trim()) return val.nameAr;
  if (typeof val.ar === 'string' && val.ar.trim()) return val.ar;
  if (typeof val.nameFr === 'string' && val.nameFr.trim()) return val.nameFr;
  if (typeof val.fr === 'string' && val.fr.trim()) return val.fr;
  if (typeof val.nameEn === 'string' && val.nameEn.trim()) return val.nameEn;
  if (typeof val.en === 'string' && val.en.trim()) return val.en;
  if (typeof val.name === 'string' && val.name.trim()) return val.name;
  return fallback;
}

/**
 * Validates and sanitizes external URLs stored in Firestore/settings so only http(s) links are allowed.
 * Prevents javascript:, data:, vbscript: XSS vectors on links and iframes.
 */
export function sanitizeExternalUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolves a localized string field supporting both flat keys (nameAr, nameFr, nameEn)
 * and nested object keys (name.ar, name.fr, name.en).
 */
export function getLocalizedField(
  item: any,
  baseKey: string,
  locale: string,
  fallback = ''
): string {
  if (!item) return fallback;
  const cap = locale === 'en' ? 'En' : locale === 'fr' ? 'Fr' : 'Ar';
  const nested = item[baseKey];

  const arVal =
    (typeof item[`${baseKey}Ar`] === 'string' && item[`${baseKey}Ar`].trim()) ||
    (nested && typeof nested === 'object' && typeof nested.ar === 'string' && nested.ar.trim()) ||
    '';
  const frVal =
    (typeof item[`${baseKey}Fr`] === 'string' && item[`${baseKey}Fr`].trim()) ||
    (nested && typeof nested === 'object' && typeof nested.fr === 'string' && nested.fr.trim()) ||
    '';
  const enVal =
    (typeof item[`${baseKey}En`] === 'string' && item[`${baseKey}En`].trim()) ||
    (nested && typeof nested === 'object' && typeof nested.en === 'string' && nested.en.trim()) ||
    '';

  if (cap === 'En') return enVal || frVal || arVal || fallback;
  if (cap === 'Fr') return frVal || enVal || arVal || fallback;
  return arVal || frVal || enVal || fallback;
}

export function normalizeDestination(docData: any, id?: string) {
  if (!docData) return null;
  const raw = docData.data ? docData.data() : docData;
  const docId = id || docData.id || raw.id;

  const nAr = extractSafeString(raw.nameAr, extractSafeString(raw.name?.ar, 'غير محدد'));
  const nFr = extractSafeString(raw.nameFr, extractSafeString(raw.name?.fr, nAr));
  const nEn = extractSafeString(raw.nameEn, extractSafeString(raw.name?.en, nFr || nAr));

  return {
    id: docId,
    ...raw,
    nameAr: nAr,
    nameFr: nFr,
    nameEn: nEn,
    image: raw.image || (raw.images && raw.images.length > 0 ? raw.images[0] : ''),
    images: raw.images || (raw.image ? [raw.image] : []),
  };
}

export function normalizeDestinations(docs: any[]) {
  return docs.map((d) => normalizeDestination(d)).filter(Boolean);
}
