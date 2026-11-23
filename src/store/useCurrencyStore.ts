import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const DEFAULT_DZD_PER_EUR = 145;

interface CurrencyState {
  currency: 'DZD' | 'EUR';
  dzdPerEur: number;
  rateSource: 'live-api' | 'admin-custom' | 'fallback';
  rateLoaded: boolean;
  setCurrency: (currency: 'DZD' | 'EUR') => void;
  fetchRate: () => Promise<void>;
}

export function parseNumericPrice(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^0-9.,]/g, '').replace(/\s+/g, '');
  if (!cleaned) return 0;
  // Handle Algerian/French thousand separators like "12.000" or "12,000"
  const normalized = cleaned.includes(',') && !cleaned.includes('.')
    ? cleaned.replace(/,/g, '')
    : cleaned.replace(/\.(?=\d{3}(\D|$))/g, '').replace(/,/g, '.');
  const num = parseFloat(normalized);
  return Number.isFinite(num) ? num : 0;
}

export function convertDzdToEur(dzdAmount: number | string | undefined, dzdPerEur = DEFAULT_DZD_PER_EUR): number {
  const dzd = parseNumericPrice(dzdAmount);
  if (dzd <= 0) return 0;
  const rate = dzdPerEur > 0 ? dzdPerEur : DEFAULT_DZD_PER_EUR;
  return Math.round(dzd / rate);
}

export function formatConvertedPrice(
  dzdAmount: number | string | undefined,
  currency: 'DZD' | 'EUR',
  dzdPerEur: number,
  locale: string,
  manualEurOverride?: number | string | null
): string {
  const dzd = parseNumericPrice(dzdAmount);
  if (currency === 'EUR') {
    const manualEur = parseNumericPrice(manualEurOverride);
    const eur = manualEur > 0 ? Math.round(manualEur) : convertDzdToEur(dzd, dzdPerEur);
    if (eur <= 0) return '-';
    return `${eur.toLocaleString('fr-FR')} €`;
  }
  if (dzd <= 0) return '-';
  const suffix = locale === 'ar' ? 'دج' : 'DA';
  return `${Math.round(dzd).toLocaleString('fr-DZ')} ${suffix}`;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'DZD',
      dzdPerEur: DEFAULT_DZD_PER_EUR,
      rateSource: 'fallback',
      rateLoaded: false,
      setCurrency: (currency) => set({ currency }),
      fetchRate: async () => {
        if (get().rateLoaded) return;
        try {
          // 1. Check if admin configured a custom/manual rate in Firestore siteSettings/global
          const settingsSnap = await getDoc(doc(db, 'siteSettings', 'global')).catch(() => null);
          if (settingsSnap?.exists()) {
            const data = settingsSnap.data() as {
              exchangeRateMode?: string;
              customEurRate?: number | string;
            };
            const customRate = Number(data.customEurRate);
            if (
              data.exchangeRateMode === 'manual' &&
              Number.isFinite(customRate) &&
              customRate > 50 &&
              customRate < 1000
            ) {
              set({
                dzdPerEur: customRate,
                rateSource: 'admin-custom',
                rateLoaded: true,
              });
              return;
            }
          }

          // 2. Otherwise fetch live daily rate from our Edge API
          const res = await fetch('/api/exchange-rate');
          if (res.ok) {
            const data = (await res.json()) as {
              dzdPerEur?: number;
              source?: 'live-api' | 'fallback';
            };
            if (typeof data.dzdPerEur === 'number' && data.dzdPerEur > 50) {
              set({
                dzdPerEur: data.dzdPerEur,
                rateSource: data.source || 'live-api',
                rateLoaded: true,
              });
              return;
            }
          }
        } catch (err) {
          console.error('Failed to load exchange rate:', err);
        }
        set({ rateLoaded: true });
      },
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({ currency: state.currency }),
    }
  )
);
