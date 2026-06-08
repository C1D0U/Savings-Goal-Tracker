'use client';

import { AlertCircle, CheckCircle2, Info, Loader2, X, AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

export type ToastTone = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastMessage {
  id: string;
  tone: ToastTone;
  title: string;
  detail?: string;
}

const toneStyles: Record<ToastTone, { icon: ReactNode; ring: string; text: string }> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-300" />,
    ring: 'border-emerald-400/30 bg-emerald-400/10',
    text: 'text-emerald-100',
  },
  error: {
    icon: <AlertCircle className="h-4 w-4 text-red-300" />,
    ring: 'border-red-400/30 bg-red-400/10',
    text: 'text-red-100',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-300" />,
    ring: 'border-amber-400/30 bg-amber-400/10',
    text: 'text-amber-100',
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-300" />,
    ring: 'border-blue-400/30 bg-blue-400/10',
    text: 'text-blue-100',
  },
  loading: {
    icon: <Loader2 className="h-4 w-4 animate-spin text-blue-300" />,
    ring: 'border-blue-400/30 bg-blue-400/10',
    text: 'text-blue-100',
  },
};

export default function ToastStack({
  messages,
  onDismiss,
}: {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3"
    >
      {messages.map((message) => {
        const tone = toneStyles[message.tone];

        return (
          <div
            key={message.id}
            className={`pointer-events-auto animate-toast-in rounded-lg border ${tone.ring} p-4 text-sm shadow-2xl shadow-black/30 backdrop-blur-xl`}
          >
            <div className="flex gap-3">
              <div className="mt-0.5">{tone.icon}</div>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${tone.text}`}>{message.title}</p>
                {message.detail && (
                  <p className="mt-1 leading-5 text-slate-300">{message.detail}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(message.id)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
