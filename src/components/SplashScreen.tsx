"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    let delay = 700;
    try {
      if (typeof window !== "undefined") {
        if (window.sessionStorage.getItem("mt_splash_shown") === "1") {
          delay = 120;
        } else {
          window.sessionStorage.setItem("mt_splash_shown", "1");
        }
      }
    } catch {
      // Ignore storage errors
    }

    const timer = setTimeout(() => {
      setShow(false);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          style={{ animation: "mtSplashAutoHide 0.4s ease-out 1.2s forwards" }}
          className="fixed top-0 left-0 w-screen h-[100dvh] z-[100] flex flex-col items-center justify-center bg-white m-0 p-0 overflow-hidden"
        >
          <style>{`@keyframes mtSplashAutoHide { to { opacity: 0; visibility: hidden; pointer-events: none; } }`}</style>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gold shadow-2xl mb-6">
              <Image
                src="/logo.jpg"
                alt="Moulay Travel"
                fill
                className="object-cover"
                priority
              />
            </div>
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="text-primary font-bold text-2xl tracking-widest uppercase"
            >
              Moulay Travel
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
