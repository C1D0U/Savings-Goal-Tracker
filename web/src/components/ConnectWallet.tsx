'use client';

import { useState } from 'react';
import { Alert, Button } from 'flowbite-react';
import { Clipboard, LogOut, Wallet } from 'lucide-react';
import type { WalletState } from '@/hooks/useWallet';

export default function ConnectWallet({
  publicKey,
  connecting,
  error,
  connect,
  disconnect,
}: WalletState) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (publicKey) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button color="light" size="sm" onClick={copy} title="Copy full address">
          <Clipboard className="mr-2 h-4 w-4" />
          <span className="font-mono">
            {copied ? 'Copied' : `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}`}
          </span>
        </Button>
        <Button color="failure" size="sm" onClick={disconnect} title="Disconnect wallet">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button color="blue" size="sm" onClick={connect} disabled={connecting}>
        <Wallet className="mr-2 h-4 w-4" />
        {connecting ? 'Connecting' : 'Connect Freighter'}
      </Button>
      {error && (
        <Alert color="failure" className="max-w-xs">
          {error}
        </Alert>
      )}
    </div>
  );
}
