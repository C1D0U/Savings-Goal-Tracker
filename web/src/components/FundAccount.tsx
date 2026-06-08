'use client';

import { useState } from 'react';
import { Alert, Button } from 'flowbite-react';
import { Coins } from 'lucide-react';
import { fundTestnetAccount } from '@/lib/stellar';

export default function FundAccount({
  publicKey,
  onFunded,
}: {
  publicKey: string;
  onFunded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fund = async () => {
    setLoading(true);
    setError('');
    try {
      await fundTestnetAccount(publicKey);
      onFunded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Funding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button color="warning" size="sm" onClick={fund} disabled={loading}>
        <Coins className="mr-2 h-4 w-4" />
        {loading ? 'Funding' : 'Fund with Friendbot'}
      </Button>
      {error && <Alert color="failure">{error}</Alert>}
    </div>
  );
}
