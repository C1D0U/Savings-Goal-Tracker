'use client';

import { useEffect, useState } from 'react';
import { Alert, Spinner } from 'flowbite-react';
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
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Spinner size="sm" />
        <span className="text-sm text-gray-600">Loading balances</span>
      </div>
    );
  }

  if (result.failed) {
    return <Alert color="failure">Failed to load balances.</Alert>;
  }

  const balances = result.balances;

  if (balances && !balances.funded) {
    return (
      <Alert color="warning">
        This account is not funded yet. Use Friendbot before sending payments.
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase text-gray-500">XLM</p>
        <p className="text-2xl font-bold text-gray-900">{balances?.xlm ?? '0.00'}</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase text-gray-500">USDC</p>
        <p className="text-2xl font-bold text-gray-900">{balances?.usdc ?? '0.00'}</p>
      </div>
    </div>
  );
}
