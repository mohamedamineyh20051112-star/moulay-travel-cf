import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moulay-travel.pages.dev').replace(/\/$/, '');
  const locales = ['ar', 'fr', 'en'];
  const services = [
    'top-destinations',
    'umrah',
    'organized_trips',
    'vip_trips',
    'hammams',
    'cars',
    'discounts',
    'flights',
    'hotels',
    'visas',
    'custom_trips',
    'insurance',
    'payment',
  ];

  const routes: MetadataRoute.Sitemap = [];

  // Add Home Pages
  for (const locale of locales) {
    routes.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });
  }

  // Add Service Pages
  for (const locale of locales) {
    for (const service of services) {
      routes.push({
        url: `${baseUrl}/${locale}/${service}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return routes;
}
