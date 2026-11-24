// Lightweight, zero-dependency Google Sheets v4 REST API client for Cloudflare Edge Runtime.
// Replaces heavy Node.js packages (googleapis, google-spreadsheet, google-auth-library).

import { sanitizeSheetCell } from './security';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedToken>();

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncodeString(str: string): string {
  return base64UrlEncodeBytes(new TextEncoder().encode(str));
}

export function cleanEnvValue(raw?: string): string {
  return (raw || '').trim().replace(/^["'`]+|["'`]+$/g, '').trim();
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = cleanEnvValue(pem)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/[^A-Za-z0-9+/=]/g, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getGoogleAccessToken(clientEmail: string, privateKeyPem: string): Promise<string> {
  const cacheKey = clientEmail;
  const cached = tokenCache.get(cacheKey);
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.expiresAt > now + 60) {
    return cached.accessToken;
  }

  const header = base64UrlEncodeString(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claimSet = base64UrlEncodeString(
    JSON.stringify({
      iss: clientEmail,
      scope: SHEETS_SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    })
  );

  const signingInput = `${header}.${claimSet}`;
  const keyBuffer = pemToArrayBuffer(privateKeyPem);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );
  const jwt = `${signingInput}.${base64UrlEncodeBytes(new Uint8Array(signature))}`;

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Google OAuth token exchange failed (${tokenRes.status}): ${errText}`);
  }

  const data = (await tokenRes.json()) as { access_token: string; expires_in?: number };
  tokenCache.set(cacheKey, {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in ?? 3500),
  });

  return data.access_token;
}

export function getGoogleCredentials(): { clientEmail: string; privateKey: string } | null {
  const clientEmail = cleanEnvValue(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL
  );
  const privateKey = cleanEnvValue(process.env.GOOGLE_PRIVATE_KEY)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .trim();
  if (!clientEmail || !privateKey) return null;
  return { clientEmail, privateKey };
}

function escapeSheetTitle(title: string): string {
  return `'${title.replace(/'/g, "''")}'`;
}

export class EdgeGoogleSheet {
  private spreadsheetId: string;
  private clientEmail: string;
  private privateKey: string;

  constructor(spreadsheetId: string, clientEmail: string, privateKey: string) {
    this.spreadsheetId = cleanEnvValue(spreadsheetId);
    this.clientEmail = cleanEnvValue(clientEmail);
    this.privateKey = privateKey;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getGoogleAccessToken(this.clientEmail, this.privateKey);
    const res = await fetch(`${SHEETS_BASE_URL}/${encodeURIComponent(this.spreadsheetId)}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Google Sheets API error (${res.status}): ${body}`);
    }
    return (await res.json()) as T;
  }

  async ensureTab(tabTitle: string, headerValues: string[]): Promise<string[]> {
    const meta = await this.request<{
      sheets?: Array<{ properties?: { title?: string } }>;
    }>('?fields=sheets.properties.title');

    const exists = (meta.sheets || []).some((s) => s.properties?.title === tabTitle);

    if (!exists) {
      await this.request(':batchUpdate', {
        method: 'POST',
        body: JSON.stringify({
          requests: [{ addSheet: { properties: { title: tabTitle } } }],
        }),
      });
      await this.setHeaderRow(tabTitle, headerValues);
      return headerValues;
    }

    const headerRes = await this.request<{ values?: string[][] }>(
      `/values/${encodeURIComponent(`${escapeSheetTitle(tabTitle)}!1:1`)}`
    );
    const existingHeaders = headerRes.values?.[0] || [];
    if (existingHeaders.length === 0) {
      await this.setHeaderRow(tabTitle, headerValues);
      return headerValues;
    }
    return existingHeaders;
  }

  async setHeaderRow(tabTitle: string, headers: string[]): Promise<void> {
    const range = `${escapeSheetTitle(tabTitle)}!A1`;
    await this.request(`/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({ values: [headers] }),
    });
  }

  async getAllRows(tabTitle: string): Promise<string[][]> {
    const res = await this.request<{ values?: string[][] }>(
      `/values/${encodeURIComponent(`${escapeSheetTitle(tabTitle)}!A:ZZ`)}`
    );
    return res.values || [];
  }

  async getNextSequenceNumber(tabTitle: string, idColumnIndex = 0, pattern = /\/(\d+)$/): Promise<number> {
    const rows = await this.getAllRows(tabTitle);
    const dataRows = rows.slice(1); // skip header
    let seq = dataRows.length + 1;
    if (dataRows.length > 0) {
      const lastRow = dataRows[dataRows.length - 1];
      const lastId = lastRow?.[idColumnIndex];
      if (lastId && typeof lastId === 'string') {
        const match = lastId.match(pattern);
        if (match && match[1]) {
          seq = parseInt(match[1], 10) + 1;
        }
      }
    }
    return seq;
  }

  async appendRow(
    tabTitle: string,
    defaultHeaders: string[],
    rowObj: Record<string, string | number | boolean | null | undefined>,
    allowNewHeaders = false
  ): Promise<void> {
    const headers = await this.ensureTab(tabTitle, defaultHeaders);

    if (allowNewHeaders) {
      let changed = false;
      for (const key of Object.keys(rowObj)) {
        if (!headers.includes(key) && headers.length < 40) {
          headers.push(key);
          changed = true;
        }
      }
      if (changed) {
        await this.setHeaderRow(tabTitle, headers);
      }
    }

    const rowValues = headers.map((header) => {
      const raw = rowObj[header];
      if (raw === undefined || raw === null) return '';
      return sanitizeSheetCell(String(raw));
    });

    const range = `${escapeSheetTitle(tabTitle)}!A1`;
    await this.request(
      `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        body: JSON.stringify({ values: [rowValues] }),
      }
    );
  }
}
