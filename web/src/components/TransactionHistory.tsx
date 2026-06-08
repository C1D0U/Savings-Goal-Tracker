'use client';

import { CalendarClock, CircleDollarSign, History } from 'lucide-react';
import { Badge } from 'flowbite-react';
import { type SavingsTransaction } from '@/lib/savingsDashboard';

const money = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-PH', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export default function TransactionHistory({
  transactions,
}: {
  transactions: SavingsTransaction[];
}) {
  return (
    <section className="premium-card animate-card-in rounded-xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-blue-300">Activity</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-50">Transaction history</h2>
        </div>
        <div className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-sm text-slate-300">
          {transactions.length} entries
        </div>
      </div>

      {!transactions.length && (
        <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-900/55 p-8 text-center">
          <History className="mx-auto h-10 w-10 text-slate-500" />
          <p className="mt-4 text-base font-semibold text-slate-100">No savings activity yet</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Add savings to a goal and the local transaction timeline will appear here.
          </p>
        </div>
      )}

      {!!transactions.length && (
        <div className="mt-6 space-y-3">
          {transactions.map((transaction) => (
            <article
              key={transaction.id}
              className="rounded-xl border border-slate-700 bg-slate-900/45 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-50">
                      {transaction.goalTitle}
                    </h3>
                    <Badge color="success">Savings Added</Badge>
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {dateFormatter.format(new Date(transaction.createdAt))}
                    </span>
                    {transaction.note && <span className="truncate">Note: {transaction.note}</span>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="inline-flex items-center gap-1.5 text-lg font-semibold text-emerald-300">
                    <CircleDollarSign className="h-4 w-4" />
                    +{money.format(transaction.amount)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Local record
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

