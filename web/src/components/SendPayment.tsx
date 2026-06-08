'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import {
  buildPaymentXDR,
  submitSignedXDR,
  pollTransaction,
  type AssetCode,
} from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';
import { friendlyError } from '@/lib/userFeedback';
import type { ToastTone } from '@/components/ToastStack';
import { primaryButtonClassName } from '@/components/buttonStyles';

type Status =
  | 'idle'
  | 'building'
  | 'signing'
  | 'submitting'
  | 'polling'
  | 'success'
  | 'error';

const STATUS_LABEL: Record<Status, string> = {
  idle: 'Send',
  building: 'Building transaction',
  signing: 'Waiting for Freighter',
  submitting: 'Submitting',
  polling: 'Confirming',
  success: 'Send',
  error: 'Send',
};

export default function SendPayment({
  publicKey,
  onSent,
  onNotify,
}: {
  publicKey: string;
  onSent: () => void;
  onNotify?: (tone: ToastTone, title: string, detail?: string) => void;
}) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<AssetCode>('XLM');
  const [status, setStatus] = useState<Status>('idle');
  const [txHash, setTxHash] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const busy = ['building', 'signing', 'submitting', 'polling'].includes(status);

  const handleSend = async () => {
    setStatus('building');
    setErrorMsg('');
    setTxHash('');
    onNotify?.('loading', 'Transaction pending', 'Preparing payment for signature.');
    try {
      const xdr = await buildPaymentXDR(publicKey, destination.trim(), amount, asset);

      setStatus('signing');
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

      setStatus('submitting');
      const hash = await submitSignedXDR(signed.signedTxXdr);
      setTxHash(hash);

      setStatus('polling');
      await pollTransaction(hash);
      setStatus('success');
      onSent();
      onNotify?.('success', 'Transaction confirmed', 'Payment completed on Stellar testnet.');
    } catch (e: unknown) {
      const message = friendlyError(e, 'Payment could not be completed.');
      setErrorMsg(message);
      setStatus('error');
      onNotify?.('error', 'Payment failed', message);
    }
  };

  return (
    <section className="premium-card animate-card-in rounded-xl p-6">
      <div>
        <p className="text-sm font-medium text-blue-300">Payment Utility</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-50">Send test payment</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          A compact account tool for testnet wallet validation.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label htmlFor="payment-asset" className="mb-2 block text-sm font-medium text-slate-200">
            Asset
          </label>
          <select
            id="payment-asset"
            value={asset}
            onChange={(event) => setAsset(event.target.value as AssetCode)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
          >
            <option value="XLM">XLM</option>
            <option value="USDC">USDC</option>
          </select>
        </div>

        <div>
          <label htmlFor="payment-destination" className="mb-2 block text-sm font-medium text-slate-200">
            Destination address
          </label>
          <input
            id="payment-destination"
            type="text"
            placeholder="G... funded testnet account"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 font-mono text-sm text-slate-50 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
          />
        </div>

        <div>
          <label htmlFor="payment-amount" className="mb-2 block text-sm font-medium text-slate-200">
            Amount
          </label>
          <input
            id="payment-amount"
            type="number"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={busy || !destination || !amount}
          className={primaryButtonClassName('w-full')}
        >
          <Send className="mr-2 h-4 w-4" />
          {STATUS_LABEL[status]}
        </button>
      </div>

      {status === 'success' && (
        <p className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Payment confirmed.{' '}
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            View transaction
          </a>
        </p>
      )}

      {status === 'error' && (
        <p className="mt-4 rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">
          {errorMsg}
        </p>
      )}
    </section>
  );
}
