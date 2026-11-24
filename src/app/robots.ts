import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://moulaytravel.pages.dev').replace(/\/$/, '');
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/ar/admin/', '/fr/admin/', '/en/admin/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
