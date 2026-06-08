'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchBalances, type Balances } from '@/lib/balances';

export default function BalanceCard({
  publicKey,
  refreshKey,
}: {
  publicKey: string;
  refreshKey: number;
}) {
  const requestKey = `${publicKey}:${refreshKey}`;
  const [result, setResult] = useState<{
    requestKey: string;
    balances: Balances | null;
    failed: boolean;
  }>({
    requestKey: '',
    balances: null,
    failed: false,
  });
  const loading = result.requestKey !== requestKey;

  useEffect(() => {
    let active = true;

    fetchBalances(publicKey)
      .then((balances) => {
        if (!active) return;
        setResult({ requestKey, balances, failed: false });
      })
      .catch(() => {
        if (!active) return;
        setResult({ requestKey, balances: null, failed: true });
      });

    return () => {
      active = false;
    };
  }, [publicKey, requestKey]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/55 p-4">
        <Loader2 className="h-4 w-4 animate-spin text-blue-300" />
        <span className="text-sm text-slate-300">Loading balances</span>
      </div>
    );
  }

  if (result.failed) {
    return (
      <p className="rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">
        Balance refresh failed. Please try again.
      </p>
    );
  }

  const balances = result.balances;

  if (balances && !balances.funded) {
    return (
      <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
        This account is not funded yet. Fund it before sending payments.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-slate-700 bg-slate-900/55 p-4">
        <p className="text-xs font-semibold uppercase text-slate-500">XLM</p>
        <p className="mt-2 text-2xl font-semibold text-slate-50">{balances?.xlm ?? '0.00'}</p>
      </div>
      <div className="rounded-xl border border-slate-700 bg-slate-900/55 p-4">
        <p className="text-xs font-semibold uppercase text-slate-500">USDC</p>
        <p className="mt-2 text-2xl font-semibold text-slate-50">{balances?.usdc ?? '0.00'}</p>
      </div>
    </div>
  );
}
