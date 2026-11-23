"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Award, ShieldCheck, Tag, Headset, Laptop, CreditCard } from "lucide-react";

export default function WhyChooseUs() {
  const t = useTranslations("WhyChooseUs");

  const features = [
    {
      icon: <Award className="w-8 h-8 text-gold" />,
      title: t("quality_title"),
      desc: t("quality_desc")
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-gold" />,
      title: t("trust_title"),
      desc: t("trust_desc")
    },
    {
      icon: <Tag className="w-8 h-8 text-gold" />,
      title: t("price_title"),
      desc: t("price_desc")
    },
    {
      icon: <Headset className="w-8 h-8 text-gold" />,
      title: t("support_title"),
      desc: t("support_desc")
    },
    {
      icon: <Laptop className="w-8 h-8 text-gold" />,
      title: t("online_service_title"),
      desc: t("online_service_desc")
    },
    {
      icon: <CreditCard className="w-8 h-8 text-gold" />,
      title: t("online_payment_title"),
      desc: t("online_payment_desc")
    }
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-primary mb-6"
          >
            {t("title")}
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            className="h-1.5 bg-gold mx-auto rounded-full mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto text-lg md:text-xl text-gray-700 leading-relaxed font-medium"
          >
            {t("main_desc")}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-10">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
              whileTap={{ scale: 0.95, backgroundColor: "rgba(212, 175, 55, 0.1)", borderColor: "rgba(212, 175, 55, 0.5)" }}
              className="bg-gray-50/50 p-4 md:p-10 rounded-2xl md:rounded-[2rem] text-center border border-gray-100 hover:border-gold/30 shadow-lg hover:shadow-2xl hover:shadow-gold/10 transition-all duration-300 transform hover:-translate-y-2 md:hover:-translate-y-3 group cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="mx-auto w-12 h-12 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-3 md:mb-8 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <div className="scale-75 md:scale-100">{feat.icon}</div>
              </div>
              <h3 className="text-sm md:text-xl font-bold text-primary mb-2 md:mb-4">{feat.title}</h3>
              <p className="text-gray-600 text-[11px] md:text-sm leading-relaxed hidden md:block">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
