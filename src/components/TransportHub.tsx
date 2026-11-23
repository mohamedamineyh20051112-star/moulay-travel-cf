"use client";
import React, { useState } from "react";
import { Plane, Ship, Train } from "lucide-react";
import { motion } from "framer-motion";
import FlightBookingForm from "@/components/FlightBookingForm";
import TrainBookingForm from "@/components/TrainBookingForm";
import FerryBookingForm from "@/components/FerryBookingForm";
import { useTranslations } from "next-intl";

export default function TransportHub({ locale }: { locale: string }) {
  const t = useTranslations("TransportForms");
  const [selectedService, setSelectedService] = useState<"airplane" | "train" | "ferry" | null>(null);
  const [hovered, setHovered] = useState<"airplane" | "train" | "ferry" | null>(null);

  const isRtl = locale === "ar";

  if (selectedService === "airplane") {
    return <FlightBookingForm locale={locale} onBack={() => setSelectedService(null)} />;
  }

  if (selectedService === "train") {
    return <TrainBookingForm locale={locale} onBack={() => setSelectedService(null)} />;
  }

  if (selectedService === "ferry") {
    return <FerryBookingForm locale={locale} onBack={() => setSelectedService(null)} />;
  }

  const subtitle =
    locale === "ar"
      ? "اختر نوع وسيلة النقل التي تناسب رحلتك لنقدم لك أفضل عروض الأسعار."
      : locale === "en"
        ? "Choose the mode of transport that suits your journey to receive our best fares."
        : "Choisissez le type de transport qui correspond à votre voyage pour obtenir nos meilleures offres.";

  return (
    <div className="pt-24 pb-16 bg-gray-50 min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-[#3a2818] mb-4">{t("title")}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Airplane Button with Takeoff Animation */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHovered("airplane")}
            onHoverEnd={() => setHovered(null)}
            onClick={() => setSelectedService("airplane")}
            className="relative overflow-hidden flex flex-col items-center p-8 bg-white rounded-3xl shadow-md border border-[#e5d5b5]/60 hover:border-gold hover:shadow-[0_18px_40px_rgba(197,154,63,0.28)] transition-all group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-24 h-24 rounded-full bg-[#3a2818] text-white flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-[#c59a3f] group-hover:to-[#e5c16c] group-hover:text-[#23180f] transition-all duration-500 shadow-lg overflow-hidden">
              <motion.div
                animate={
                  hovered === "airplane"
                    ? { x: [0, 8, -4, 6, 0], y: [0, -8, -2, -6, 0], rotate: [0, -12, -4, -10, 0] }
                    : { y: [0, -3, 0] }
                }
                transition={
                  hovered === "airplane"
                    ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <Plane size={42} />
              </motion.div>
            </div>
            <h3 className="relative z-10 text-2xl font-bold text-[#3a2818] mb-3 group-hover:text-[#b38b36] transition-colors">
              {t("airplane")}
            </h3>
            <p className="relative z-10 text-gray-500 text-center">{t("airplaneDesc")}</p>
          </motion.button>

          {/* Ferry Button with Gentle Ocean Wave Rocking Animation */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHovered("ferry")}
            onHoverEnd={() => setHovered(null)}
            onClick={() => setSelectedService("ferry")}
            className="relative overflow-hidden flex flex-col items-center p-8 bg-white rounded-3xl shadow-md border border-[#e5d5b5]/60 hover:border-gold hover:shadow-[0_18px_40px_rgba(197,154,63,0.28)] transition-all group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 via-gold/0 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-24 h-24 rounded-full bg-[#3a2818] text-white flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-[#c59a3f] group-hover:to-[#e5c16c] group-hover:text-[#23180f] transition-all duration-500 shadow-lg overflow-hidden">
              <motion.div
                animate={
                  hovered === "ferry"
                    ? { rotate: [-6, 6, -6], y: [0, -4, 2, 0] }
                    : { rotate: [-2, 2, -2] }
                }
                transition={{
                  duration: hovered === "ferry" ? 1.5 : 3.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Ship size={42} />
              </motion.div>
              {/* Subtle wave line at bottom of icon circle */}
              <motion.span
                className="absolute bottom-3 left-3 right-3 h-0.5 rounded-full bg-current opacity-40"
                animate={{ scaleX: [0.7, 1, 0.7], x: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <h3 className="relative z-10 text-2xl font-bold text-[#3a2818] mb-3 group-hover:text-[#b38b36] transition-colors">
              {t("ferry")}
            </h3>
            <p className="relative z-10 text-gray-500 text-center">{t("ferryDesc")}</p>
          </motion.button>

          {/* Train Button with Smooth Speed Glide Animation */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHovered("train")}
            onHoverEnd={() => setHovered(null)}
            onClick={() => setSelectedService("train")}
            className="relative overflow-hidden flex flex-col items-center p-8 bg-white rounded-3xl shadow-md border border-[#e5d5b5]/60 hover:border-gold hover:shadow-[0_18px_40px_rgba(197,154,63,0.28)] transition-all group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-24 h-24 rounded-full bg-[#3a2818] text-white flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-[#c59a3f] group-hover:to-[#e5c16c] group-hover:text-[#23180f] transition-all duration-500 shadow-lg overflow-hidden">
              <motion.div
                animate={
                  hovered === "train"
                    ? { x: [-5, 6, -5], y: [0, -1, 0] }
                    : { x: [-1, 1, -1] }
                }
                transition={{
                  duration: hovered === "train" ? 0.9 : 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Train size={42} />
              </motion.div>
              <motion.span
                className="absolute bottom-3 left-4 right-4 h-0.5 rounded-full bg-current opacity-35"
                animate={{ opacity: hovered === "train" ? [0.2, 0.8, 0.2] : 0.25 }}
                transition={{ duration: 0.7, repeat: Infinity }}
              />
            </div>
            <h3 className="relative z-10 text-2xl font-bold text-[#3a2818] mb-3 group-hover:text-[#b38b36] transition-colors">
              {t("train")}
            </h3>
            <p className="relative z-10 text-gray-500 text-center">{t("trainDesc")}</p>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
