"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ChevronRight, Crown, Compass, Waves } from "lucide-react";
import Link from "next/link";
import { formatConvertedPrice, useCurrencyStore } from "@/store/useCurrencyStore";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { normalizeDestination } from "@/lib/normalize";
import { useAutoTranslate } from "@/lib/translateClient";

interface ResolvedTopDestination {
  id: string;
  image?: string;
  countryCode?: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  vipCount: number;
  organizedCount: number;
  hammamCount: number;
  totalOffers: number;
  minPriceDzd: number;
  targetHref: string;
}

function TopDestinationCard({
  dest,
  locale,
  index,
}: {
  dest: ResolvedTopDestination;
  locale: "ar" | "fr" | "en";
  index: number;
}) {
  const isRtl = locale === "ar";
  const { currency, dzdPerEur } = useCurrencyStore();

  const title = useAutoTranslate(
    dest.nameAr,
    locale,
    locale === "en" ? dest.nameEn || dest.nameFr : locale === "fr" ? dest.nameFr : dest.nameAr
  );

  const flagSrc = dest.countryCode
    ? `/flags/${String(dest.countryCode).toLowerCase()}.svg`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.35) }}
      whileHover={{ y: -5 }}
    >
      <Link
        href={dest.targetHref}
        className="block bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 hover:border-gold/50 transition-all duration-300 group"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
          {dest.image ? (
            <img
              src={dest.image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f] to-[#0f1f38] flex items-center justify-center text-gold/50 font-black text-3xl">
              {title.slice(0, 2)}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Offers Count Badge */}
          <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-[#1e3a5f]/95 text-white px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shadow-md backdrop-blur-sm">
            {dest.totalOffers}{" "}
            {isRtl
              ? "عروض متاحة"
              : locale === "en"
                ? "OFFERS"
                : "OFFRES"}
          </div>

          {/* Available Categories Pills */}
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
            {dest.vipCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-black/75 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm">
                <Crown className="w-3 h-3" /> VIP ({dest.vipCount})
              </span>
            )}
            {dest.organizedCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-white/90 text-[#1e3a5f] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                <Compass className="w-3 h-3 text-gold" />{" "}
                {isRtl ? "منظمة" : locale === "en" ? "Tours" : "Organisés"} ({dest.organizedCount})
              </span>
            )}
            {dest.hammamCount > 0 && (
              <span className="inline-flex items-center gap-1 bg-emerald-900/80 text-emerald-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm">
                <Waves className="w-3 h-3" />{" "}
                {isRtl ? "حمامات" : locale === "en" ? "Spa" : "Thermes"} ({dest.hammamCount})
              </span>
            )}
          </div>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              {flagSrc && (
                <img
                  src={flagSrc}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="w-6 h-4 rounded object-cover border border-gray-200 shrink-0"
                />
              )}
              <h3 className="text-xl font-extrabold text-[#1e3a5f] group-hover:text-gold transition-colors truncate">
                {title}
              </h3>
            </div>

            {dest.minPriceDzd > 0 && (
              <p className="text-sm font-bold text-gray-500 mt-1" dir="ltr">
                {isRtl ? "ابتداءً من " : locale === "en" ? "From " : "À partir de "}
                <span className="text-primary">
                  {formatConvertedPrice(dest.minPriceDzd, currency, dzdPerEur, locale, null)}
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
}

export default function TopDestinations() {
  const locale = useLocale() as "ar" | "fr" | "en";
  const isRtl = locale === "ar";
  const [destinations, setDestinations] = useState<ResolvedTopDestination[]>([]);

  useEffect(() => {
    const fetchDestinationsAndOffers = async () => {
      try {
        const [
          servDestSnap,
          orgDestSnap,
          vipDestSnap,
          hamDestSnap,
          vipHotelsSnap,
          orgHotelsSnap,
          hammamsSnap,
        ] = await Promise.all([
          getDocs(collection(db, "services_destinations")),
          getDocs(collection(db, "organized_trips_destinations")),
          getDocs(collection(db, "vip_trips_destinations")),
          getDocs(collection(db, "hammams_destinations")),
          getDocs(collection(db, "vip_trips_hotels")),
          getDocs(collection(db, "organized_trips_hotels")),
          getDocs(collection(db, "hammams")),
        ]);

        const destMap = new Map<string, any>();
        [hamDestSnap, vipDestSnap, orgDestSnap, servDestSnap].forEach((snap) => {
          snap.docs.forEach((d) => {
            const norm = normalizeDestination(d);
            if (!destMap.has(d.id)) {
              destMap.set(d.id, norm);
            } else {
              // Preserve existing and fill missing fields cleanly
              const existing = destMap.get(d.id);
              destMap.set(d.id, { ...existing, ...norm });
            }
          });
        });

        const stats: Record<
          string,
          { vipCount: number; organizedCount: number; hammamCount: number; minPriceDzd: number }
        > = {};

        const recordOffer = (docData: any, key: "vipCount" | "organizedCount" | "hammamCount") => {
          const destId = docData.destinationId;
          if (!destId) return;
          if (!stats[destId]) {
            stats[destId] = { vipCount: 0, organizedCount: 0, hammamCount: 0, minPriceDzd: 0 };
          }
          stats[destId][key] += 1;

          const base = Number(docData.price || 0);
          const disc = Number(docData.discountPrice || 0);
          const eff = disc > 0 && base > disc ? base - disc : base;
          if (eff > 0 && (stats[destId].minPriceDzd === 0 || eff < stats[destId].minPriceDzd)) {
            stats[destId].minPriceDzd = eff;
          }
        };

        vipHotelsSnap.docs.forEach((d) => recordOffer(d.data(), "vipCount"));
        orgHotelsSnap.docs.forEach((d) => recordOffer(d.data(), "organizedCount"));
        hammamsSnap.docs.forEach((d) => recordOffer(d.data(), "hammamCount"));

        const resolved: ResolvedTopDestination[] = [];
        destMap.forEach((dest, id) => {
          const s = stats[id];
          if (!s) return;
          const totalOffers = s.vipCount + s.organizedCount + s.hammamCount;
          if (totalOffers <= 0) return;

          // Pick exact available category route
          const targetHref =
            s.organizedCount > 0
              ? `/${locale}/organized_trips/${id}`
              : s.vipCount > 0
                ? `/${locale}/vip_trips/${id}`
                : `/${locale}/hammams/${id}`;

          resolved.push({
            id,
            image: dest.image || (dest.countryCode ? `/flags/${String(dest.countryCode).toLowerCase()}.svg` : ""),
            countryCode: dest.countryCode || "",
            nameAr: dest.nameAr || "",
            nameFr: dest.nameFr || dest.nameAr || "",
            nameEn: dest.nameEn || dest.nameFr || dest.nameAr || "",
            vipCount: s.vipCount,
            organizedCount: s.organizedCount,
            hammamCount: s.hammamCount,
            totalOffers,
            minPriceDzd: s.minPriceDzd,
            targetHref,
          });
        });

        // Sort highest offer count first
        resolved.sort((a, b) => b.totalOffers - a.totalOffers);
        setDestinations(resolved);
      } catch (err) {
        console.error("Error fetching destinations:", err);
      }
    };
    fetchDestinationsAndOffers();
  }, [locale]);

  if (destinations.length === 0) return null;

  return (
    <section className="py-20 bg-white relative" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-14">
          <p className="text-gold font-semibold text-base sm:text-lg mb-1 tracking-wide">
            {isRtl
              ? "سافر مع مولاي ترافل"
              : locale === "fr"
                ? "Voyagez avec Moulay Travel"
                : "Travel with Moulay Travel"}
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#1e3a5f] mb-4">
            {isRtl ? "أشهر وجهاتنا" : locale === "fr" ? "Nos destinations" : "Our Destinations"}
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {destinations.map((dest, i) => (
            <TopDestinationCard key={dest.id} dest={dest} locale={locale} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
