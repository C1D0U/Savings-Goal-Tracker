'use client';

import { useMemo, useState } from 'react';
import { Modal, ModalBody, ModalFooter, ModalHeader, Button, Badge } from 'flowbite-react';
import { CircleDollarSign } from 'lucide-react';
import { remainingAmount, type SavingsGoalItem } from '@/lib/savingsDashboard';

export default function AddSavingsModal({
  open,
  goal,
  onClose,
  onSubmit,
}: {
  open: boolean;
  goal: SavingsGoalItem | null;
  onClose: () => void;
  onSubmit: (amount: number, note: string) => void;
}) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const money = useMemo(
    () =>
      new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
      }),
    [],
  );

  const maxRemaining = goal ? remainingAmount(goal) : 0;

  const handleSubmit = () => {
    if (!goal) {
      setError('Select a goal first.');
      return;
    }

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }

    if (value > maxRemaining) {
      setError(`Amount cannot exceed the remaining ${money.format(maxRemaining)}.`);
      return;
    }

    onSubmit(Math.round(value), note.trim());
    onClose();
  };

  return (
    <Modal show={open} onClose={onClose} size="md" popup dismissible>
      <ModalHeader className="border-slate-800 bg-[#111827] text-slate-50">
        Add Savings
      </ModalHeader>
      <ModalBody className="bg-[#111827] text-slate-50">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-blue-300">
              {goal ? goal.title : 'No goal selected'}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-50">Record a contribution</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Save a local contribution against the selected goal and keep the progress bar in sync.
            </p>
          </div>

          {goal && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="info">Remaining {money.format(maxRemaining)}</Badge>
              <Badge color="success">{goal.title}</Badge>
            </div>
          )}

          <div>
            <label htmlFor="add-savings-amount" className="mb-2 block text-sm font-medium text-slate-200">
              Amount
            </label>
            <input
              id="add-savings-amount"
              type="number"
              min="1"
              step="1"
              placeholder="500"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
            />
          </div>

          <div>
            <label htmlFor="add-savings-note" className="mb-2 block text-sm font-medium text-slate-200">
              Note
            </label>
            <input
              id="add-savings-note"
              type="text"
              placeholder="Optional note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-slate-50 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/25"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-400/25 bg-red-400/10 p-4 text-sm text-red-100">
              {error}
            </p>
          )}
        </div>
      </ModalBody>
      <ModalFooter className="border-slate-800 bg-[#111827]">
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button color="success" onClick={handleSubmit} disabled={!goal}>
          <CircleDollarSign className="mr-2 h-4 w-4" />
          Add Savings
        </Button>
      </ModalFooter>
    </Modal>
  );
}
