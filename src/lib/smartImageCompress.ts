'use client';

export const MAX_SAFE_DOC_BYTES = 890_000;
const HARD_DOC_LIMIT_BYTES = 990_000;

export interface CompressImageOptions {
  maxDimension?: number;
  maxBytes?: number;
  initialQuality?: number;
  preferPng?: boolean;
}

/**
 * Computes the UTF-8 serialized byte size of a Firestore payload candidate.
 */
export function estimateFirestoreDocBytes(obj: unknown): number {
  const json = JSON.stringify(obj) || '';
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(json).length;
  }
  return json.length * 2;
}

/**
 * Formats a document byte count for UI capacity badges.
 */
export function formatDocSizeLabel(bytes: number): string {
  const kb = Math.max(1, Math.round(bytes / 1024));
  const limitKb = Math.round(MAX_SAFE_DOC_BYTES / 1024);
  return `${kb} KB / ${limitKb} KB`;
}

/**
 * Recursively strips `undefined` properties and transient UI helper fields before writing to Firestore.
 */
export function sanitizeFirestorePayload<T>(input: T): T {
  const cleanValue = (val: unknown): unknown => {
    if (val === undefined) return null;
    if (val === null || typeof val !== 'object') return val;
    if (Array.isArray(val)) {
      return val.map((item) => cleanValue(item));
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (v === undefined || k === '_sourceCollection') continue;
      out[k] = cleanValue(v);
    }
    return out;
  };
  return cleanValue(input) as T;
}

let cachedWebPSupport: boolean | null = null;

function supportsWebPEncoding(): boolean {
  if (typeof document === 'undefined') return false;
  if (cachedWebPSupport !== null) return cachedWebPSupport;
  try {
    const probe = document.createElement('canvas');
    probe.width = 2;
    probe.height = 2;
    cachedWebPSupport = probe.toDataURL('image/webp', 0.8).startsWith('data:image/webp');
  } catch {
    cachedWebPSupport = false;
  }
  return cachedWebPSupport;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('تعذر قراءة الصورة المختارة'));
    img.src = src;
  });
}

function encodeCanvasToBudget(
  img: HTMLImageElement,
  opts: Required<CompressImageOptions>
): string {
  const { maxDimension, maxBytes, initialQuality, preferPng } = opts;

  let targetDim = maxDimension;
  let quality = initialQuality;
  const mime = preferPng
    ? 'image/png'
    : supportsWebPEncoding()
      ? 'image/webp'
      : 'image/jpeg';

  const drawAndEncode = (dimLimit: number, q: number, encodeMime: string): string => {
    let width = img.naturalWidth || img.width || 1;
    let height = img.naturalHeight || img.height || 1;
    if (width > height && width > dimLimit) {
      height = Math.max(1, Math.round((height * dimLimit) / width));
      width = dimLimit;
    } else if (height > dimLimit) {
      width = Math.max(1, Math.round((width * dimLimit) / height));
      height = dimLimit;
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
    }
    return canvas.toDataURL(encodeMime, q);
  };

  let dataUrl = drawAndEncode(targetDim, quality, mime);

  // If PNG is too big on a photo logo, fall back to lossy WebP/JPEG on subsequent passes
  let activeMime = mime;
  for (let pass = 0; pass < 6 && dataUrl.length > maxBytes; pass++) {
    if (activeMime === 'image/png') {
      activeMime = supportsWebPEncoding() ? 'image/webp' : 'image/jpeg';
      quality = 0.82;
    } else {
      quality = Math.max(0.38, quality - 0.12);
      if (pass >= 2) {
        targetDim = Math.max(320, Math.round(targetDim * 0.82));
      }
    }
    dataUrl = drawAndEncode(targetDim, quality, activeMime);
  }

  return dataUrl;
}

/**
 * Compresses an uploaded File to a smart Base64 data URL (WebP/JPEG) within the given byte budget.
 */
