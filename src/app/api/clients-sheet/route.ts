import { NextResponse } from 'next/server';
import { cleanEnvValue, EdgeGoogleSheet, getGoogleCredentials } from '@/lib/googleSheetsEdge';
import {
  checkRateLimit,
  getClientIp,
  isValidEmail,
  isValidPhone,
  sanitizePhone,
  sanitizeText,
} from '@/lib/security';

export const runtime = 'edge';

const HEADERS = [
  'Date Inscription',
  'Nom Complet',
  'Email',
  'Téléphone',
  'Rôle',
  'CCP (Marketer)',
];

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`clients-sheet:${ip}`, 8, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Trop de demandes. Veuillez réessayer.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) {
      return NextResponse.json({ success: false, error: 'Données invalides.' }, { status: 400 });
    }

    const name = sanitizeText(body.name, 120);
    const email = sanitizeText(body.email, 150);
    const phone = sanitizeText(body.phone, 30);
    const ccp = sanitizeText(body.ccp, 60);
    // Strict allowlist: never allow client to self-assign super_admin
    const role = body.role === 'marketer' ? 'marketer' : 'client';

    if (!name || !email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Nom et adresse e-mail valides requis.' },
        { status: 400 }
      );
    }
    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Numéro de téléphone invalide.' },
        { status: 400 }
      );
    }

    const creds = getGoogleCredentials();
    const spreadsheetId = cleanEnvValue(
      process.env.GOOGLE_SHEET_OMRA_ID || process.env.GOOGLE_SHEET_AUTRES_ID
    );

    if (!creds || !spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'Configuration du serveur manquante.' },
        { status: 500 }
      );
    }

    const tabTitle = role === 'marketer' ? 'Marketers' : 'Clients';
    const sheet = new EdgeGoogleSheet(spreadsheetId, creds.clientEmail, creds.privateKey);
    const now = new Date();

    await sheet.appendRow(tabTitle, HEADERS, {
      'Date Inscription': `${now.toLocaleDateString('fr-FR', { timeZone: 'Africa/Algiers' })} ${now.toLocaleTimeString('fr-FR', { timeZone: 'Africa/Algiers' })}`,
      'Nom Complet': name,
      Email: email,
      Téléphone: sanitizePhone(phone),
      Rôle: role,
      'CCP (Marketer)': ccp ? sanitizePhone(ccp) : '',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Client Sheet Error:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'enregistrement." },
      { status: 500 }
    );
  }
}
