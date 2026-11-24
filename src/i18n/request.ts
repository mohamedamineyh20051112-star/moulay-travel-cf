import { getRequestConfig } from 'next-intl/server';

export const locales = ['ar', 'fr', 'en'];

export default getRequestConfig(async ({ locale, requestLocale }) => {
  const requested = locale ?? (await requestLocale);
  const validLocale: string =
    requested && locales.includes(requested as (typeof locales)[number]) ? requested : 'ar';

  let messages;
  if (validLocale === 'fr') {
    messages = (await import('../../messages/fr.json')).default;
  } else if (validLocale === 'en') {
    messages = (await import('../../messages/en.json')).default;
  } else {
    messages = (await import('../../messages/ar.json')).default;
  }

  return {
    locale: validLocale,
    messages,
  };
});
