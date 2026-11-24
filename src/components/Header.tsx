"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, User as UserIcon } from "lucide-react";
import { useCurrencyStore } from "@/store/useCurrencyStore";
import { usePathname, useRouter } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const AUTH_LABELS = {
  ar: {
    login: "تسجيل الدخول",
    admin: "لوحة الإدارة",
    marketer: "حساب المروج",
    profile: "حسابي",
    back: "رجوع",
  },
  fr: {
    login: "Connexion",
    admin: "Administration",
    marketer: "Espace Marketeur",
    profile: "Mon Compte",
    back: "Retour",
  },
  en: {
    login: "Sign In",
    admin: "Admin Panel",
    marketer: "Marketer Hub",
    profile: "My Account",
    back: "Go Back",
  },
} as const;

export default function Header({ locale }: { locale: string }) {
  const tNav = useTranslations("Navigation");
  const tCommon = useTranslations("Common");
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { currency, setCurrency } = useCurrencyStore();
  const pathname = usePathname() || "";
  const router = useRouter();

  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const { user, userData } = useAuth();
  const authText =
    AUTH_LABELS[(locale as keyof typeof AUTH_LABELS) || "ar"] || AUTH_LABELS.ar;

  useEffect(() => {
    setIsClient(true);
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "siteSettings", "global");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().logoUrl) {
          setLogoUrl(docSnap.data().logoUrl);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const cleanPath = pathname.replace(new RegExp("^\\/" + locale), "").replace(/^\//, "");
  const isHomePage = cleanPath.length === 0;

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!isHomePage) {
      setHidden(false);
      return;
    }
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const userDashboardHref =
    userData?.role === "super_admin"
      ? `/${locale}/admin`
      : userData?.role === "marketer"
        ? `/${locale}/marketer`
        : `/${locale}/profile`;

  const userDashboardLabel =
    userData?.role === "super_admin"
      ? authText.admin
      : userData?.role === "marketer"
        ? authText.marketer
        : authText.profile;

  const getLocaleSwitchHref = (targetLocale: string) =>
    cleanPath ? `/${targetLocale}/${cleanPath}` : `/${targetLocale}`;

  if (!isHomePage) {
    const isRtl = locale === "ar";
    const isAdmin = pathname.includes("/admin");

    if (isAdmin) return null;

    return (
      <div className={`fixed top-4 z-50 ${isRtl ? "left-4" : "right-4"}`}>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push(`/${locale}`);
            }
          }}
          className="bg-black/50 backdrop-blur-md p-3 rounded-full border border-white/20 text-white hover:bg-gold hover:text-black transition-colors shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex items-center justify-center"
          title={authText.back}
          aria-label={authText.back}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={isRtl ? "transform rotate-180" : ""}
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
      <motion.header
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] text-white"
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo -> Home */}
            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/80 shadow-[0_0_15px_rgba(255,255,255,0.3)] transform group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={logoUrl || "/logo.jpg"}
                  alt="Moulay Travel Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="hidden sm:flex flex-col text-white">
                <span className="font-bold text-xl leading-tight tracking-wide drop-shadow-md">
                  {tCommon("agency_name")}
                </span>
                <span className="text-[11px] text-gold font-medium tracking-wide">
                  {tCommon("slogan")}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2 text-sm font-semibold tracking-wide">
            <Link
              href={`/${locale}/top-destinations`}
              className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-gold transition-colors drop-shadow"
            >
              {tNav("top_destinations")}
            </Link>
            <Link
              href={`/${locale}/hotels`}
              className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-gold transition-colors drop-shadow"
            >
              {tNav("hotels")}
            </Link>
            <Link
              href={`/${locale}/flights`}
              className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-gold transition-colors drop-shadow"
            >
              {tNav("flights")}
            </Link>
            <Link
              href={`/${locale}/umrah`}
              className="px-4 py-1.5 rounded-full hover:bg-white/10 hover:text-gold transition-colors drop-shadow"
            >
              {tNav("umrah")}
            </Link>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {isClient && (
              <>
                {user ? (
                  <Link
                    href={userDashboardHref}
                    className="flex items-center gap-2 bg-gold/90 text-primary-dark font-bold px-4 py-1.5 rounded-full hover:bg-gold transition-colors shadow-md"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{userDashboardLabel}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthOpen(true)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium px-4 py-1.5 rounded-full transition-colors shadow-md backdrop-blur-sm"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{authText.login}</span>
                  </button>
                )}
              </>
            )}

            {/* Currency Switcher */}
            {isClient && (
              <div className="flex items-center bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                <button
                  type="button"
                  onClick={() => setCurrency("DZD")}
                  className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${
                    currency === "DZD" ? "bg-gold text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  {locale === "ar" ? "دج" : "DA"}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("EUR")}
                  className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${
                    currency === "EUR" ? "bg-gold text-white" : "text-white/70 hover:text-white"
                  }`}
                >
                  EUR
                </button>
              </div>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.2)]">
              <a
                href={getLocaleSwitchHref("ar")}
                onClick={() => {
                  document.cookie = "NEXT_LOCALE=ar; path=/; max-age=31536000; SameSite=Lax";
                }}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${
                  locale === "ar" ? "bg-gold text-white" : "text-white/70 hover:text-white"
                }`}
              >
                AR
              </a>
              <a
                href={getLocaleSwitchHref("fr")}
                onClick={() => {
                  document.cookie = "NEXT_LOCALE=fr; path=/; max-age=31536000; SameSite=Lax";
                }}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${
                  locale === "fr" ? "bg-gold text-white" : "text-white/70 hover:text-white"
                }`}
              >
                FR
              </a>
              <a
                href={getLocaleSwitchHref("en")}
                onClick={() => {
                  document.cookie = "NEXT_LOCALE=en; path=/; max-age=31536000; SameSite=Lax";
                }}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${
                  locale === "en" ? "bg-gold text-white" : "text-white/70 hover:text-white"
                }`}
              >
                EN
              </a>
            </div>

            {/* Mobile Toggle */}
            <button
              type="button"
              aria-label="Toggle Menu"
              className="lg:hidden bg-white/10 p-2 rounded-full border border-white/20 text-white hover:text-gold transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown — all routes verified against dedicated pages */}
        {isOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 flex flex-col items-center py-8 gap-4 text-lg font-bold shadow-2xl animate-in slide-in-from-top-2 duration-300 max-h-[80vh] overflow-y-auto">
            {!user && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAuthOpen(true);
                }}
                className="mx-6 mb-4 flex w-3/4 items-center justify-center gap-2 bg-gold text-primary-dark py-3 rounded-xl transition-colors shadow-md"
              >
                <UserIcon className="w-5 h-5" /> {authText.login}
              </button>
            )}
            {user && (
              <Link
                href={userDashboardHref}
                className="mx-6 mb-4 w-3/4 flex items-center justify-center gap-2 bg-gold/20 text-gold border border-gold py-3 rounded-xl transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <UserIcon className="w-5 h-5" /> {userDashboardLabel}
              </Link>
            )}

            <Link
              href={`/${locale}/top-destinations`}
              className="text-gold border border-gold/30 bg-gold/10 rounded-xl w-3/4 text-center py-3 mb-2"
              onClick={() => setIsOpen(false)}
            >
              {tNav("top_destinations")}
            </Link>
            <Link href={`/${locale}/hotels`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("hotels")}
            </Link>
            <Link href={`/${locale}/flights`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("flights")}
            </Link>
            <Link href={`/${locale}/umrah`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("umrah")}
            </Link>
            <Link href={`/${locale}/organized_trips`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("organized_trips")}
            </Link>
            <Link href={`/${locale}/vip_trips`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("vip")}
            </Link>
            <Link href={`/${locale}/visas`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("visas")}
            </Link>
            <Link href={`/${locale}/discounts`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("promotions")}
            </Link>
            <Link href={`/${locale}/custom_trips`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("custom_trips")}
            </Link>
            <Link href={`/${locale}/cars`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("car_rental")}
            </Link>
            <Link href={`/${locale}/insurance`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("insurance")}
            </Link>
            <Link href={`/${locale}/payment`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("payment")}
            </Link>
            <Link href={`/${locale}/hammams`} className="hover:text-gold transition-colors w-full text-center py-2" onClick={() => setIsOpen(false)}>
              {tNav("wellness")}
            </Link>
          </div>
        )}
      </motion.header>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
