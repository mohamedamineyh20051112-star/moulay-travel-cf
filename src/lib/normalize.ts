function extractSafeString(val: any, fallback: string = ''): string {
  if (typeof val === 'string') return val;
  if (!val || typeof val !== 'object') return fallback;
  if (typeof val.nameAr === 'string' && val.nameAr.trim()) return val.nameAr;
  if (typeof val.ar === 'string' && val.ar.trim()) return val.ar;
  if (typeof val.nameFr === 'string' && val.nameFr.trim()) return val.nameFr;
  if (typeof val.fr === 'string' && val.fr.trim()) return val.fr;
  if (typeof val.name === 'string' && val.name.trim()) return val.name;
  return fallback;
}

export function normalizeDestination(docData: any, id?: string) {
  if (!docData) return null;
  const raw = docData.data ? docData.data() : docData;
  const docId = id || docData.id || raw.id;
  
  const nAr = extractSafeString(raw.nameAr, extractSafeString(raw.name?.ar, 'غير محدد'));
  const nFr = extractSafeString(raw.nameFr, extractSafeString(raw.name?.fr, nAr));
  
  return {
    id: docId,
    ...raw,
    nameAr: nAr,
    nameFr: nFr,
    image: raw.image || (raw.images && raw.images.length > 0 ? raw.images[0] : ''),
    images: raw.images || (raw.image ? [raw.image] : [])
  };
}

export function normalizeDestinations(docs: any[]) {
  return docs.map(d => normalizeDestination(d)).filter(Boolean);
}
