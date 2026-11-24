export interface WorldDestinationPreset {
  code: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  flag: string;
}

export const WORLD_DESTINATIONS: WorldDestinationPreset[] = [
  { code: 'tr', nameAr: 'تركيا', nameFr: 'Turquie', nameEn: 'Turkey', flag: '/flags/tr.svg' },
  { code: 'ae', nameAr: 'الإمارات العربية المتحدة (دبي)', nameFr: 'Émirats Arabes Unis (Dubaï)', nameEn: 'UAE (Dubai)', flag: '/flags/ae.svg' },
  { code: 'eg', nameAr: 'مصر', nameFr: 'Égypte', nameEn: 'Egypt', flag: '/flags/eg.svg' },
  { code: 'tn', nameAr: 'تونس', nameFr: 'Tunisie', nameEn: 'Tunisia', flag: '/flags/tn.svg' },
  { code: 'ma', nameAr: 'المغرب', nameFr: 'Maroc', nameEn: 'Morocco', flag: '/flags/ma.svg' },
  { code: 'dz', nameAr: 'الجزائر', nameFr: 'Algérie', nameEn: 'Algeria', flag: '/flags/dz.svg' },
  { code: 'sa', nameAr: 'المملكة العربية السعودية', nameFr: 'Arabie Saoudite', nameEn: 'Saudi Arabia', flag: '/flags/sa.svg' },
  { code: 'qa', nameAr: 'قطر', nameFr: 'Qatar', nameEn: 'Qatar', flag: '/flags/qa.svg' },
  { code: 'jo', nameAr: 'الأردن', nameFr: 'Jordanie', nameEn: 'Jordan', flag: '/flags/jo.svg' },
  { code: 'om', nameAr: 'سلطنة عُمان', nameFr: 'Oman', nameEn: 'Oman', flag: '/flags/om.svg' },
  { code: 'lb', nameAr: 'لبنان', nameFr: 'Liban', nameEn: 'Lebanon', flag: '/flags/lb.svg' },
  { code: 'my', nameAr: 'ماليزيا', nameFr: 'Malaisie', nameEn: 'Malaysia', flag: '/flags/my.svg' },
  { code: 'id', nameAr: 'إندونيسيا (بالي)', nameFr: 'Indonésie (Bali)', nameEn: 'Indonesia (Bali)', flag: '/flags/id.svg' },
  { code: 'th', nameAr: 'تايلاند', nameFr: 'Thaïlande', nameEn: 'Thailand', flag: '/flags/th.svg' },
  { code: 'mv', nameAr: 'جزر المالديف', nameFr: 'Maldives', nameEn: 'Maldives', flag: '/flags/mv.svg' },
  { code: 'es', nameAr: 'إسبانيا', nameFr: 'Espagne', nameEn: 'Spain', flag: '/flags/es.svg' },
  { code: 'fr', nameAr: 'فرنسا', nameFr: 'France', nameEn: 'France', flag: '/flags/fr.svg' },
  { code: 'it', nameAr: 'إيطاليا', nameFr: 'Italie', nameEn: 'Italy', flag: '/flags/it.svg' },
  { code: 'gr', nameAr: 'اليونان', nameFr: 'Grèce', nameEn: 'Greece', flag: '/flags/gr.svg' },
  { code: 'pt', nameAr: 'البرتغال', nameFr: 'Portugal', nameEn: 'Portugal', flag: '/flags/pt.svg' },
  { code: 'ch', nameAr: 'سويسرا', nameFr: 'Suisse', nameEn: 'Switzerland', flag: '/flags/ch.svg' },
  { code: 'de', nameAr: 'ألمانيا', nameFr: 'Allemagne', nameEn: 'Germany', flag: '/flags/de.svg' },
  { code: 'at', nameAr: 'النمسا', nameFr: 'Autriche', nameEn: 'Austria', flag: '/flags/at.svg' },
  { code: 'gb', nameAr: 'المملكة المتحدة', nameFr: 'Royaume-Uni', nameEn: 'United Kingdom', flag: '/flags/gb.svg' },
  { code: 'nl', nameAr: 'هولندا', nameFr: 'Pays-Bas', nameEn: 'Netherlands', flag: '/flags/nl.svg' },
  { code: 'be', nameAr: 'بلجيكا', nameFr: 'Belgique', nameEn: 'Belgium', flag: '/flags/be.svg' },
  { code: 'az', nameAr: 'أذربيجان', nameFr: 'Azerbaïdjan', nameEn: 'Azerbaijan', flag: '/flags/az.svg' },
  { code: 'ge', nameAr: 'جورجيا', nameFr: 'Géorgie', nameEn: 'Georgia', flag: '/flags/ge.svg' },
  { code: 'ba', nameAr: 'البوسنة والهرسك', nameFr: 'Bosnie-Herzégovine', nameEn: 'Bosnia and Herzegovina', flag: '/flags/ba.svg' },
  { code: 'al', nameAr: 'ألبانيا', nameFr: 'Albanie', nameEn: 'Albania', flag: '/flags/al.svg' },
  { code: 'cy', nameAr: 'قبرص', nameFr: 'Chypre', nameEn: 'Cyprus', flag: '/flags/cy.svg' },
  { code: 'ru', nameAr: 'روسيا', nameFr: 'Russie', nameEn: 'Russia', flag: '/flags/ru.svg' },
  { code: 'jp', nameAr: 'اليابان', nameFr: 'Japon', nameEn: 'Japan', flag: '/flags/jp.svg' },
  { code: 'kr', nameAr: 'كوريا الجنوبية', nameFr: 'Corée du Sud', nameEn: 'South Korea', flag: '/flags/kr.svg' },
  { code: 'cn', nameAr: 'الصين', nameFr: 'Chine', nameEn: 'China', flag: '/flags/cn.svg' },
  { code: 'in', nameAr: 'الهند', nameFr: 'Inde', nameEn: 'India', flag: '/flags/in.svg' },
  { code: 'us', nameAr: 'الولايات المتحدة', nameFr: 'États-Unis', nameEn: 'United States', flag: '/flags/us.svg' },
  { code: 'ca', nameAr: 'كندا', nameFr: 'Canada', nameEn: 'Canada', flag: '/flags/ca.svg' },
  { code: 'br', nameAr: 'البرازيل', nameFr: 'Brésil', nameEn: 'Brazil', flag: '/flags/br.svg' },
  { code: 'za', nameAr: 'جنوب أفريقيا', nameFr: 'Afrique du Sud', nameEn: 'South Africa', flag: '/flags/za.svg' },
];

