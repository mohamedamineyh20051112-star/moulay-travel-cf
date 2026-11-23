"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { Mail, Phone, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Footer() {
  const t = useTranslations("Footer");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [workingHours, setWorkingHours] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [contact, setContact] = useState<any>({
    phone1: '0555536525',
    phone2: '042187559',
    email: 'moulaytravel31@gmail.com'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'global');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.workingHours) {
            const hours = data.workingHours;
            if (locale === 'ar' && hours.ar) setWorkingHours(hours.ar);
            else if (hours.fr) setWorkingHours(hours.fr);
          }
          if (data.logoUrl) {
            setLogoUrl(data.logoUrl);
          }
          if (data.contact) {
            setContact(data.contact);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, [locale]);

  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gold/20">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        
        {/* Logo and Name in Center */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gold mb-4 shadow-[0_0_15px_rgba(212,175,55,0.3)] bg-white">
            <Image src={logoUrl || "/logo.jpg"} alt="Moulay Travel" fill className="object-contain" />
          </div>
          <h3 className="text-2xl font-bold text-gold drop-shadow-md">{tCommon("agency_name")}</h3>
          <p className="text-sm text-gray-400 mt-2 max-w-sm">{tCommon("slogan")}</p>
        </div>

        {/* Contact Info taking the rest of the space */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 justify-center items-center mb-10 w-full max-w-3xl border-t border-white/10 pt-8">
          <div className="flex flex-col items-center flex-1">
            <Mail className="text-gold mb-2" size={24} />
            <a href={`mailto:${contact.email}`} className="hover:text-gold transition-colors">
              {contact.email}
            </a>
          </div>
          
          <div className="flex flex-col items-center flex-1">
            <Phone className="text-gold mb-2" size={24} />
            <div className="flex flex-col items-center gap-1">
              <a href={`tel:+213${contact.phone1.replace(/^0/, '')}`} className="hover:text-gold transition-colors" dir="ltr">
                {contact.phone1}
              </a>
              {contact.phone2 && (
                <a href={`tel:+213${contact.phone2.replace(/^0/, '')}`} className="hover:text-gold transition-colors" dir="ltr">
                  {contact.phone2}
                </a>
              )}
            </div>
          </div>

          {workingHours && (
            <div className="flex flex-col items-center flex-1">
              <Clock className="text-gold mb-2" size={24} />
              <div className="text-gray-300 max-w-[200px]">
                {workingHours}
              </div>
            </div>
          )}
        </div>

        {/* Social Media Links */}
        {(contact.facebook || contact.instagram || contact.tiktok || contact.customApp) && (
          <div className="flex justify-center gap-4 mb-8">
            {contact.facebook && (
              <a href={contact.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            )}
            {contact.instagram && (
              <a href={contact.instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            )}
            {contact.tiktok && (
              <a href={contact.tiktok} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors text-xs font-bold">
                TT
              </a>
            )}
            {contact.customApp && (
              <a href={contact.customApp} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors text-xs font-bold px-2 whitespace-nowrap">
                {contact.customAppName || 'App'}
              </a>
            )}
          </div>
        )}

        {/* Copyright */}
        <div className="w-full text-center text-white/50 text-sm mt-4 border-t border-white/10 pt-4">
          <p>{t("rights")}</p>
        </div>
      </div>
    </footer>
  );
}
