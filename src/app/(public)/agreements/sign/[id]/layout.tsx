import React from 'react';
import { ToastProvider } from '@/components/ui/toast';

export default function PublicSigningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#09090b] text-[#f8fafc] flex flex-col items-center justify-start py-8 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-4xl space-y-6">
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
