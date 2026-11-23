import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  getAdminSessionSecret,
  verifyAdminToken,
} from './lib/adminAuth';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
});

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  return response;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detect any /admin or /{locale}/admin route (excluding login and API)
  const normalizedPath = pathname.replace(/^\/(ar|fr|en)(?=\/|$)/, '') || '/';
  const isAdminRoute =
    normalizedPath === '/admin' || normalizedPath.startsWith('/admin/');
  const isLoginRoute =
    normalizedPath === '/admin/login' || normalizedPath.startsWith('/admin/login/');

  if (isAdminRoute && !isLoginRoute) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const secret = getAdminSessionSecret();
    const isAuthenticated = await verifyAdminToken(token, secret);

    if (!isAuthenticated) {
      const segments = pathname.split('/').filter(Boolean);
      const firstSegment = segments[0];
      const locale = locales.includes(firstSegment as (typeof locales)[number])
        ? firstSegment
        : 'ar';
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set('next', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      if (token) {
        redirectResponse.cookies.delete(ADMIN_COOKIE_NAME);
      }
      return applySecurityHeaders(redirectResponse);
    }
  }

  const response = intlMiddleware(request);
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    '/',
    '/(ar|fr|en)/:path*',
    '/((?!_next|_vercel|api|.*\\..*).*)',
  ],
};