export function filterLocalWorldDestinations(query: string): WorldDestinationPreset[] {
  const q = query.trim().toLowerCase();
  if (!q) return WORLD_DESTINATIONS;
  return WORLD_DESTINATIONS.filter(
    (d) =>
      d.nameAr.toLowerCase().includes(q) ||
      d.nameFr.toLowerCase().includes(q) ||
      d.nameEn.toLowerCase().includes(q) ||
      d.code.toLowerCase() === q
  );
}

/**
 * Searches any country worldwide via RestCountries API (by English name or Arabic/French translation).
 */
export async function searchGlobalCountries(query: string): Promise<WorldDestinationPreset[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const localMatches = filterLocalWorldDestinations(q);
  const endpoints = [
    `https://restcountries.com/v3.1/translation/${encodeURIComponent(q)}?fields=cca2,name,translations,flags`,
    `https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fields=cca2,name,translations,flags`,
  ];

  const remoteResults: WorldDestinationPreset[] = [];
  const seenCodes = new Set(localMatches.map((m) => m.code.toLowerCase()));

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const list = (await res.json()) as Array<{
        cca2?: string;
        name?: { common?: string };
        translations?: {
          ara?: { common?: string };
          fra?: { common?: string };
        };
        flags?: { svg?: string; png?: string };
      }>;
      if (!Array.isArray(list)) continue;
      for (const item of list.slice(0, 12)) {
        const code = (item.cca2 || '').toLowerCase();
        if (!code || seenCodes.has(code)) continue;
        seenCodes.add(code);
        remoteResults.push({
          code,
          nameAr: item.translations?.ara?.common || item.name?.common || code.toUpperCase(),
          nameFr: item.translations?.fra?.common || item.name?.common || code.toUpperCase(),
          nameEn: item.name?.common || code.toUpperCase(),
          flag: item.flags?.svg || item.flags?.png || `https://flagcdn.com/${code}.svg`,
        });
      }
    } catch {
      // Ignore upstream errors gracefully
    }
  }

  return [...localMatches, ...remoteResults];
}
