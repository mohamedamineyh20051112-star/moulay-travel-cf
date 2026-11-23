import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Simple layout wrapper for admin to ensure RTL and specific background
  return (
    <>
      <link rel="manifest" href="/admin-manifest.json" />
      <div dir="rtl" className="admin-layout-wrapper">
        {children}
      </div>
    </>
  );
}
