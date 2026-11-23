import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moulaytravel.com');
  const locales = ['ar', 'fr', 'en'];
  const services = [
    'flights', 
    'hotels', 
    'umrah', 
    'organized_trips', 
    'vip', 
    'visas', 
    'promotions', 
    'custom_trips', 
    'car_rental',
    'insurance',
    'payment',
    'custom'
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
