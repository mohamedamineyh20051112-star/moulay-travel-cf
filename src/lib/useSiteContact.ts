'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sanitizeExternalUrl } from '@/lib/normalize';

export interface SiteContactInfo {
  whatsapp: string;
  phone1: string;
  phone2: string;
  email: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  customApp?: string;
  customAppName?: string;
}

export const DEFAULT_SITE_CONTACT: SiteContactInfo = {
  whatsapp: '213555536525',
  phone1: '0555536525',
  phone2: '042187559',
  email: 'moulaytravel31@gmail.com',
};

let cachedContact: SiteContactInfo | null = null;
let inflightPromise: Promise<SiteContactInfo> | null = null;

function cleanWhatsappDigits(raw: unknown): string {
  if (typeof raw !== 'string' && typeof raw !== 'number') return DEFAULT_SITE_CONTACT.whatsapp;
  let digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  // Convert Algerian national numbers (05/06/07xxxxxxxx or 02/03/04xxxxxxx) to 213...
  if (digits.length === 10 && /^0[567]\d{8}$/.test(digits)) {
    digits = `213${digits.slice(1)}`;
  } else if (digits.length === 9 && /^0[234]\d{7}$/.test(digits)) {
    digits = `213${digits.slice(1)}`;
  }
  return digits.length >= 8 ? digits : DEFAULT_SITE_CONTACT.whatsapp;
}

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const digits = cleanWhatsappDigits(whatsappNumber);
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export async function fetchSiteContactOnce(): Promise<SiteContactInfo> {
  if (cachedContact) return cachedContact;
  if (inflightPromise) return inflightPromise;

  inflightPromise = getDoc(doc(db, 'siteSettings', 'global'))
    .then((snap) => {
      if (snap.exists()) {
        const contact = (snap.data()?.contact || {}) as Record<string, unknown>;
        cachedContact = {
          whatsapp: cleanWhatsappDigits(contact.whatsapp),
          phone1: typeof contact.phone1 === 'string' && contact.phone1.trim() ? contact.phone1.trim() : DEFAULT_SITE_CONTACT.phone1,
          phone2: typeof contact.phone2 === 'string' ? contact.phone2.trim() : DEFAULT_SITE_CONTACT.phone2,
          email: typeof contact.email === 'string' && contact.email.trim() ? contact.email.trim() : DEFAULT_SITE_CONTACT.email,
          facebook: sanitizeExternalUrl(contact.facebook) || '',
          instagram: sanitizeExternalUrl(contact.instagram) || '',
          tiktok: sanitizeExternalUrl(contact.tiktok) || '',
          customApp: sanitizeExternalUrl(contact.customApp) || '',
          customAppName: typeof contact.customAppName === 'string' ? contact.customAppName.trim() : '',
        };
      } else {
        cachedContact = DEFAULT_SITE_CONTACT;
      }
      return cachedContact;
    })
    .catch(() => {
      cachedContact = DEFAULT_SITE_CONTACT;
      return cachedContact;
    })
    .finally(() => {
      inflightPromise = null;
    });

  return inflightPromise;
}

export function useSiteContact(): SiteContactInfo {
  const [contact, setContact] = useState<SiteContactInfo>(cachedContact || DEFAULT_SITE_CONTACT);

  useEffect(() => {
    let active = true;
    fetchSiteContactOnce().then((res) => {
      if (active) setContact(res);
    });
    return () => {
      active = false;
    };
  }, []);

  return contact;
}
