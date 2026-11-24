import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import SplashScreen from "@/components/SplashScreen";
import { AuthProvider } from "@/contexts/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export const runtime = "edge";

export const viewport = {
  themeColor: "#1e3a8a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Common" });
  const siteName = t("agency_name");
  const description = t("agency_name") + " - " + t("subtitle");
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://moulay-travel.pages.dev").replace(/\/$/, "");

  return {
    title: `${siteName} - ${t("slogan")}`,
    description,
    keywords:
      "عمرة بالتقسيط بدون فوائد, بدون تعامل مع البنك, Moulay Travel, وكالة سفر, وكالة سياحية, رحلات منظمة, حجز فنادق, تذاكر طيران",
    openGraph: {
      title: siteName,
      description,
      url: siteUrl,
      siteName,
      images: [
        {
          url: `${siteUrl}/logo.jpg`,
          width: 800,
          height: 600,
          alt: siteName,
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [`${siteUrl}/logo.jpg`],
    },
    icons: {
      icon: "/logo.jpg",
      apple: "/logo.jpg",
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages({ locale });
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="overflow-x-hidden">
      <body
        className={`${inter.variable} ${cairo.variable} font-sans bg-gray-50 text-primary-light overflow-x-hidden w-full max-w-[100vw] m-0 p-0`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <SplashScreen />
            <LayoutWrapper locale={locale}>{children}</LayoutWrapper>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
