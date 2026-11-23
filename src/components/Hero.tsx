"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DEFAULT_DESKTOP_BACKGROUNDS = [
  "/hero-desktop.jpg",
  "/hero-desktop-2.jpg",
  "/hero-desktop-3.jpg",
];

const DEFAULT_MOBILE_BACKGROUNDS = [
  "/hero-mobile.jpg",
  "/hero-mobile-2.jpg",
  "/hero-mobile-3.jpg",
];

function getNextVisitIndex(storageKey: string, length: number): number {
  if (typeof window === "undefined" || length <= 1) return 0;
  try {
    const prev = window.localStorage.getItem(storageKey);
    const next = prev !== null ? (parseInt(prev, 10) + 1) % length : Math.floor(Math.random() * length);
    window.localStorage.setItem(storageKey, String(next));
    return Number.isNaN(next) ? 0 : next;
  } catch {
    return 0;
  }
}

export default function Hero({ locale }: { locale: string }) {
  const [desktopImages, setDesktopImages] = useState<string[]>(DEFAULT_DESKTOP_BACKGROUNDS);
  const [mobileImages, setMobileImages] = useState<string[]>(DEFAULT_MOBILE_BACKGROUNDS);
  const [desktopIdx, setDesktopIdx] = useState<number>(0);
  const [mobileIdx, setMobileIdx] = useState<number>(0);

  // Rotate background on every new visit
  useEffect(() => {
    setDesktopIdx(getNextVisitIndex("moulay_hero_desktop_idx", DEFAULT_DESKTOP_BACKGROUNDS.length));
    setMobileIdx(getNextVisitIndex("moulay_hero_mobile_idx", DEFAULT_MOBILE_BACKGROUNDS.length));
  }, []);

  // Load any custom hero images uploaded from /admin/hero in Firestore
  useEffect(() => {
    let active = true;
    const loadHeroImages = async () => {
      try {
        const snap = await getDocs(collection(db, "heroImages"));
        if (!active || snap.empty) return;

        const customDesktop: string[] = [];
        const customMobile: string[] = [];

        snap.docs.forEach((d) => {
          const data = d.data() as { type?: string; imageBase64?: string; imageUrl?: string };
          const src = data.imageBase64 || data.imageUrl;
          if (!src) return;
          if (data.type === "desktop") customDesktop.push(src);
          if (data.type === "mobile") customMobile.push(src);
        });

        if (customDesktop.length > 0) {
          const merged = [...customDesktop, ...DEFAULT_DESKTOP_BACKGROUNDS];
          setDesktopImages(merged);
          setDesktopIdx((prev) => prev % merged.length);
        }
        if (customMobile.length > 0) {
          const merged = [...customMobile, ...DEFAULT_MOBILE_BACKGROUNDS];
          setMobileImages(merged);
          setMobileIdx((prev) => prev % merged.length);
        }
      } catch (err) {
        console.error("Failed to fetch custom hero images:", err);
      }
    };
    loadHeroImages();
    return () => {
      active = false;
    };
  }, []);

  // Gentle automatic slideshow every 9 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDesktopIdx((prev) => (prev + 1) % desktopImages.length);
      setMobileIdx((prev) => (prev + 1) % mobileImages.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [desktopImages.length, mobileImages.length]);

  const activeDesktopSrc = desktopImages[desktopIdx % desktopImages.length];
  const activeMobileSrc = mobileImages[mobileIdx % mobileImages.length];

  return (
    <section className="relative w-full h-[100dvh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#0f172a]">
      {/* Rotating Desktop & Mobile Backgrounds */}
      <div className="absolute inset-0 z-0">
        {/* Desktop */}
        <div className="absolute inset-0 hidden md:block">
          <AnimatePresence mode="sync">
            <motion.div
              key={activeDesktopSrc}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={activeDesktopSrc}
                alt="Moulay Travel Hero Desktop"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile */}
        <div className="absolute inset-0 block md:hidden">
          <AnimatePresence mode="sync">
            <motion.div
              key={activeMobileSrc}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={activeMobileSrc}
                alt="Moulay Travel Hero Mobile"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dark Gradient Overlays for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/60 z-10" />
      </div>

      {/* Main Content */}
      <div className="container relative z-20 mx-auto px-4 h-full flex flex-col items-center justify-center pb-10 md:pb-12">
        <div className="max-w-4xl flex flex-col items-center text-center">
          {/* Decorative Top Accent */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-20 md:w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mb-8 rounded-full"
          />

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.4] w-full text-center mx-auto text-white tracking-wide relative flex flex-col items-center justify-center gap-2"
          >
            <span className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">Moulay Travel</span>
            <span className="text-gold drop-shadow-[0_0_15px_rgba(197,154,63,0.8)] whitespace-nowrap block mt-2 text-xl md:text-3xl uppercase tracking-widest font-semibold">
              {locale === "ar"
                ? "اضغط احجز سافر"
                : locale === "fr"
                  ? "Cliquez Réservez Voyagez"
                  : "Click Book Travel"}
            </span>
            {/* Animated Glow Behind Text */}
            <motion.div
              className="absolute inset-0 bg-gold blur-[80px] -z-10 rounded-full"
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-gray-100 mb-10 max-w-2xl leading-relaxed font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex flex-col items-center"
          >
            <p>
              {locale === "ar"
                ? "وكالة سفرك الرقمية 100%"
                : locale === "en"
                  ? "Your 100% digital travel agency."
                  : "Votre agence de voyages 100% digitale."}
            </p>
            <p className="mt-2 text-gold">
              {locale === "ar"
                ? "أينما كنت"
                : locale === "en"
                  ? "Wherever you are"
                  : "Où que vous soyez"}
            </p>
          </motion.div>
        </div>

        {/* Subtle Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {desktopImages.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => {
                setDesktopIdx(i);
                setMobileIdx(i % mobileImages.length);
              }}
              className={`h-2 rounded-full transition-all duration-500 ${
                desktopIdx % desktopImages.length === i
                  ? "w-8 bg-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                  : "w-2 bg-white/45 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