export function compressImageFileToBase64(
  file: File,
  opts: CompressImageOptions = {}
): Promise<string> {
  const resolved: Required<CompressImageOptions> = {
    maxDimension: opts.maxDimension ?? 920,
    maxBytes: opts.maxBytes ?? 115_000,
    initialQuality: opts.initialQuality ?? 0.78,
    preferPng: opts.preferPng ?? false,
  };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل في قراءة ملف الصورة'));
    reader.onload = async (event) => {
      try {
        const src = String(event.target?.result || '');
        const img = await loadImageElement(src);
        resolve(encodeCanvasToBudget(img, resolved));
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Re-compresses an existing Base64 image data URL down to `targetMaxBytes`.
 */
export async function recompressBase64DataUrl(
  dataUrl: string,
  targetMaxBytes: number,
  maxDim = 780
): Promise<string> {
  if (typeof document === 'undefined' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  if (dataUrl.length <= targetMaxBytes) {
    return dataUrl;
  }
  try {
    const img = await loadImageElement(dataUrl);
    return encodeCanvasToBudget(img, {
      maxDimension: maxDim,
      maxBytes: targetMaxBytes,
      initialQuality: 0.7,
      preferPng: false,
    });
  } catch {
    return dataUrl;
  }
}

interface DataImageRef {
  parent: Record<string, any> | any[];
  key: string | number;
  value: string;
}

function collectDataImages(node: unknown, refs: DataImageRef[] = []): DataImageRef[] {
  if (!node || typeof node !== 'object') return refs;
  if (Array.isArray(node)) {
    node.forEach((item, idx) => {
      if (typeof item === 'string' && item.startsWith('data:image/')) {
        refs.push({ parent: node, key: idx, value: item });
      } else if (item && typeof item === 'object') {
        collectDataImages(item, refs);
      }
    });
    return refs;
  }
  for (const [key, val] of Object.entries(node as Record<string, unknown>)) {
    if (typeof val === 'string' && val.startsWith('data:image/')) {
      refs.push({ parent: node as Record<string, any>, key, value: val });
    } else if (val && typeof val === 'object') {
      collectDataImages(val, refs);
    }
  }
  return refs;
}

/**
 * Sanitizes a single Firestore item document and adaptively shrinks Base64 images if needed
 * so every single hotel/car document reliably fits under Firestore's 1MB per-document cap.
 */
export async function fitPayloadUnder1MB<T extends Record<string, any>>(
  rawPayload: T,
  maxBytes = MAX_SAFE_DOC_BYTES
): Promise<T> {
  const clean = sanitizeFirestorePayload(rawPayload);
  let totalBytes = estimateFirestoreDocBytes(clean);
  if (totalBytes <= maxBytes) {
    return clean;
  }

  const imageRefs = collectDataImages(clean);
  if (imageRefs.length > 0) {
    const imageBytes = imageRefs.reduce((acc, r) => acc + r.value.length, 0);
    const nonImageBytes = Math.max(0, totalBytes - imageBytes);
    const availableForImages = Math.max(120_000, maxBytes - nonImageBytes);

    for (const ref of imageRefs) {
      const share = ref.value.length / Math.max(1, imageBytes);
      const perImageBudget = Math.max(28_000, Math.floor(share * availableForImages));
      const shrunk = await recompressBase64DataUrl(ref.value, perImageBudget, 780);
      (ref.parent as any)[ref.key] = shrunk;
    }

    totalBytes = estimateFirestoreDocBytes(clean);

    // Second tighter pass if still slightly above safe limit
    if (totalBytes > maxBytes) {
      const secondPassRefs = collectDataImages(clean);
      const secondImageBytes = secondPassRefs.reduce((acc, r) => acc + r.value.length, 0);
      const strictAvailable = Math.max(90_000, maxBytes - Math.max(0, totalBytes - secondImageBytes));
      for (const ref of secondPassRefs) {
        const share = ref.value.length / Math.max(1, secondImageBytes);
        const strictBudget = Math.max(20_000, Math.floor(share * strictAvailable));
        (ref.parent as any)[ref.key] = await recompressBase64DataUrl(ref.value, strictBudget, 600);
      }
      totalBytes = estimateFirestoreDocBytes(clean);
    }
  }

  if (totalBytes > HARD_DOC_LIMIT_BYTES) {
    throw new Error(
      'حجم بيانات البطاقة والصور تجاوز الحد الأقصى المسموح به (1MB لكل عنصر مستقل). يرجى تقليل عدد الصور المرفقة.'
    );
  }

  return clean;
}

/**
 * Translates common Firestore errors into actionable Arabic messages for admins.
 */
export function formatFirestoreError(error: any): string {
  const code = String(error?.code || '');
  const msg = String(error?.message || '');
  if (code === 'permission-denied' || msg.includes('permission-denied')) {
    return 'رفضت قاعدة البيانات العملية: تأكد من تسجيل الدخول بحساب المدير (super_admin) على الموقع.';
  }
  if (
    code === 'resource-exhausted' ||
    msg.includes('1048576') ||
    msg.toLowerCase().includes('exceeds the maximum allowed size')
  ) {
    return 'تجاوز حجم هذا العنصر الحد الأقصى (1 ميغابايت لكل ملف مستقل في Firestore). يرجى تقليل عدد الصور.';
  }
  return msg || 'حدث خطأ غير متوقع في قاعدة البيانات';
}
