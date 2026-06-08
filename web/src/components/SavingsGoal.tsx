'use client';

import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Progress, Spinner, TextInput } from 'flowbite-react';
import { CircleDollarSign, RefreshCcw } from 'lucide-react';
import {
  contractConfigured,
  readSavingsState,
  buildContributeXDR,
  type SavingsState,
} from '@/lib/contract';
import { submitSignedXDR, pollTransaction } from '@/lib/payment';
import { CONTRACT_ID, NETWORK_PASSPHRASE } from '@/lib/stellar';

export default function SavingsGoal({ publicKey }: { publicKey: string | null }) {
  const configured = contractConfigured();
  const [state, setState] = useState<SavingsState | null>(null);
  const [loading, setLoading] = useState(configured);
  const [refreshToken, setRefreshToken] = useState(0);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const refresh = async () => {
    if (!configured) return;
    setLoading(true);
    setError('');
    setRefreshToken((token) => token + 1);
  };

  useEffect(() => {
    if (!configured) return;

    let active = true;

    const loadState = async () => {
      try {
        const nextState = await readSavingsState();
        if (!active) return;
        setState(nextState);
      } catch (e: unknown) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Failed to read contract');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadState();

    return () => {
      active = false;
    };
  }, [configured, refreshToken]);

  const contribute = async () => {
    if (!publicKey) return;
    setBusy(true);
    setMsg('');
    setError('');
    try {
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('Contribution amount must be greater than zero.');
      }

      const xdr = await buildContributeXDR(publicKey, value);
      const freighter = await import('@stellar/freighter-api');
      const signed = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });
      if (signed.error) {
        throw new Error(
          typeof signed.error === 'string' ? signed.error : 'Signing was rejected',
        );
      }
      const hash = await submitSignedXDR(signed.signedTxXdr);
      await pollTransaction(hash);
      setMsg('Contribution recorded on-chain.');
      setAmount('');
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Contribution failed');
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <Card className="rounded-lg border-dashed">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Soroban savings goal</h2>
            <p className="mt-1 text-sm text-gray-600">
              Deploy the existing Rust contract to enable on-chain reads and contributions.
            </p>
          </div>
          <Badge color="warning">Not configured</Badge>
        </div>
        <Alert color="warning">
          Set NEXT_PUBLIC_CONTRACT_ID in web/.env.local after deployment.
        </Alert>
        <div className="rounded-lg bg-gray-900 p-3 font-mono text-sm text-gray-100">
          .\scripts\deploy.ps1
        </div>
      </Card>
    );
  }

  const pct =
    state && state.target > 0
      ? Math.min(100, Math.round((state.saved / state.target) * 100))
      : 0;

  return (
    <Card className="rounded-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Soroban savings goal</h2>
          <p className="mt-1 break-all text-sm text-gray-600">Contract: {CONTRACT_ID}</p>
        </div>
        <Badge color="success">Configured</Badge>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Spinner size="sm" />
          <span className="text-sm text-gray-600">Reading contract state</span>
        </div>
      )}

      {!loading && state && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Saved</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{state.saved}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Target</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{state.target}</p>
            </div>
          </div>

          <div>
            <Progress progress={pct} color={pct >= 100 ? 'green' : 'blue'} size="lg" />
            <p className="mt-2 text-right text-sm font-medium text-gray-700">{pct}%</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <TextInput
              type="number"
              min="1"
              placeholder="Amount to contribute"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <Button onClick={contribute} disabled={busy || !publicKey || !amount}>
              <CircleDollarSign className="mr-2 h-4 w-4" />
              {busy ? 'Working' : 'Contribute'}
            </Button>
            <Button color="light" onClick={refresh} disabled={busy || loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {!publicKey && (
            <Alert color="info">
              Connect Freighter to sign a Soroban contribution transaction.
            </Alert>
          )}
        </div>
      )}

      {msg && <Alert color="success">{msg}</Alert>}
      {error && <Alert color="failure">{error}</Alert>}
    </Card>
  );
}
