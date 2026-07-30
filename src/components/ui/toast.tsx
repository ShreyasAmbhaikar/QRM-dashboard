'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; description?: string }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, description }: { type?: ToastType; title: string; description?: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev.slice(-4), { id, type, title, description }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, description?: string) => addToast({ type: 'success', title, description }), [addToast]);
  const error = useCallback((title: string, description?: string) => addToast({ type: 'error', title, description }), [addToast]);
  const info = useCallback((title: string, description?: string) => addToast({ type: 'info', title, description }), [addToast]);
  const warning = useCallback((title: string, description?: string) => addToast({ type: 'warning', title, description }), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      {/* Fixed top-right toast viewport */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-5 fade-in',
              item.type === 'success' && 'bg-emerald-950/90 dark:bg-emerald-950/90 border-emerald-500/30 text-emerald-100',
              item.type === 'error' && 'bg-rose-950/90 dark:bg-rose-950/90 border-rose-500/30 text-rose-100',
              item.type === 'warning' && 'bg-amber-950/90 dark:bg-amber-950/90 border-amber-500/30 text-amber-100',
              item.type === 'info' && 'bg-zinc-900/90 dark:bg-zinc-900/90 border-zinc-700/50 text-zinc-100'
            )}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {item.type === 'error' && <XCircle className="h-4 w-4 text-rose-400" />}
              {item.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {item.type === 'info' && <Info className="h-4 w-4 text-sky-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold leading-tight">{item.title}</h4>
              {item.description && <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{item.description}</p>}
            </div>
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
