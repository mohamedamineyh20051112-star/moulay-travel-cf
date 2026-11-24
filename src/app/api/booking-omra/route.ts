import { NextResponse } from 'next/server';
import {
  cleanEnvValue,
  DEFAULT_GOOGLE_SHEET_ID,
  EdgeGoogleSheet,
  getGoogleCredentials,
} from '@/lib/googleSheetsEdge';
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
  'Request ID',
  'Date',
  'Heure',
  'Nom Complet',
  'Téléphone',
  'Ville',
  'Email',
  'Adultes',
  'Adolescents',
  'Enfants',
  'Lit Enfant',
  'Bébés',
  'Type Chambre',
  'Période',
  'Durée',
  'Pension',
  'Transfert',
  'Santé',
  'Santé Autre',
  'Paiement',
];

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`booking-omra:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Trop de demandes. Veuillez réessayer dans une minute.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const formData = await request.formData();

    const nom = sanitizeText(formData.get('nom'), 120);
    const telephone = sanitizeText(formData.get('telephone'), 30);
    const email = sanitizeText(formData.get('email'), 150);

    if (!nom || !telephone || !isValidPhone(telephone)) {
      return NextResponse.json(
        { success: false, error: 'Nom et numéro de téléphone valide sont obligatoires.' },
        { status: 400 }
      );
    }
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Adresse e-mail invalide.' },
        { status: 400 }
      );
    }

    const creds = getGoogleCredentials();
    const spreadsheetId = cleanEnvValue(process.env.GOOGLE_SHEET_OMRA_ID) || DEFAULT_GOOGLE_SHEET_ID;
    if (!creds || !spreadsheetId) {
      console.error('Google credentials or GOOGLE_SHEET_OMRA_ID missing.');
      return NextResponse.json(
        { success: false, error: 'Configuration du serveur manquante.' },
        { status: 500 }
      );
    }

    const tabTitle = 'Omra';
    const sheet = new EdgeGoogleSheet(spreadsheetId, creds.clientEmail, creds.privateKey);
    await sheet.ensureTab(tabTitle, HEADERS);

    const now = new Date();
    const yearSuffix = now.getFullYear().toString().slice(-2);
    const sequenceNumber = await sheet.getNextSequenceNumber(tabTitle, 0, /\/(\d+)$/);
    const requestId = `O/${yearSuffix}/${sequenceNumber.toString().padStart(3, '0')}`;

    await sheet.appendRow(tabTitle, HEADERS, {
      'Request ID': requestId,
      Date: now.toLocaleDateString('fr-FR', { timeZone: 'Africa/Algiers' }),
      Heure: now.toLocaleTimeString('fr-FR', { timeZone: 'Africa/Algiers' }),
      'Nom Complet': nom,
      Téléphone: sanitizePhone(telephone),
      Ville: sanitizeText(formData.get('ville') || 'Non spécifié', 80),
      Email: email || 'Non spécifié',
      Adultes: sanitizeText(formData.get('adultes'), 10),
      Adolescents: sanitizeText(formData.get('adolescents') || '0', 10),
      Enfants: sanitizeText(formData.get('enfants'), 10),
      'Lit Enfant': sanitizeText(formData.get('lit_enfant'), 40),
      Bébés: sanitizeText(formData.get('bebes'), 10),
      'Type Chambre': sanitizeText(formData.get('type_chambre'), 80),
      Période: sanitizeText(formData.get('periode'), 80),
      Durée: sanitizeText(formData.get('duree'), 40),
      Pension: sanitizeText(formData.get('type_pension'), 80),
      Transfert: sanitizeText(formData.get('transfert'), 80),
      Santé: sanitizeText(formData.get('sante'), 120),
      'Santé Autre': sanitizeText(formData.get('sante_autre') || 'Néant', 300),
      Paiement: sanitizeText(formData.get('paiement'), 80),
    });

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error('Omra booking submission error:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi de votre demande. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
