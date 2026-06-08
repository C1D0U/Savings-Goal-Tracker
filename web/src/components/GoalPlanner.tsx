'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Label, Progress, TextInput } from 'flowbite-react';
import { PlusCircle, Target } from 'lucide-react';

export interface SavingsGoalItem {
  id: string;
  title: string;
  target: number;
  saved: number;
  deadline: string;
}

const money = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

function goalProgress(goal: SavingsGoalItem) {
  return goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
}

export default function GoalPlanner({
  goals,
  onCreate,
}: {
  goals: SavingsGoalItem[];
  onCreate: (goal: SavingsGoalItem) => void;
}) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [deadline, setDeadline] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const totalTarget = useMemo(
    () => goals.reduce((sum, goal) => sum + goal.target, 0),
    [goals],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');

    const nextTarget = Number(target);
    const nextSaved = Number(saved || '0');

    if (!title.trim()) {
      setError('Give the goal a short name.');
      return;
    }

    if (!Number.isFinite(nextTarget) || nextTarget <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }

    if (!Number.isFinite(nextSaved) || nextSaved < 0 || nextSaved > nextTarget) {
      setError('Saved amount must be between zero and the target.');
      return;
    }

    onCreate({
      id: crypto.randomUUID(),
      title: title.trim(),
      target: Math.round(nextTarget),
      saved: Math.round(nextSaved),
      deadline,
    });

    setTitle('');
    setTarget('');
    setSaved('');
    setDeadline('');
    setMessage('Goal added to the dashboard.');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card className="h-fit rounded-lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create savings goal</h2>
            <p className="mt-1 text-sm text-gray-600">
              Add a simple goal for planning. Contract writes can be connected later.
            </p>
          </div>

          {message && <Alert color="success">{message}</Alert>}
          {error && <Alert color="failure">{error}</Alert>}

          <div>
            <Label htmlFor="goal-title">Goal name</Label>
            <TextInput
              id="goal-title"
              placeholder="Emergency fund"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="goal-target">Target amount</Label>
              <TextInput
                id="goal-target"
                type="number"
                min="1"
                placeholder="25000"
                value={target}
                onChange={(event) => setTarget(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="goal-saved">Already saved</Label>
              <TextInput
                id="goal-saved"
                type="number"
                min="0"
                placeholder="0"
                value={saved}
                onChange={(event) => setSaved(event.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="goal-deadline">Target date</Label>
            <TextInput
              id="goal-deadline"
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </div>

          <Button type="submit" color="blue" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add goal
          </Button>
        </form>
      </Card>

      <Card className="rounded-lg">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Goal list</h2>
            <p className="mt-1 text-sm text-gray-600">
              {goals.length
                ? `${goals.length} active goal${goals.length === 1 ? '' : 's'}`
                : 'No goals yet'}
            </p>
          </div>
          <Badge color="indigo">{money.format(totalTarget || 0)} target</Badge>
        </div>

        {!goals.length && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <Target className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-3 font-medium text-gray-900">Start with one goal</p>
            <p className="mt-1 text-sm text-gray-600">
              Create a goal to see progress bars and dashboard totals.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {goals.map((goal) => {
            const pct = goalProgress(goal);
            return (
              <div key={goal.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">
                      {money.format(goal.saved)} saved of {money.format(goal.target)}
                    </p>
                  </div>
                  <Badge color={pct >= 100 ? 'success' : 'gray'}>
                    {pct >= 100 ? 'Complete' : goal.deadline || 'No date'}
                  </Badge>
                </div>
                <Progress
                  progress={pct}
                  color={pct >= 100 ? 'green' : 'blue'}
                  size="lg"
                  className="mt-4"
                />
                <p className="mt-2 text-right text-sm font-medium text-gray-700">{pct}%</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
