"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Plane, Hotel, Moon, Map, Crown, FileText, Tag, PenTool, Car, Shield, CreditCard, Droplets } from "lucide-react";

export default function ServicesGrid({ locale }: { locale: string }) {
  const t = useTranslations("Services");

  const services = [
    { id: "promotions", icon: Tag, path: "/discounts", img: "/promotions.jpg" },
    { id: "flights", icon: Plane, path: "/flights", img: "/tickets.jpg" },
    { id: "hotels", icon: Hotel, path: "/hotels", img: "/hotels.jpg" },
    { id: "umrah", icon: Moon, path: "/umrah", img: "/umrah.jpg" },
    { id: "organized_trips", icon: Map, path: "/organized_trips", img: "/trips.jpg" },
    { id: "wellness", icon: Droplets, path: "/hammams", img: "/wellness.jpg" },
    { id: "vip", icon: Crown, path: "/vip_trips", img: "/vip.jpg" },
    { id: "visas", icon: FileText, path: "/visas", img: "/visas.jpg" },
    { id: "car_rental", icon: Car, path: "/cars", img: "/cars.jpg" },
    { id: "insurance", icon: Shield, path: "/insurance", img: "/insurance_new.jpg" },
    { id: "custom_trips", icon: PenTool, path: "/custom_trips", img: "/custom.jpg" },
    { id: "payment", icon: CreditCard, path: "/payment", img: "/payment_new.jpg" },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-primary mb-6 drop-shadow-sm"
          >
            {t("title")}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            className="h-1.5 bg-gold mx-auto rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.4), type: "spring" }}
                key={service.id}
                className="h-72"
              >
                <Link
                  href={`/${locale}${service.path}`}
                  className="group relative overflow-hidden rounded-[2rem] shadow-lg hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)] transition-all duration-500 transform hover:-translate-y-3 flex flex-col h-full border border-white/20 bg-white/5 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 w-full h-full">
                    <div className="absolute inset-0 bg-gray-800" />
                    <Image
                      src={service.img}
                      alt={t(`${service.id}.title`)}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                  </div>

                  <div className="relative z-10 flex flex-col items-center justify-end h-full p-6 text-center text-white">
                    <div className="bg-gold/90 backdrop-blur-md p-4 rounded-full mb-4 transform transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-2 group-hover:rotate-6 group-hover:bg-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                      <Icon size={32} className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 tracking-wide drop-shadow-md">
                      {t(`${service.id}.title`)}
                    </h3>
                    <p className="text-sm text-gray-200 line-clamp-2 opacity-95 sm:opacity-0 sm:translate-y-3 transition-all duration-500 sm:group-hover:opacity-100 sm:group-hover:translate-y-0">
                      {t(`${service.id}.desc`)}
                    </p>
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
