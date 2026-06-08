'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDownRight,
  CheckCircle2,
  CircleDollarSign,
  Goal,
  LockKeyhole,
  Target,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { Button } from 'flowbite-react';
import { useWallet } from '@/hooks/useWallet';
import { useSavingsDashboard } from '@/hooks/useSavingsDashboard';
import ConnectWallet from '@/components/ConnectWallet';
import FundAccount from '@/components/FundAccount';
import AddTrustline from '@/components/AddTrustline';
import BalanceCard from '@/components/BalanceCard';
import SavingsGoal from '@/components/SavingsGoal';
import GoalPlanner from '@/components/GoalPlanner';
import AddSavingsModal from '@/components/AddSavingsModal';
import PaymentUtilityModal from '@/components/PaymentUtilityModal';
import TransactionHistory from '@/components/TransactionHistory';
import ToastStack, { type ToastMessage, type ToastTone } from '@/components/ToastStack';
import { friendlyError } from '@/lib/userFeedback';
import { remainingAmount } from '@/lib/savingsDashboard';
import { primaryButtonClassName } from '@/components/buttonStyles';

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
  const { goals, selectedGoal, selectedGoalId, transactions, addGoal, addSavings, selectGoal } =
    useSavingsDashboard();
  const [refreshKey, setRefreshKey] = useState(0);
  const [addSavingsOpen, setAddSavingsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
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
        notify(
          'error',
          'Wallet connection failed',
          friendlyError(walletError, 'Unable to connect Freighter.'),
        );
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

  const selectedGoalRemaining = selectedGoal ? remainingAmount(selectedGoal) : 0;

  const handleAddSavings = useCallback(
    (amount: number, note: string) => {
      if (!selectedGoal) {
        notify('warning', 'Select a goal', 'Choose a savings goal before adding funds.');
        return;
      }

      if (!Number.isFinite(amount) || amount <= 0) {
        notify('warning', 'Validation error', 'Amount must be greater than zero.');
        return;
      }

      const remaining = remainingAmount(selectedGoal);
      if (amount > remaining) {
        notify(
          'warning',
          'Amount too large',
          `You can only add up to ${money.format(remaining)} for this goal.`,
        );
        return;
      }

      addSavings(selectedGoal.id, amount, note);
      notify(
        'success',
        'Savings added',
        `${money.format(amount)} recorded for ${selectedGoal.title}.`,
      );
      setAddSavingsOpen(false);
    },
    [addSavings, notify, selectedGoal],
  );

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B1220] text-slate-50">
      <ToastStack messages={toasts} onDismiss={(id) => setToasts((current) => current.filter((message) => message.id !== id))} />

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
              Create goals, record contributions locally, and keep the dashboard demo-ready
              while on-chain savings stay available when the contract is configured.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#create-goal"
                className={primaryButtonClassName()}
              >
                Create Goal
              </a>
              <a
                href="#activity"
                className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900/70 px-5 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                View Activity
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

        <section id="activity" className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-8">
            <GoalPlanner
              goals={goals}
              selectedGoalId={selectedGoalId}
              onSelect={selectGoal}
              onCreate={addGoal}
              onNotify={notify}
            />
            <TransactionHistory transactions={transactions} />
          </div>

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
                    {Math.min(100, Math.round((selectedGoal.saved / selectedGoal.target) * 100))}%
                  </span>
                )}
              </div>

              {!selectedGoal && (
                <div className="mt-8 rounded-xl border border-dashed border-slate-700 bg-slate-900/55 p-8 text-center">
                  <ArrowDownRight className="mx-auto h-8 w-8 text-slate-500" />
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Create or select a savings goal to review details and add a contribution.
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
                        {money.format(selectedGoalRemaining)}
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
                        style={{ width: `${Math.min(100, Math.round((selectedGoal.saved / selectedGoal.target) * 100))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-right text-sm text-slate-300">
                      {Math.min(100, Math.round((selectedGoal.saved / selectedGoal.target) * 100))}% complete
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      color="success"
                      onClick={() => setAddSavingsOpen(true)}
                      disabled={selectedGoalRemaining <= 0}
                    >
                      <CircleDollarSign className="mr-2 h-4 w-4" />
                      {selectedGoalRemaining <= 0 ? 'Goal funded' : 'Add Savings'}
                    </Button>
                    {selectedGoalRemaining <= 0 && (
                      <p className="text-sm text-slate-400">
                        This goal is fully funded. Create a new target or keep tracking activity in the history panel.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </section>

            <section className="premium-card animate-card-in rounded-xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-300">Wallet Tools</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-50">Account actions</h2>
                </div>
              </div>

              {!publicKey && (
                <p className="mt-5 rounded-xl border border-slate-700 bg-slate-900/55 p-4 text-sm leading-6 text-slate-300">
                  Connect your wallet from the top-right button to enable account actions.
                </p>
              )}

              {publicKey && (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FundAccount publicKey={publicKey} onFunded={refresh} onNotify={notify} />
                    <AddTrustline publicKey={publicKey} onDone={refresh} onNotify={notify} />
                    <button
                      type="button"
                      onClick={() => setPaymentOpen(true)}
                      className={primaryButtonClassName('w-full')}
                    >
                      Send Test Payment
                    </button>
                    <Button color="gray" className="w-full" onClick={refresh}>
                      Refresh Balance
                    </Button>
                  </div>
                  <BalanceCard publicKey={publicKey} refreshKey={refreshKey} />
                </div>
              )}
            </section>

            <details className="premium-card animate-card-in rounded-xl p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <span className="inline-flex items-center gap-2">
                  <WalletCards className="h-4 w-4 text-slate-500" />
                  Advanced / Technical Details
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Optional
                </span>
              </summary>
              <div className="mt-5">
                <SavingsGoal publicKey={publicKey} onNotify={notify} />
              </div>
            </details>
          </aside>
        </section>
      </div>

      <AddSavingsModal
        key={`${selectedGoal?.id ?? 'none'}:${addSavingsOpen ? 'open' : 'closed'}`}
        open={addSavingsOpen}
        goal={selectedGoal}
        onClose={() => setAddSavingsOpen(false)}
        onSubmit={handleAddSavings}
      />

      {publicKey && (
        <PaymentUtilityModal
          open={paymentOpen}
          publicKey={publicKey}
          onClose={() => setPaymentOpen(false)}
          onSent={refresh}
          onNotify={notify}
        />
      )}
    </main>
  );
}
