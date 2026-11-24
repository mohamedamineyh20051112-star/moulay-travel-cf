"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail } from "lucide-react";
import { useSiteContact, buildWhatsAppUrl } from "@/lib/useSiteContact";

export default function LocationMap() {
  const t = useTranslations("Location");
  const tFooter = useTranslations("Footer");
  const locale = useLocale();
  const { whatsapp, phone1, email, facebook, instagram, tiktok } = useSiteContact();
  const waText =
    locale === "ar"
      ? "السلام عليكم، أود الاستفسار بخصوص خدمات وكالة مولاي ترافل..."
      : locale === "en"
        ? "Hello, I would like information about Moulay Travel services..."
        : "Bonjour, je voudrais me renseigner concernant les services de l'agence Moulay Travel...";

  return (
    <section className="py-20 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/3 space-y-6"
          >
            <div className="inline-block px-4 py-2 bg-gold/10 rounded-full text-gold font-bold text-sm mb-2">
              {t("title")}
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary">
              {t("title")}
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t("desc")}
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-4 text-primary">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                  <MapPin className="text-gold" />
                </div>
                <span className="font-medium text-lg">{t("address")}</span>
              </div>
              <div className="flex items-center gap-4 text-primary">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                  <Phone className="text-gold" />
                </div>
                <span className="font-medium text-lg" dir="ltr">{phone1}</span>
              </div>
              <div className="flex items-center gap-4 text-primary">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center">
                  <Mail className="text-gold" />
                </div>
                <span className="font-medium text-lg">{email}</span>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-2/3 h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white"
          >
            <iframe
              src="https://maps.google.com/maps?q=Moulay+Travel+Oran+Algeria&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>
        </div>

        {/* Social Icons at the bottom before Footer */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 pt-10 border-t border-gray-200"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-primary inline-block relative mb-4">
                {t("our_links")}
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gold rounded-full"></span>
              </h3>
            </div>
            
            <div className="flex justify-center items-center gap-6 mt-8">
              {/* Facebook */}
              <a href={facebook || "https://www.facebook.com/moulaytravel"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1877F2] to-[#0b5cce] text-white rounded-full shadow-lg hover:shadow-[0_10px_25px_rgba(24,119,242,0.5)] hover:-translate-y-2 transition-all duration-300 border-2 border-white/20">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
              </a>

              {/* Instagram */}
              <a href={instagram || "https://www.instagram.com/moulay_travel"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] text-white rounded-full shadow-lg hover:shadow-[0_10px_25px_rgba(188,24,136,0.5)] hover:-translate-y-2 transition-all duration-300 border-2 border-white/20">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>

              {/* TikTok */}
              <a href={tiktok || "https://www.tiktok.com/@moulaytravel"} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#010101] to-[#333333] text-white rounded-full shadow-lg hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:-translate-y-2 transition-all duration-300 border-2 border-[#69C9D0]/50 relative overflow-hidden">
                <svg className="w-8 h-8 relative z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" opacity="0"/><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </a>

              {/* WhatsApp */}
              <a href={buildWhatsAppUrl(whatsapp, waText)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#25D366] to-[#1da851] text-white rounded-full shadow-lg hover:shadow-[0_10px_25px_rgba(37,211,102,0.5)] hover:-translate-y-2 transition-all duration-300 border-2 border-white/20">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.645.85 5.105 2.336 7.151l-1.576 4.673 4.88-1.545a11.968 11.968 0 006.391 1.836c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 22.146c-2.222 0-4.33-.585-6.195-1.602l-.443-.263-3.084.975.992-2.964-.288-.458A10.096 10.096 0 011.938 12.03c0-5.568 4.525-10.093 10.093-10.093s10.093 4.525 10.093 10.093-4.525 10.093-10.093 10.093zm5.545-7.556c-.304-.152-1.796-.886-2.074-.987-.278-.101-.481-.152-.684.152-.203.304-.785.987-.962 1.19-.177.203-.354.228-.658.076-.304-.152-1.283-.473-2.443-1.512-.903-.808-1.512-1.808-1.69-2.112-.177-.304-.019-.468.133-.62.137-.137.304-.354.456-.531.152-.177.203-.304.304-.506.101-.203.051-.38-.025-.531-.076-.152-.684-1.646-.937-2.253-.247-.595-.498-.515-.684-.524-.177-.008-.38-.01-.582-.01-.203 0-.532.076-.81.38-.278.304-1.063 1.038-1.063 2.532s1.089 2.937 1.241 3.14c.152.203 2.14 3.266 5.184 4.583 2.584 1.116 3.064.886 3.621.836.557-.051 1.796-.734 2.05-1.443.253-.709.253-1.317.177-1.443-.076-.127-.279-.203-.583-.354z"/></svg>
              </a>
            </div>

            {/* Working Hours underneath links */}
            <div className="mt-12 mb-4 bg-gray-50 rounded-[2rem] p-6 max-w-2xl mx-auto shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
              <h4 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold"></span>
                {tFooter("working_hours")}
                <span className="w-2 h-2 rounded-full bg-gold"></span>
              </h4>
              <p className="text-gray-700 font-medium text-lg mb-2">
                {tFooter("saturday_thursday")}
              </p>
              <div className="inline-block bg-primary/5 px-4 py-2 rounded-full text-primary font-bold mb-4" dir="ltr">
                08:00 - 18:30
              </div>
              <p className="text-red-500 font-semibold bg-red-50 px-4 py-2 rounded-full">
                {tFooter("friday_closed")}
              </p>
            </div>
        </motion.div>
      </div>
    </section>
  );
}
