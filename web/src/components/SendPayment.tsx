'use client';

import { useState } from 'react';
import { Alert, Button, Card, Label, Select, TextInput } from 'flowbite-react';
import { Send } from 'lucide-react';
import {
  buildPaymentXDR,
  submitSignedXDR,
  pollTransaction,
  type AssetCode,
} from '@/lib/payment';
import { NETWORK_PASSPHRASE } from '@/lib/stellar';

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
  polling: 'Confirming on-chain',
  success: 'Send',
  error: 'Send',
};

export default function SendPayment({
  publicKey,
  onSent,
}: {
  publicKey: string;
  onSent: () => void;
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
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Payment failed');
      setStatus('error');
    }
  };

  return (
    <Card className="rounded-lg">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Send test payment</h2>
        <p className="mt-1 text-sm text-gray-600">
          Optional wallet utility from the starter scaffold.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="payment-asset">Asset</Label>
          <Select
            id="payment-asset"
            value={asset}
            onChange={(event) => setAsset(event.target.value as AssetCode)}
          >
            <option value="XLM">XLM</option>
            <option value="USDC">USDC (needs a trustline)</option>
          </Select>
        </div>

        <div>
          <Label htmlFor="payment-destination">Destination address</Label>
          <TextInput
            id="payment-destination"
            type="text"
            placeholder="G... funded testnet account"
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="payment-amount">Amount</Label>
          <TextInput
            id="payment-amount"
            type="number"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>

        <Button
          color="green"
          onClick={handleSend}
          disabled={busy || !destination || !amount}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {STATUS_LABEL[status]}
        </Button>
      </div>

      {status === 'success' && (
        <Alert color="success">
          Payment confirmed.{' '}
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            View on Stellar Expert
          </a>
        </Alert>
      )}

      {status === 'error' && <Alert color="failure">{errorMsg}</Alert>}
    </Card>
  );
}
