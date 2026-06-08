'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  getSavingsDashboardSnapshot,
  parseSavingsDashboardState,
  subscribeSavingsDashboardState,
  updateSavingsDashboardState,
  type SavingsGoalItem,
  type SavingsTransaction,
} from '@/lib/savingsDashboard';

export function useSavingsDashboard() {
  const snapshot = useSyncExternalStore(
    subscribeSavingsDashboardState,
    getSavingsDashboardSnapshot,
    () => '',
  );
  const state = useMemo(() => parseSavingsDashboardState(snapshot), [snapshot]);

  const selectedGoal = useMemo(
    () => state.goals.find((goal) => goal.id === state.selectedGoalId) ?? state.goals[0] ?? null,
    [state.goals, state.selectedGoalId],
  );

  const addGoal = useCallback((goal: SavingsGoalItem) => {
    updateSavingsDashboardState((current) => {
      const goals = [goal, ...current.goals];

      return {
        ...current,
        goals,
        selectedGoalId: goal.id,
      };
    });
  }, []);

  const selectGoal = useCallback((goalId: string) => {
    updateSavingsDashboardState((current) => ({
      ...current,
      selectedGoalId: goalId,
    }));
  }, []);

  const addSavings = useCallback((goalId: string, amount: number, note: string) => {
    updateSavingsDashboardState((current) => {
      const goal = current.goals.find((entry) => entry.id === goalId);
      if (!goal) {
        return current;
      }

      const nextGoals = current.goals.map((entry) =>
        entry.id === goalId ? { ...entry, saved: entry.saved + amount } : entry,
      );
      const transaction: SavingsTransaction = {
        id: crypto.randomUUID(),
        goalId,
        goalTitle: goal.title,
        amount,
        note,
        createdAt: new Date().toISOString(),
        type: 'Savings Added',
      };

      return {
        ...current,
        goals: nextGoals,
        selectedGoalId: goalId,
        transactions: [transaction, ...current.transactions],
      };
    });
  }, []);

  return {
    goals: state.goals,
    selectedGoalId: state.selectedGoalId,
    selectedGoal,
    transactions: state.transactions,
    addGoal,
    addSavings,
    selectGoal,
  };
}
