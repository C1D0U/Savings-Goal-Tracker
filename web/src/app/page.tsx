'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  CheckCircle2,
  CircleDollarSign,
  Goal,
  LockKeyhole,
  RefreshCcw,
  Settings2,
  Target,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import AddTrustline from '@/components/AddTrustline';
import BalanceCard from '@/components/BalanceCard';
import SendPayment from '@/components/SendPayment';
import SavingsGoal from '@/components/SavingsGoal';
import GoalPlanner, {
  goalProgress,
  remainingAmount,
  type SavingsGoalItem,
} from '@/components/GoalPlanner';
import ToastStack, { type ToastMessage, type ToastTone } from '@/components/ToastStack';
import { CONTRACT_ID, NETWORK_PASSPHRASE, RPC_URL } from '@/lib/stellar';
import { friendlyError } from '@/lib/userFeedback';
import type { ReactNode } from 'react';

const money = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function StatCard({
  label,
  value,
  detail,
  icon,
  delay,
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  delay: number;
}) {
  return (
    <div
      className="premium-card premium-card-hover animate-card-in rounded-xl p-5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-normal text-slate-50">
            {value}
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-2 text-blue-300">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm leading-5 text-slate-400">{detail}</p>
    </div>
  );
}

export default function Home() {
  const wallet = useWallet();
  const { publicKey, connecting, error: walletError } = wallet;
  const [refreshKey, setRefreshKey] = useState(0);
  const [goals, setGoals] = useState<SavingsGoalItem[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const previousPublicKey = useRef<string | null>(null);
  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  const notify = useCallback((tone: ToastTone, title: string, detail?: string) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current.slice(-3), { id, tone, title, detail }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((message) => message.id !== id));
    }, tone === 'loading' ? 3200 : 4600);
  }, []);

  useEffect(() => {
    if (!previousPublicKey.current && publicKey) {
      notify('success', 'Wallet connected', shortAddress(publicKey));
    }

    if (previousPublicKey.current && !publicKey) {
      notify('info', 'Wallet disconnected', 'Freighter access was cleared for this session.');
    }

    previousPublicKey.current = publicKey;
  }, [notify, publicKey]);

  useEffect(() => {
    if (walletError) {
      const timer = window.setTimeout(() => {
        notify('error', 'Wallet connection failed', friendlyError(walletError, 'Unable to connect Freighter.'));
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [notify, walletError]);

  const stats = useMemo(() => {
    const totalSaved = goals.reduce((sum, goal) => sum + goal.saved, 0);
    const totalTarget = goals.reduce((sum, goal) => sum + goal.target, 0);
    const completion = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return { totalSaved, totalTarget, completion };
  }, [goals]);

  const selectedGoal = useMemo(
    () => goals.find((goal) => goal.id === selectedGoalId) ?? goals[0] ?? null,
    [goals, selectedGoalId],
  );

  const addGoal = (goal: SavingsGoalItem) => {
    setGoals((current) => [goal, ...current]);
    setSelectedGoalId(goal.id);
  };

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((message) => message.id !== id));
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B1220] text-slate-50">
      <ToastStack messages={toasts} onDismiss={dismissToast} />

      <nav className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B1220]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-500/15 text-blue-200">
              <Goal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-50">StellarX</p>
              <p className="text-xs text-slate-400">Savings Goal Tracker</p>
            </div>
          </a>

          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-300 sm:flex">
              {publicKey ? 'Wallet connected' : connecting ? 'Connecting wallet' : 'Wallet disconnected'}
            </div>
            <ConnectWallet {...wallet} onNotify={notify} />
          </div>
        </div>
      </nav>

      <div className="animate-page-in mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-300">
              <LockKeyhole className="h-4 w-4 text-emerald-300" />
              Private planning, Stellar-ready when you are
            </div>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-slate-50 sm:text-5xl">
              Track your savings goals with confidence.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Create goals, monitor progress, and stay on track toward your financial targets.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#create-goal"
                className="inline-flex items-center rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-950/30 hover:bg-blue-400 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Create Goal
              </a>
              <a
                href="#goals"
                className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                View Goals
              </a>
            </div>
          </div>

          <section className="premium-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <WalletCards className="h-5 w-5 text-blue-300" />
              <div>
                <h2 className="font-semibold text-slate-50">Wallet</h2>
                <p className="text-sm text-slate-400">Stellar testnet</p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Status</dt>
                <dd className={publicKey ? 'text-emerald-300' : 'text-slate-300'}>
                  {publicKey ? 'Connected' : connecting ? 'Connecting' : 'Not connected'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Address</dt>
                <dd className="truncate font-mono text-slate-200">
                  {publicKey ? shortAddress(publicKey) : 'Not available'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-400">Network</dt>
                <dd className="text-blue-300">Testnet</dd>
              </div>
            </dl>
          </section>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Saved"
            value={money.format(stats.totalSaved)}
            detail="Current savings across active goals"
            icon={<CircleDollarSign className="h-5 w-5" />}
            delay={40}
          />
          <StatCard
            label="Goal Target"
            value={money.format(stats.totalTarget)}
            detail="Combined target amount"
            icon={<Target className="h-5 w-5" />}
            delay={90}
          />
          <StatCard
            label="Active Goals"
            value={String(goals.length)}
            detail={goals.length === 1 ? 'One goal in progress' : 'Goals currently tracked'}
            icon={<CheckCircle2 className="h-5 w-5" />}
            delay={140}
          />
          <StatCard
            label="Completion Rate"
            value={`${stats.completion}%`}
            detail="Weighted by saved amount"
            icon={<TrendingUp className="h-5 w-5" />}
            delay={190}
          />
        </section>

        <section
          id="goals"
          className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]"
        >
          <GoalPlanner
            goals={goals}
            selectedGoalId={selectedGoal?.id ?? null}
            onSelect={setSelectedGoalId}
            onCreate={addGoal}
            onNotify={notify}
          />

          <aside className="space-y-6">
            <section className="premium-card animate-card-in rounded-xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-blue-300">Goal Details</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-50">
                    {selectedGoal ? selectedGoal.title : 'Select a goal'}
                  </h2>
                </div>
                {selectedGoal && (
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                    {goalProgress(selectedGoal)}%
                  </span>
                )}
              </div>

              {!selectedGoal && (
                <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-900/55 p-8 text-center">
                  <ArrowDownRight className="mx-auto h-8 w-8 text-slate-500" />
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Create or select a savings goal to review details and next steps.
                  </p>
                </div>
              )}

              {selectedGoal && (
                <div className="mt-6 space-y-5">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                      <p className="text-sm text-slate-400">Current Saved</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-50">
                        {money.format(selectedGoal.saved)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                      <p className="text-sm text-slate-400">Target Amount</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-50">
                        {money.format(selectedGoal.target)}
                      </p>
                    </div>
                  </div>

                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">Remaining Amount</dt>
                      <dd className="font-medium text-slate-100">
                        {money.format(remainingAmount(selectedGoal))}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">Target Date</dt>
                      <dd className="font-medium text-slate-100">
                        {selectedGoal.deadline || 'No target date'}
                      </dd>
                    </div>
                  </dl>

                  <div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-700 ease-out"
                        style={{ width: `${goalProgress(selectedGoal)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-right text-sm text-slate-300">
                      {goalProgress(selectedGoal)}% complete
                    </p>
                  </div>

                  <a
                    href="#onchain-savings"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-emerald-950/20 hover:bg-emerald-400 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  >
                    Add Savings
                  </a>
                </div>
              )}
            </section>

            <section className="premium-card animate-card-in rounded-xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-300">Wallet Tools</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-50">Account actions</h2>
                </div>
                <button
                  type="button"
                  onClick={refresh}
                  className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Refresh balances"
                >
                  <RefreshCcw className="h-4 w-4" />
                </button>
              </div>

              {!publicKey && (
                <p className="mt-5 rounded-xl border border-slate-700 bg-slate-900/55 p-4 text-sm leading-6 text-slate-300">
                  Connect your wallet to see balances, fund testnet XLM, and manage
                  payment utilities.
                </p>
              )}

              {publicKey && (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <FundAccount publicKey={publicKey} onFunded={refresh} onNotify={notify} />
                    <AddTrustline publicKey={publicKey} onDone={refresh} onNotify={notify} />
                  </div>
                  <BalanceCard publicKey={publicKey} refreshKey={refreshKey} />
                </div>
              )}
            </section>

            <details className="premium-card rounded-xl p-5">
              <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <Settings2 className="h-4 w-4 text-slate-500" />
                Developer Panel
              </summary>
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">RPC</dt>
                  <dd className="mt-1 break-all font-mono text-slate-300">{RPC_URL}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Contract ID</dt>
                  <dd className="mt-1 break-all font-mono text-slate-300">
                    {CONTRACT_ID || 'NEXT_PUBLIC_CONTRACT_ID not set'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Network Passphrase</dt>
                  <dd className="mt-1 break-all font-mono text-slate-300">
                    {NETWORK_PASSPHRASE}
                  </dd>
                </div>
              </dl>
            </details>
          </aside>
        </section>

        <section id="onchain-savings" className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
          <SavingsGoal publicKey={publicKey} onNotify={notify} />
          {publicKey && <SendPayment publicKey={publicKey} onSent={refresh} onNotify={notify} />}
        </section>
      </div>
    </main>
  );
}
