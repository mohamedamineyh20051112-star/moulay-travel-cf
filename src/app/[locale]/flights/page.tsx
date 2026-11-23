import TransportHub from "@/components/TransportHub";
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'TransportForms' });
  
  return {
    title: `${t('title')} | Moulay Travel`,
    keywords: "Moulay Travel, وكالة سفر, Billets, TGV, Ferry",
  };
}

export default function FlightsPage({ params }: { params: { locale: string } }) {
  return <TransportHub locale={params.locale} />;
}
