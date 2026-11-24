'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VIPDestinationsRedirect({ params }: { params: { locale: string } }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${params.locale}/admin/services-destinations`);
  }, [params.locale, router]);
  return null;
}
