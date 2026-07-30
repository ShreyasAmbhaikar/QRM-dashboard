import React from 'react';
import { ToastProvider } from '@/components/ui/toast';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="min-h-screen w-full bg-background text-foreground">
        {children}
      </div>
    </ToastProvider>
  );
}
