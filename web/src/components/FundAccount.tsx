'use client';

import { useState } from 'react';
import { Coins } from 'lucide-react';
import { fundTestnetAccount } from '@/lib/stellar';
import { friendlyError } from '@/lib/userFeedback';
import type { ToastTone } from '@/components/ToastStack';

export default function FundAccount({
  publicKey,
  onFunded,
  onNotify,
  }: {
  publicKey: string;
  onFunded: () => void;
  onNotify?: (tone: ToastTone, title: string, detail?: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const fund = async () => {
    if (!publicKey) return;
    setLoading(true);
    onNotify?.('loading', 'Funding account', 'Requesting testnet XLM from Friendbot.');
    try {
      await fundTestnetAccount(publicKey);
      onFunded();
      onNotify?.('success', 'Account funded', 'Your testnet balance will refresh shortly.');
    } catch (e: unknown) {
      onNotify?.('error', 'Funding failed', friendlyError(e, 'Friendbot could not fund this account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={fund}
      disabled={loading || !publicKey}
      className="inline-flex w-full items-center justify-center rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-sm font-medium text-amber-100 hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <Coins className="mr-2 h-4 w-4" />
      {loading ? 'Funding' : publicKey ? 'Fund account' : 'Connect wallet'}
    </button>
  );
}
