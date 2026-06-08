'use client';

import { useEffect, useState } from 'react';
import { CircleDollarSign, Loader2, RefreshCcw } from 'lucide-react';
import {
  contractConfigured,
  readSavingsState,
  buildContributeXDR,
  type SavingsState,
} from '@/lib/contract';
import { submitSignedXDR, pollTransaction } from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';
import { friendlyError } from '@/lib/userFeedback';
import type { ToastTone } from '@/components/ToastStack';

export default function SavingsGoal({
  publicKey,
  onNotify,
}: {
  publicKey: string | null;
  onNotify?: (tone: ToastTone, title: string, detail?: string) => void;
}) {
  const configured = contractConfigured();
  const [state, setState] = useState<SavingsState | null>(null);
  const [loading, setLoading] = useState(configured);
  const [refreshToken, setRefreshToken] = useState(0);
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [inlineStatus, setInlineStatus] = useState('');

  const refresh = async () => {
    if (!configured) return;
    setLoading(true);
    setInlineStatus('');
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
        const message = friendlyError(e, 'Contract state could not be loaded.');
        setInlineStatus(message);
        onNotify?.('error', 'Network error', message);
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
  }, [configured, onNotify, refreshToken]);

  const contribute = async () => {
    if (!publicKey) return;
    setBusy(true);
    setInlineStatus('Preparing transaction');
    onNotify?.('loading', 'Transaction pending', 'Preparing your savings contribution.');
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
      setInlineStatus('Contribution confirmed');
      onNotify?.('success', 'Transaction confirmed', 'Savings contribution recorded on-chain.');
      setAmount('');
      await refresh();
    } catch (e: unknown) {
      const message = friendlyError(e, 'Contribution could not be completed.');
      setInlineStatus(message);
      onNotify?.('error', 'Transaction failed', message);
    } finally {
      setBusy(false);
    }
  };

  if (!configured) {
    return (
      <section className="premium-card animate-card-in rounded-xl border-dashed p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-blue-300">On-chain Savings</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-50">
              On-chain savings pending setup
            </h2>
          </div>
          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-sm text-amber-100">
            Setup needed
          </span>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          On-chain savings will be enabled after a Soroban contract ID is configured.
        </p>
      </section>
    );
  }

  const pct =
    state && state.target > 0
      ? Math.min(100, Math.round((state.saved / state.target) * 100))
      : 0;

  return (
    <section className="premium-card animate-card-in rounded-xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-300">On-chain Savings</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-50">Savings contract</h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Live contract contribution tracking for the selected wallet.
          </p>
        </div>
        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-100">
          Live
        </span>
      </div>

      {loading && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/55 p-4">
          <Loader2 className="h-4 w-4 animate-spin text-blue-300" />
          <span className="text-sm text-slate-300">Reading contract state</span>
        </div>
      )}

      {!loading && state && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-900/55 p-4">
              <p className="text-sm text-slate-400">Saved</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{state.saved}</p>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/55 p-4">
              <p className="text-sm text-slate-400">Target</p>
              <p className="mt-2 text-2xl font-semibold text-slate-50">{state.target}</p>
            </div>
          </div>

          <div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-right text-sm text-slate-300">{pct}% complete</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              type="number"
              min="1"
              placeholder="Amount to contribute"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
            />
            <button
              type="button"
              onClick={contribute}
              disabled={busy || !publicKey || !amount}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <CircleDollarSign className="mr-2 h-4 w-4" />
              {busy ? 'Working' : 'Contribute'}
            </button>
            <button
              type="button"
              onClick={refresh}
              disabled={busy || loading}
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>

          {!publicKey && (
            <p className="rounded-xl border border-blue-400/25 bg-blue-400/10 p-4 text-sm text-blue-100">
              Connect your wallet to sign a savings contribution.
            </p>
          )}
        </div>
      )}

      {inlineStatus && !loading && (
        <p className="mt-4 text-sm text-slate-400">{inlineStatus}</p>
      )}
    </section>
  );
}
