'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { buildAddUsdcTrustlineXDR } from '@/lib/trustline';
import { signAndSubmit } from '@/lib/sign';
import { friendlyError } from '@/lib/userFeedback';
import type { ToastTone } from '@/components/ToastStack';

type Status = 'idle' | 'working' | 'done' | 'error';

export default function AddTrustline({
  publicKey,
  onDone,
  onNotify,
}: {
  publicKey: string;
  onDone: () => void;
  onNotify?: (tone: ToastTone, title: string, detail?: string) => void;
}) {
  const [status, setStatus] = useState<Status>('idle');

  const add = async () => {
    if (!publicKey) return;
    setStatus('working');
    onNotify?.('loading', 'Transaction pending', 'Waiting for Freighter approval.');
    try {
      const xdr = await buildAddUsdcTrustlineXDR(publicKey);
      await signAndSubmit(xdr, publicKey);
      setStatus('done');
      onDone();
      onNotify?.('success', 'Trustline added', 'USDC is now available for this account.');
    } catch (e: unknown) {
      setStatus('error');
      onNotify?.('error', 'Trustline failed', friendlyError(e, 'Could not add the USDC trustline.'));
    }
  };

  return (
    <button
      type="button"
      onClick={add}
      disabled={status === 'working' || !publicKey}
      className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 ${
        status === 'done'
          ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100 focus:ring-emerald-300'
          : 'border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800 focus:ring-blue-400'
      }`}
    >
      <Link2 className="mr-2 h-4 w-4" />
      {status === 'working'
        ? 'Adding trustline'
        : status === 'done'
          ? 'USDC ready'
          : publicKey
            ? 'Add USDC trustline'
            : 'Connect wallet'}
    </button>
  );
}
