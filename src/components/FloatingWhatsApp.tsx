"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { buildWhatsAppUrl, useSiteContact } from "@/lib/useSiteContact";

export default function FloatingWhatsApp() {
  const locale = useLocale();
  const pathname = usePathname() || "";
  const contact = useSiteContact();

  // Clean pathname to check if it's an inner page
  const cleanPath = pathname.replace(`/${locale}`, '').replace(/^\//, '');
  const isInnerPage = cleanPath.length > 0;

  if (isInnerPage) return null;

  const waText = locale === 'ar'
    ? "السلام عليكم، أود الاستفسار بخصوص خدمات وكالة مولاي ترافل..."
    : locale === 'fr'
    ? "Bonjour, je voudrais me renseigner concernant les services de l'agence Moulay Travel..."
    : "Hello, I would like to inquire about the services of Moulay Travel Agency...";

  return (
    <motion.a
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      href={buildWhatsAppUrl(contact.whatsapp, waText)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] flex items-center justify-center bg-[#25D366] hover:bg-[#1ebe57] text-white p-4 rounded-full transition-all duration-300 shadow-2xl hover:shadow-[#25D366]/50 hover:-translate-y-1 group"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 md:w-10 md:h-10">
        <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.645.85 5.105 2.336 7.151l-1.576 4.673 4.88-1.545a11.968 11.968 0 006.391 1.836c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 22.146c-2.222 0-4.33-.585-6.195-1.602l-.443-.263-3.084.975.992-2.964-.288-.458A10.096 10.096 0 011.938 12.03c0-5.568 4.525-10.093 10.093-10.093s10.093 4.525 10.093 10.093-4.525 10.093-10.093 10.093zm5.545-7.556c-.304-.152-1.796-.886-2.074-.987-.278-.101-.481-.152-.684.152-.203.304-.785.987-.962 1.19-.177.203-.354.228-.658.076-.304-.152-1.283-.473-2.443-1.512-.903-.808-1.512-1.808-1.69-2.112-.177-.304-.019-.468.133-.62.137-.137.304-.354.456-.531.152-.177.203-.304.304-.506.101-.203.051-.38-.025-.531-.076-.152-.684-1.646-.937-2.253-.247-.595-.498-.515-.684-.524-.177-.008-.38-.01-.582-.01-.203 0-.532.076-.81.38-.278.304-1.063 1.038-1.063 2.532s1.089 2.937 1.241 3.14c.152.203 2.14 3.266 5.184 4.583 2.584 1.116 3.064.886 3.621.836.557-.051 1.796-.734 2.05-1.443.253-.709.253-1.317.177-1.443-.076-.127-.279-.203-.583-.354z"/>
      </svg>
      
      {/* Tooltip that shows on hover */}
      <span className="absolute right-full mr-4 bg-white text-gray-800 font-bold px-4 py-2 rounded-xl shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        {locale === 'ar' ? 'تواصل معنا' : locale === 'fr' ? 'Contactez-nous' : 'Contact Us'}
      </span>
    </motion.a>
  );
}
