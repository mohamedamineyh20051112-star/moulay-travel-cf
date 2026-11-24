'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroAdminRemoved({ params }: { params: { locale: string } }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${params.locale}/admin`);
  }, [params.locale, router]);

  return null;
}
