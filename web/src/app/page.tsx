'use client';

import { useCallback, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Navbar, NavbarBrand } from 'flowbite-react';
import { RefreshCcw, ShieldCheck, Target, WalletCards } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import AddTrustline from '@/components/AddTrustline';
import BalanceCard from '@/components/BalanceCard';
import SendPayment from '@/components/SendPayment';
import SavingsGoal from '@/components/SavingsGoal';
import GoalPlanner, { type SavingsGoalItem } from '@/components/GoalPlanner';
import { CONTRACT_ID, RPC_URL } from '@/lib/stellar';

const money = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting } = wallet;
  const [refreshKey, setRefreshKey] = useState(0);
  const [goals, setGoals] = useState<SavingsGoalItem[]>([]);
  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  const stats = useMemo(() => {
    const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
    const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
    const progress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return [
      {
        label: 'Saved',
        value: money.format(totalSaved),
        detail: totalTarget ? `${progress}% of planned goals` : 'Add a goal to start',
      },
      {
        label: 'Target',
        value: money.format(totalTarget),
        detail: `${goals.length} active goal${goals.length === 1 ? '' : 's'}`,
      },
      {
        label: 'Wallet',
        value: publicKey ? 'Connected' : connecting ? 'Connecting' : 'Not connected',
        detail: publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-6)}` : 'Freighter testnet',
      },
    ];
  }, [connecting, goals, publicKey]);

  const addGoal = (goal: SavingsGoalItem) => {
    setGoals((current) => [goal, ...current]);
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar fluid rounded={false} className="border-b border-gray-200 bg-white">
        <NavbarBrand href="/">
          <span className="self-center whitespace-nowrap text-xl font-semibold">
            Savings Goal Tracker
          </span>
        </NavbarBrand>
        <div className="flex items-center gap-3">
          <Badge color={CONTRACT_ID ? 'success' : 'warning'}>
            {CONTRACT_ID ? 'Soroban ready' : 'Contract pending'}
          </Badge>
          <ConnectWallet {...wallet} />
        </div>
      </Navbar>

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <Badge color="blue" className="mb-3 w-fit">
              Stellar testnet foundation
            </Badge>
            <h1 className="max-w-3xl text-3xl font-bold tracking-normal text-gray-900 sm:text-4xl">
              Plan goals, connect a wallet, and keep the Soroban path ready.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-gray-600">
              A clean MVP dashboard for savings goals, with local planning today and
              the existing contract integration isolated for the next on-chain phase.
            </p>
          </div>

          <Card className="rounded-lg">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-green-600" />
              <div>
                <h2 className="font-semibold text-gray-900">Deployment config</h2>
                <p className="mt-1 break-all text-sm text-gray-600">
                  RPC: {RPC_URL}
                </p>
                <p className="mt-1 break-all text-sm text-gray-600">
                  Contract: {CONTRACT_ID || 'NEXT_PUBLIC_CONTRACT_ID not set'}
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label} className="rounded-lg">
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="mt-1 break-all text-sm text-gray-600">{item.detail}</p>
            </Card>
          ))}
        </section>

        {!publicKey && !connecting && (
          <Alert color="info" className="mb-8">
            Connect Freighter to fund a testnet account and try wallet actions. You
            can still create local savings goals without connecting.
          </Alert>
        )}

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-8">
            <GoalPlanner goals={goals} onCreate={addGoal} />
            <SavingsGoal publicKey={publicKey} />
          </div>

          <aside className="space-y-6">
            <Card className="rounded-lg">
              <div className="flex items-center gap-3">
                <WalletCards className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="font-semibold text-gray-900">Wallet workspace</h2>
                  <p className="text-sm text-gray-600">Freighter on Stellar testnet</p>
                </div>
              </div>

              {!publicKey && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <Target className="mx-auto h-9 w-9 text-gray-400" />
                  <p className="mt-3 font-medium text-gray-900">Wallet not connected</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Use the navbar button to connect Freighter.
                  </p>
                </div>
              )}

              {publicKey && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <FundAccount publicKey={publicKey} onFunded={refresh} />
                    <AddTrustline publicKey={publicKey} onDone={refresh} />
                  </div>
                  <BalanceCard publicKey={publicKey} refreshKey={refreshKey} />
                  <Button color="light" size="sm" onClick={refresh}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Refresh balances
                  </Button>
                </div>
              )}
            </Card>

            {publicKey && <SendPayment publicKey={publicKey} onSent={refresh} />}
          </aside>
        </section>
      </div>
    </main>
  );
}
