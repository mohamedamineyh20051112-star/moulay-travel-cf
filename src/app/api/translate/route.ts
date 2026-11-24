import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp, sanitizeText } from '@/lib/security';

export const runtime = 'edge';

type SupportedLang = 'ar' | 'fr' | 'en';
const ALLOWED_LANGS = new Set<SupportedLang>(['ar', 'fr', 'en']);

// In-memory Edge worker cache so repeated requests don't hit upstream APIs
const translationCache = new Map<string, string>();

async function translateSingle(
  text: string,
  source: SupportedLang,
  target: SupportedLang
): Promise<string> {
  const clean = sanitizeText(text, 500);
  if (!clean || source === target) return clean;

  // Skip strings that are purely numbers/punctuation
  if (!/[A-Za-z\u00C0-\u024F\u0600-\u06FF]/.test(clean)) return clean;

  const cacheKey = `${source}:${target}:${clean}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  // Primary: Google Translate free GTX endpoint
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(gtxUrl, { method: 'GET' });
    if (res.ok) {
      const json = (await res.json()) as unknown;
      if (Array.isArray(json) && Array.isArray(json[0])) {
        const joined = (json[0] as unknown[])
          .map((seg) => (Array.isArray(seg) && typeof seg[0] === 'string' ? seg[0] : ''))
          .join('')
          .trim();
        if (joined) {
          if (translationCache.size > 1000) translationCache.clear();
          translationCache.set(cacheKey, joined);
          return joined;
        }
      }
    }
  } catch {
    // Fallback below
  }

  // Fallback: MyMemory Translation REST API
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=${source}|${target}`;
    const res = await fetch(mmUrl, { method: 'GET' });
    if (res.ok) {
      const json = (await res.json()) as {
        responseStatus?: number;
        responseData?: { translatedText?: string };
      };
      const translated = json?.responseData?.translatedText?.trim();
      if (json?.responseStatus === 200 && translated && !translated.includes('MYMEMORY WARNING')) {
        if (translationCache.size > 1000) translationCache.clear();
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch {
    // Return original text safely below
  }

  return clean;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`translate:${ip}`, 30, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many translation requests.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      texts?: unknown;
      source?: unknown;
      target?: unknown;
    } | null;

    if (!body || !Array.isArray(body.texts)) {
      return NextResponse.json({ success: false, error: 'Invalid payload.' }, { status: 400 });
    }

    const source: SupportedLang = ALLOWED_LANGS.has(body.source as SupportedLang)
      ? (body.source as SupportedLang)
      : 'ar';
    const target: SupportedLang = ALLOWED_LANGS.has(body.target as SupportedLang)
      ? (body.target as SupportedLang)
      : 'fr';

    const items = body.texts.slice(0, 25).map((t) => sanitizeText(t, 500));
    const translations = await Promise.all(
      items.map((item) => translateSingle(item, source, target))
    );

    return NextResponse.json({
      success: true,
      translations,
    });
  } catch (error) {
    console.error('Translate API error:', error);
    return NextResponse.json({ success: false, translations: [] }, { status: 500 });
  }
}
