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
  'Time',
  'Name',
  'Phone',
  'WhatsApp',
  'Email',
  'Offer',
  'Destination',
  'Departure Date',
  'Return Date',
  'Travelers (A/C)',
  'Passport Link',
  'ID Link',
  'Notes',
  'Status',
];

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`booking:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: 'Trop de demandes. Veuillez réessayer dans une minute.' },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const formData = await request.formData();

    const name = sanitizeText(formData.get('name'), 120);
    const phone = sanitizeText(formData.get('phone'), 30);
    const whatsapp = sanitizeText(formData.get('whatsapp'), 30);
    const email = sanitizeText(formData.get('email'), 150);
    const service = sanitizeText(formData.get('service'), 60);
    const offer = sanitizeText(formData.get('offer'), 150);
    const destination = sanitizeText(formData.get('destination'), 120);
    const departureDate = sanitizeText(formData.get('departureDate'), 40);
    const returnDate = sanitizeText(formData.get('returnDate'), 40);
    const adults = sanitizeText(formData.get('adults') || '1', 10);
    const children = sanitizeText(formData.get('children') || '0', 10);
    const notes = sanitizeText(formData.get('notes'), 1000);

    if (!name || !phone || !isValidPhone(phone)) {
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
    const isOmra = service === 'umrah';
    const spreadsheetId =
      cleanEnvValue(isOmra ? process.env.GOOGLE_SHEET_OMRA_ID : process.env.GOOGLE_SHEET_AUTRES_ID) ||
      DEFAULT_GOOGLE_SHEET_ID;

    if (!creds || !spreadsheetId) {
      console.error('Google Sheets credentials or Spreadsheet ID missing.');
      return NextResponse.json(
        { success: false, error: 'Configuration du serveur manquante.' },
        { status: 500 }
      );
    }

    const serviceTabMap: Record<string, string> = {
      flights: 'Billets',
      hotels: 'Hôtels',
      organized_trips: 'Voyages',
      vip: 'VIP',
      car_rental: 'Location voitures',
      promotions: 'Promotions',
      visas:
        destination === 'Spain'
          ? 'Espagne'
          : destination === 'Turkey'
            ? 'Turquie'
            : destination === 'France'
              ? 'France'
              : destination === 'Italy'
                ? 'Italie'
                : 'Other Services',
    };

    const tabTitle = isOmra ? 'Omra' : serviceTabMap[service] || 'Other Services';
    const sheet = new EdgeGoogleSheet(spreadsheetId, creds.clientEmail, creds.privateKey);
    await sheet.ensureTab(tabTitle, HEADERS);

    const sequenceNumber = await sheet.getNextSequenceNumber(tabTitle, 0, /#?(\d+)/);
    const requestId = `#${sequenceNumber}`;
    const now = new Date();

    await sheet.appendRow(tabTitle, HEADERS, {
      'Request ID': requestId,
      Date: now.toLocaleDateString('fr-FR', { timeZone: 'Africa/Algiers' }),
      Time: now.toLocaleTimeString('fr-FR', { timeZone: 'Africa/Algiers' }),
      Name: name,
      Phone: sanitizePhone(phone),
      WhatsApp: sanitizePhone(whatsapp),
      Email: email,
      Offer: offer,
      Destination: destination,
      'Departure Date': departureDate,
      'Return Date': returnDate,
      'Travelers (A/C)': `${adults} / ${children}`,
      'Passport Link': 'Non demandé',
      'ID Link': 'Non demandé',
      Notes: notes,
      Status: 'New',
    });

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error('Booking submission error:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi de votre demande. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
