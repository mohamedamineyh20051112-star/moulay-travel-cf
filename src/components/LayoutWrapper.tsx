'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { useCurrencyStore } from '@/store/useCurrencyStore';

export default function LayoutWrapper({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const pathname = usePathname();
  const fetchRate = useCurrencyStore((s) => s.fetchRate);
  const isAdmin = pathname.startsWith(`/${locale}/admin`) || pathname === '/admin';

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  return (
    <>
      {!isAdmin && <Header locale={locale} />}
      <main className="min-h-screen">{children}</main>
      {!isAdmin && (
        <>
          <Footer />
          <FloatingWhatsApp />
        </>
      )}
    </>
  );
}
