'use client';

import { useState } from 'react';
import { Clipboard, LogOut, Wallet } from 'lucide-react';
import type { ToastTone } from '@/components/ToastStack';
import type { WalletState } from '@/hooks/useWallet';
import { primaryButtonClassName } from '@/components/buttonStyles';

export default function ConnectWallet({
  publicKey,
  connecting,
  connect,
  disconnect,
  onNotify,
}: WalletState & {
  onNotify?: (tone: ToastTone, title: string, detail?: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    onNotify?.('success', 'Wallet address copied');
    setTimeout(() => setCopied(false), 1500);
  };

  if (publicKey) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={copy}
          title="Copy full address"
          className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Clipboard className="mr-2 h-4 w-4 text-slate-400" />
          <span className="font-mono">
            {copied ? 'Copied' : `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`}
          </span>
        </button>
        <button
          type="button"
          onClick={disconnect}
          className="inline-flex items-center rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100 hover:bg-red-400/15 focus:outline-none focus:ring-2 focus:ring-red-300"
          title="Disconnect wallet"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={connect}
      disabled={connecting}
      className={primaryButtonClassName()}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {connecting ? 'Connecting' : 'Connect Wallet'}
    </button>
  );
}
