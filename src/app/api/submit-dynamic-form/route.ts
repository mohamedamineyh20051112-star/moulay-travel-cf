import { NextResponse } from 'next/server';
import {
  cleanEnvValue,
  DEFAULT_FIREBASE_API_KEY,
  DEFAULT_FIREBASE_PROJECT_ID,
  DEFAULT_GOOGLE_SHEET_ID,
  EdgeGoogleSheet,
  getGoogleCredentials,
} from '@/lib/googleSheetsEdge';
import { checkRateLimit, getClientIp, sanitizeText } from '@/lib/security';

export const runtime = 'edge';

async function saveSubmissionToFirestoreRest(
  formId: string,
  sanitizedData: Record<string, string>
): Promise<void> {
  const projectId = cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) || DEFAULT_FIREBASE_PROJECT_ID;
  const apiKey = cleanEnvValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) || DEFAULT_FIREBASE_API_KEY;
  if (!projectId || !apiKey) return;

  const fieldsData: Record<string, { stringValue: string }> = {};
  for (const [k, v] of Object.entries(sanitizedData)) {
    fieldsData[k] = { stringValue: String(v) };
  }

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/(default)/documents/form_submissions?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        formId: { stringValue: formId },
        createdAt: { stringValue: new Date().toISOString() },
        status: { stringValue: 'new' },
        data: { mapValue: { fields: fieldsData } },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Firestore REST save error:', res.status, errText);
  }
}

export async function GET(req: Request) {
  const creds = getGoogleCredentials();
  const spreadsheetId =
    cleanEnvValue(process.env.GOOGLE_SHEET_AUTRES_ID || process.env.GOOGLE_SHEET_ID) ||
    DEFAULT_GOOGLE_SHEET_ID;

  const url = new URL(req.url);
  if (url.searchParams.get('diag') === '1') {
    if (!creds) {
      return NextResponse.json({
        ok: false,
        stage: 'credentials',
        sheetsConfigured: false,
        error: 'GOOGLE_PRIVATE_KEY is missing',
      });
    }
    const rawKey = cleanEnvValue(process.env.GOOGLE_PRIVATE_KEY);
    try {
      const sheet = new EdgeGoogleSheet(spreadsheetId, creds.clientEmail, creds.privateKey);
      const headers = await sheet.ensureTab('car', ['Date', 'Service', 'Détails']);
      return NextResponse.json({
        ok: true,
        stage: 'sheets_connected',
        keyLength: rawKey.length,
        hasBeginMarker: rawKey.includes('BEGIN PRIVATE KEY'),
        hasEndMarker: rawKey.includes('END PRIVATE KEY'),
        headersCount: headers.length,
      });
    } catch (err: any) {
      return NextResponse.json({
        ok: false,
        stage: 'sheets_error',
        keyLength: rawKey.length,
        hasBeginMarker: rawKey.includes('BEGIN PRIVATE KEY'),
        hasEndMarker: rawKey.includes('END PRIVATE KEY'),
        errorMessage: String(err?.message || err),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    runtime: 'edge-rest',
    sheetsConfigured: Boolean(creds && spreadsheetId),
  });
}

const SERVICE_TAB_MAP: Record<string, string> = {
  car_rental: 'car',
  car: 'car',
  cars: 'car',
  vip: 'VIP',
  vip_trips: 'VIP',
  visa: 'Visas',
  visas: 'Visas',
  organized_trips: 'Voyages',
  custom_trips: 'Sur mesure',
  wellness: 'Bien-être',
  hammams: 'Bien-être',
  insurance: 'Assurance',
  airplane: 'airplane',
  train: 'train',
  ferry: 'ferry',
};

function resolveTabTitle(formId: string): string {
  if (SERVICE_TAB_MAP[formId]) return SERVICE_TAB_MAP[formId];
  if (formId.startsWith('car_')) return 'car';
  if (formId.startsWith('vip_trips_') || formId.startsWith('vip_')) return 'VIP';
  if (formId.startsWith('organized_trips_')) return 'Voyages';
  if (formId.startsWith('hammams_')) return 'Bien-être';
  return 'Autres';
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rate = checkRateLimit(`dynamic-form:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Trop de demandes. Veuillez réessayer dans une minute.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const body = (await req.json().catch(() => null)) as {
      formId?: unknown;
      data?: unknown;
    } | null;

    if (!body || typeof body.formId !== 'string' || !body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
      return NextResponse.json({ success: false, error: 'Données du formulaire invalides.' }, { status: 400 });
    }

    const formId = sanitizeText(body.formId, 80);
    if (!formId || !/^[a-zA-Z0-9_-]+$/.test(formId)) {
      return NextResponse.json({ success: false, error: 'Identifiant de formulaire invalide.' }, { status: 400 });
    }

    const entries = Object.entries(body.data as Record<string, unknown>).slice(0, 35);
    if (entries.length === 0) {
      return NextResponse.json({ success: false, error: 'Le formulaire est vide.' }, { status: 400 });
    }

    const sanitizedData: Record<string, string> = {};
    for (const [rawKey, rawVal] of entries) {
      const cleanKey = sanitizeText(rawKey, 80);
      if (!cleanKey) continue;
      sanitizedData[cleanKey] = sanitizeText(
        Array.isArray(rawVal) ? rawVal.join(', ') : rawVal,
        500
      );
    }

    // 1. Save to Firestore via Edge REST API (avoids Edge Worker crash from Firebase Web SDK)
    try {
      await saveSubmissionToFirestoreRest(formId, sanitizedData);
    } catch (fsErr) {
      console.error('Firestore REST save error:', fsErr);
    }

    // 2. Save to Google Sheets via Edge REST API
    const creds = getGoogleCredentials();
    const spreadsheetId =
      cleanEnvValue(process.env.GOOGLE_SHEET_AUTRES_ID || process.env.GOOGLE_SHEET_ID) ||
      DEFAULT_GOOGLE_SHEET_ID;

    if (!creds || !spreadsheetId) {
      console.error('Google Sheets credentials or GOOGLE_SHEET_AUTRES_ID missing.');
      return NextResponse.json(
        { success: false, error: 'Configuration Google Sheets manquante sur le serveur.' },
        { status: 500 }
      );
    }

    try {
      const tabTitle = resolveTabTitle(formId);
      const sheet = new EdgeGoogleSheet(spreadsheetId, creds.clientEmail, creds.privateKey);
      const rowData: Record<string, string> = {
        Date: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Algiers' }),
        Service: formId,
        ...sanitizedData,
      };

      await sheet.appendRow(tabTitle, ['Date', 'Service', 'Détails'], rowData, true);
    } catch (sheetErr) {
      console.error('Google Sheets save error:', sheetErr);
      return NextResponse.json(
        { success: false, error: "Erreur lors de l'enregistrement dans Google Sheets." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Dynamic form general error:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi du formulaire." },
      { status: 500 }
    );
  }
}
