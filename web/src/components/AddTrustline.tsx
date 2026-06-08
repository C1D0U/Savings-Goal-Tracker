'use client';

import { useState } from 'react';
import { Alert, Button } from 'flowbite-react';
import { Link2 } from 'lucide-react';
import { buildAddUsdcTrustlineXDR } from '@/lib/trustline';
import { signAndSubmit } from '@/lib/sign';

type Status = 'idle' | 'working' | 'done' | 'error';

export default function AddTrustline({
  publicKey,
  onDone,
}: {
  publicKey: string;
  onDone: () => void;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const add = async () => {
    setStatus('working');
    setError('');
    try {
      const xdr = await buildAddUsdcTrustlineXDR(publicKey);
      await signAndSubmit(xdr, publicKey);
      setStatus('done');
      onDone();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add trustline');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-2">
      <Button
        color={status === 'done' ? 'success' : 'light'}
        size="sm"
        onClick={add}
        disabled={status === 'working'}
      >
        <Link2 className="mr-2 h-4 w-4" />
        {status === 'working'
          ? 'Adding trustline'
          : status === 'done'
            ? 'USDC trustline added'
            : 'Add USDC trustline'}
      </Button>
      {status === 'error' && error && <Alert color="failure">{error}</Alert>}
    </div>
  );
}
