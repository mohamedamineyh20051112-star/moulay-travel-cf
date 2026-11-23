import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  getAdminSessionSecret,
  signAdminToken,
  timingSafeStringEqual,
} from '@/lib/adminAuth';
import { checkRateLimit, getClientIp } from '@/lib/security';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`admin-login:${ip}`, 5, 15 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'محاولات كثيرة جداً. يرجى الانتظار قليلاً ثم المحاولة مجدداً.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.retryAfterSec) },
        }
      );
    }

    const validPassword = process.env.ADMIN_PASSWORD?.trim();
    const sessionSecret = getAdminSessionSecret();
    if (!validPassword || !sessionSecret) {
      console.error('ADMIN_PASSWORD environment variable is not configured.');
      return NextResponse.json(
        { success: false, error: 'إعدادات الحماية غير مكتملة على الخادم.' },
        { status: 500 }
      );
    }

    const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!password || !timingSafeStringEqual(password, validPassword)) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect / كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    const signedToken = await signAdminToken(sessionSecret);
    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE_NAME, signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
