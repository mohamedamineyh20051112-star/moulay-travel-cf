import { NextResponse } from 'next/server';
import { EdgeGoogleSheet, getGoogleCredentials } from '@/lib/googleSheetsEdge';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { checkRateLimit, getClientIp, sanitizeText } from '@/lib/security';

export const runtime = 'edge';

const SERVICE_TAB_MAP: Record<string, string> = {
  car_rental: 'car',
  car: 'car',
  vip: 'VIP',
  visa: 'Visas',
  visas: 'Visas',
  organized_trips: 'Voyages',
  custom_trips: 'Sur mesure',
  wellness: 'Bien-être',
  insurance: 'Assurance',
  airplane: 'airplane',
  train: 'train',
  ferry: 'ferry',
};

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

    // 1. Save to Firestore as backup/record
    try {
      await addDoc(collection(db, 'form_submissions'), {
        formId,
        data: sanitizedData,
        createdAt: new Date().toISOString(),
        status: 'new',
      });
    } catch (fsErr) {
      console.error('Firestore save error:', fsErr);
    }

    // 2. Save to Google Sheets via Edge REST API
    try {
      const creds = getGoogleCredentials();
      const spreadsheetId = (
        process.env.GOOGLE_SHEET_AUTRES_ID || process.env.GOOGLE_SHEET_ID
      )?.trim();

      if (creds && spreadsheetId) {
        let tabTitle = SERVICE_TAB_MAP[formId] || 'Autres';
        if (formId.startsWith('car_')) {
          tabTitle = 'car';
        }

        const sheet = new EdgeGoogleSheet(spreadsheetId, creds.clientEmail, creds.privateKey);
        const rowData: Record<string, string> = {
          Date: new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Algiers' }),
          Service: formId,
          ...sanitizedData,
        };

        await sheet.appendRow(tabTitle, ['Date', 'Service', 'Détails'], rowData, true);
      } else {
        console.warn('Google Sheets environment variables are missing. Skipping Google Sheets integration.');
      }
    } catch (sheetErr) {
      console.error('Google Sheets save error:', sheetErr);
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
