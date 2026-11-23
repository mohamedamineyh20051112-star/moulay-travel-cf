import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';

export const locales = ['ar', 'fr', 'en'];

export default getRequestConfig(async ({locale}) => {
  const validLocale: string = (locale && locales.includes(locale as any)) ? locale : 'ar';

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
    messages
  };
});
