"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatConvertedPrice, useCurrencyStore } from "@/store/useCurrencyStore";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface TopDestinationItem {
  id: string;
  image?: string;
  title?: Record<string, string>;
  desc?: Record<string, string>;
  priceDzd?: string | number;
  priceEur?: string | number;
  days?: string | number;
  hotelsCount?: number;
}

export default function TopDestinations() {
  const locale = useLocale() as "ar" | "fr" | "en";
  const isRtl = locale === "ar";
  const { currency, dzdPerEur } = useCurrencyStore();
  const [destinations, setDestinations] = useState<TopDestinationItem[]>([]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "topDestinations"));
        const data = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as TopDestinationItem
        );
        setDestinations(data);
      } catch (err) {
        console.error("Error fetching destinations:", err);
      }
    };
    fetchDestinations();
  }, []);

  if (destinations.length === 0) return null;

  return (
    <section className="py-20 bg-white relative" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header matching clean editorial style */}
        <div className="text-center mb-14">
          <p className="text-gold font-semibold text-base sm:text-lg mb-1 tracking-wide">
            {isRtl ? "سافر مع مولاي ترافل" : locale === "fr" ? "Voyagez avec Moulay Travel" : "Travel with Moulay Travel"}
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#1e3a5f] mb-4">
            {isRtl ? "أشهر وجهاتنا" : locale === "fr" ? "Nos destinations" : "Our Destinations"}
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto rounded-full" />
        </div>

        {/* Clean Responsive Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {destinations.map((dest, i) => {
            const title = dest.title?.[locale] || dest.title?.fr || dest.title?.ar || "";
            const badgeText = dest.hotelsCount
              ? `${dest.hotelsCount} ${isRtl ? "فنادق" : locale === "en" ? "HOTELS" : "HÔTELS"}`
              : dest.days
                ? `${dest.days} ${isRtl ? "أيام" : locale === "en" ? "DAYS" : "JOURS"}`
                : "TOP";

            return (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.08, 0.35) }}
              >
                <Link
                  href={`/${locale}/organized_trips`}
                  className="block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300 group"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    {dest.image && (
                      <img
                        src={dest.image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-[#1e3a5f]/95 text-white px-3 py-1 rounded-lg text-xs font-extrabold tracking-wider uppercase shadow-md">
                      {badgeText}
                    </div>
                  </div>

                  <div className="px-5 py-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-xl font-extrabold text-[#1e3a5f] group-hover:text-gold transition-colors truncate">
                        {title}
                      </h3>
                      {dest.priceDzd && (
                        <p className="text-sm font-bold text-gray-500 mt-0.5" dir="ltr">
                          {isRtl ? "ابتداءً من " : locale === "en" ? "From " : "À partir de "}
                          <span className="text-primary">
                            {formatConvertedPrice(dest.priceDzd, currency, dzdPerEur, locale, dest.priceEur)}
                          </span>
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-[#1e3a5f] group-hover:text-gold shrink-0 transition-transform ${
                        isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
                      }`}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
