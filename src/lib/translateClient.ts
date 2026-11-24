'use client';

import { useEffect, useState } from 'react';

type SupportedLang = 'ar' | 'fr' | 'en';

const CACHE_PREFIX = 'mt_tr_v1_';
const memoryCache = new Map<string, string>();

function readLocalCache(key: string): string | null {
  if (memoryCache.has(key)) return memoryCache.get(key)!;
  if (typeof window === 'undefined') return null;
  try {
    const val = window.localStorage.getItem(CACHE_PREFIX + key);
    if (val) memoryCache.set(key, val);
    return val;
  } catch {
    return null;
  }
}

function writeLocalCache(key: string, value: string): void {
  memoryCache.set(key, value);
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.length > 500) {
      // Keep localStorage light
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith(CACHE_PREFIX))
        .slice(0, 100)
        .forEach((k) => window.localStorage.removeItem(k));
    }
    window.localStorage.setItem(CACHE_PREFIX + key, value);
  } catch {
    // Ignore storage quota errors
  }
}

export function containsArabic(text: string | undefined | null): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Translates an array of texts via the server Edge `/api/translate` endpoint with client caching.
 * Always falls back cleanly to the original text if translation fails.
 */
export async function autoTranslateTexts(
  texts: string[],
  target: SupportedLang,
  source: SupportedLang = 'ar'
): Promise<string[]> {
  if (texts.length === 0 || source === target) return texts;

  const result = [...texts];
  const missingIndices: number[] = [];
  const missingTexts: string[] = [];

  texts.forEach((txt, idx) => {
    const clean = (txt || '').trim();
    if (!clean) {
      result[idx] = '';
      return;
    }
    const key = `${source}:${target}:${clean}`;
    const cached = readLocalCache(key);
    if (cached) {
      result[idx] = cached;
    } else {
      missingIndices.push(idx);
      missingTexts.push(clean);
    }
  });

  if (missingTexts.length === 0) return result;

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: missingTexts,
        source,
        target,
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as { translations?: string[] };
      if (Array.isArray(json.translations)) {
        missingIndices.forEach((origIdx, i) => {
          const translated = json.translations?.[i];
          if (translated && translated.trim()) {
            result[origIdx] = translated.trim();
            writeLocalCache(`${source}:${target}:${missingTexts[i]}`, translated.trim());
          }
        });
      }
    }
  } catch {
    // Graceful fallback to original strings
  }

  return result;
}

/**
 * Hook that translates Arabic fallback strings on the fly when viewing the site in FR or EN
 * and the admin hadn't entered FR/EN fields manually.
 */
export function useAutoTranslate(
  arabicOrPrimaryText: string | undefined | null,
  targetLocale: string,
  explicitTranslated?: string | undefined | null
): string {
  const sourceText = (arabicOrPrimaryText || '').trim();
  const explicit = (explicitTranslated || '').trim();
  const target: SupportedLang =
    targetLocale === 'en' ? 'en' : targetLocale === 'fr' ? 'fr' : 'ar';

  const shouldTranslate =
    target !== 'ar' &&
    (!explicit || containsArabic(explicit)) &&
    containsArabic(sourceText);

  const initialDisplay =
    !shouldTranslate
      ? explicit || sourceText
      : readLocalCache(`ar:${target}:${sourceText}`) || explicit || sourceText;

  const [display, setDisplay] = useState<string>(initialDisplay);

  useEffect(() => {
    if (!shouldTranslate) {
      setDisplay(explicit || sourceText);
      return;
    }
    const cached = readLocalCache(`ar:${target}:${sourceText}`);
    if (cached) {
      setDisplay(cached);
      return;
    }
    let active = true;
    autoTranslateTexts([sourceText], target, 'ar').then(([tr]) => {
      if (active && tr) setDisplay(tr);
    });
    return () => {
      active = false;
    };
  }, [sourceText, explicit, target, shouldTranslate]);

  return display;
}
