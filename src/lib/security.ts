// Edge-compatible input validation, sanitization, and rate-limiting helpers

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export function checkRateLimit(
  key: string,
  maxRequests = 15,
  windowMs = 60_000
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Periodic cleanup to keep memory bounded
  if (rateLimitStore.size > 500) {
    Array.from(rateLimitStore.entries()).forEach(([k, v]) => {
      if (v.resetAt <= now) rateLimitStore.delete(k);
    });
  }

  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function sanitizeText(value: unknown, maxLength = 300): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Prevents CSV / Google Sheets Formula Injection (DDE / =HYPERLINK / =IMPORTXML / + / - / @).
 */
export function sanitizeSheetCell(value: string, maxLength = 500): string {
  const cleaned = sanitizeText(value, maxLength);
  if (!cleaned) return '';
  if (/^[=+\-@\t\r]/.test(cleaned)) {
    return `'${cleaned}`;
  }
  return cleaned;
}

export function sanitizePhone(value: unknown): string {
  const cleaned = sanitizeText(value, 30);
  if (!cleaned) return '';
  return cleaned.startsWith("'") ? cleaned : `'${cleaned}`;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[^0-9]/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function isValidEmail(value: string): boolean {
  if (!value) return true; // optional unless required by caller
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 150;
}
