'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HammamsLegacyRedirect({ params }: { params: { locale: string } }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}/admin/hammams-list`);
  }, [params.locale, router]);
  return null;
}
