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
  'Numéro de demande',
  'Date',
  'Heure',
  'Nom et prénom',
  'Téléphone/WhatsApp',
  'E-mail',
  'Type de voyage',
  'Ville de départ',
  'Destination',
  'Date de départ',
  'Date de retour',
  'Flexibilité des dates',
  'Préférence d’horaire',
  'Type de vol préféré',
  'Classe souhaitée',
  'Compagnie préférée',
  'Type d’avion',
  'Bagages souhaités',
  'Adultes',
  'Enfants',
  'Bébés',
  "Document d'identité",
];

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`booking-flights:${ip}`, 10, 60_000);
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
    const spreadsheetId = cleanEnvValue(process.env.GOOGLE_SHEET_AUTRES_ID) || DEFAULT_GOOGLE_SHEET_ID;
    if (!creds || !spreadsheetId) {
      console.error('Google credentials or GOOGLE_SHEET_AUTRES_ID missing.');
      return NextResponse.json(
        { success: false, error: 'Configuration du serveur manquante.' },
        { status: 500 }
      );
    }

    const tabTitle = 'Billet Avion';
    const sheet = new EdgeGoogleSheet(spreadsheetId, creds.clientEmail, creds.privateKey);
    await sheet.ensureTab(tabTitle, HEADERS);

    const now = new Date();
    const yearSuffix = now.getFullYear().toString().slice(-2);
    const sequenceNumber = await sheet.getNextSequenceNumber(tabTitle, 0, /\/(\d+)$/);
    const requestId = `B/${yearSuffix}/${sequenceNumber.toString().padStart(3, '0')}`;

    await sheet.appendRow(tabTitle, HEADERS, {
      'Numéro de demande': requestId,
      Date: now.toLocaleDateString('fr-FR', { timeZone: 'Africa/Algiers' }),
      Heure: now.toLocaleTimeString('fr-FR', { timeZone: 'Africa/Algiers' }),
      'Nom et prénom': nom,
      'Téléphone/WhatsApp': sanitizePhone(telephone),
      'E-mail': email,
      'Type de voyage': sanitizeText(formData.get('type_voyage'), 60),
      'Ville de départ': sanitizeText(formData.get('ville_depart'), 100),
      Destination: sanitizeText(formData.get('destination'), 100),
      'Date de départ': sanitizeText(formData.get('date_depart'), 40),
      'Date de retour': sanitizeText(formData.get('date_retour'), 40),
      'Flexibilité des dates': sanitizeText(formData.get('flexibilite_dates'), 60),
      'Préférence d’horaire': sanitizeText(formData.get('preference_horaire'), 60),
      'Type de vol préféré': sanitizeText(formData.get('type_vol'), 60),
      'Classe souhaitée': sanitizeText(formData.get('classe'), 60),
      'Compagnie préférée': sanitizeText(formData.get('compagnie'), 80),
      'Type d’avion': sanitizeText(formData.get('type_avion'), 60),
      'Bagages souhaités': sanitizeText(formData.get('bagages'), 80),
      Adultes: sanitizeText(formData.get('adultes') || '0', 10),
      Enfants: sanitizeText(formData.get('enfants') || '0', 10),
      Bébés: sanitizeText(formData.get('bebes') || '0', 10),
      "Document d'identité": 'Non demandé',
    });

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error('Flights booking submission error:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi de votre demande. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
