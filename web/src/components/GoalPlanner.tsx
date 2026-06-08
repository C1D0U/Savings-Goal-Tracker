'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from 'flowbite-react';
import { ChevronDown, ChevronUp, PlusCircle, Target } from 'lucide-react';
import { remainingAmount, goalProgress, type SavingsGoalItem } from '@/lib/savingsDashboard';
import type { ToastTone } from '@/components/ToastStack';
import { primaryButtonClassName } from '@/components/buttonStyles';

const money = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const DEFAULT_VISIBLE_GOALS = 3;

export default function GoalPlanner({
  goals,
  selectedGoalId,
  onSelect,
  onCreate,
  onNotify,
}: {
  goals: SavingsGoalItem[];
  selectedGoalId: string | null;
  onSelect: (goalId: string) => void;
  onCreate: (goal: SavingsGoalItem) => void;
  onNotify?: (tone: ToastTone, title: string, detail?: string) => void;
}) {
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_GOALS);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [deadline, setDeadline] = useState('');

  const totalRemaining = useMemo(
    () => goals.reduce((sum, goal) => sum + remainingAmount(goal), 0),
    [goals],
  );
  const visibleGoals = goals.slice(0, visibleCount);
  const canToggleGoals = goals.length > DEFAULT_VISIBLE_GOALS;
  const showAllGoals = visibleCount >= goals.length;

  const notify = (tone: ToastTone, nextTitle: string, detail?: string) => {
    onNotify?.(tone, nextTitle, detail);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextTarget = Number(target);
    const nextSaved = Number(saved || '0');

    if (!title.trim()) {
      notify('warning', 'Validation error', 'Give the goal a short, readable name.');
      return;
    }

    if (!Number.isFinite(nextTarget) || nextTarget <= 0) {
      notify('warning', 'Validation error', 'Target amount must be greater than zero.');
      return;
    }

    if (!Number.isFinite(nextSaved) || nextSaved < 0 || nextSaved > nextTarget) {
      notify('warning', 'Validation error', 'Current savings must be between zero and the target.');
      return;
    }

    const goal = {
      id: crypto.randomUUID(),
      title: title.trim(),
      target: Math.round(nextTarget),
      saved: Math.round(nextSaved),
      deadline,
    };

    onCreate(goal);
    setTitle('');
    setTarget('');
    setSaved('');
    setDeadline('');
    notify('success', 'Goal created', `${goal.title} is now tracking ${money.format(goal.target)}.`);
  };

  return (
    <div className="space-y-6">
      <section className="premium-card animate-card-in rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-300">Your Goals</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-50">Savings portfolio</h2>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-sm text-slate-300">
            {money.format(totalRemaining)} remaining
          </div>
        </div>

        {!goals.length && (
          <div className="mt-6 rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900/90 to-slate-950/80 p-8 shadow-xl shadow-black/20">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  <Target className="h-3.5 w-3.5 text-emerald-300" />
                  Portfolio empty
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-50">
                  No savings goals yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Create your first target to start tracking progress, remaining balance, and contributions.
                </p>
              </div>
              <Button href="#create-goal" color="blue">
                Create Goal
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {visibleGoals.map((goal) => {
            const pct = goalProgress(goal);
            const isSelected = goal.id === selectedGoalId;

            return (
              <button
                type="button"
                key={goal.id}
                onClick={() => onSelect(goal.id)}
                className={`group w-full rounded-xl border p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  isSelected
                    ? 'border-blue-400/70 bg-blue-500/10 shadow-lg shadow-blue-950/20'
                    : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-slate-50">
                      {goal.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {money.format(goal.saved)} of {money.format(goal.target)}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                    {pct}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-400">
                  <span>{money.format(remainingAmount(goal))} remaining</span>
                  <span>{goal.deadline || 'No target date'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {canToggleGoals && (
          <div className="mt-5 flex justify-center">
            <Button
              color="gray"
              size="sm"
              onClick={() =>
                setVisibleCount(showAllGoals ? DEFAULT_VISIBLE_GOALS : goals.length)
              }
            >
              {showAllGoals ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show more
                </>
              )}
            </Button>
          </div>
        )}
      </section>

      <section id="create-goal" className="premium-card animate-card-in rounded-xl p-6">
        <div className="mb-5">
          <p className="text-sm font-medium text-blue-300">Create Goal</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-50">Set a new target</h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="goal-title" className="mb-2 block text-sm font-medium text-slate-200">
              Goal name
            </label>
            <input
              id="goal-title"
              placeholder="Emergency fund"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="goal-target" className="mb-2 block text-sm font-medium text-slate-200">
                Target amount
              </label>
              <input
                id="goal-target"
                type="number"
                min="1"
                placeholder="25000"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
              />
            </div>
            <div>
              <label htmlFor="goal-saved" className="mb-2 block text-sm font-medium text-slate-200">
                Current savings
              </label>
              <input
                id="goal-saved"
                type="number"
                min="0"
                placeholder="0"
                value={saved}
                onChange={(event) => setSaved(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
              />
            </div>
          </div>

          <div>
            <label htmlFor="goal-deadline" className="mb-2 block text-sm font-medium text-slate-200">
              Target date
            </label>
            <input
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
            />
          </div>

          <button
            type="submit"
            className={primaryButtonClassName('w-full')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Goal
          </button>
        </form>
      </section>
    </div>
  );
}
