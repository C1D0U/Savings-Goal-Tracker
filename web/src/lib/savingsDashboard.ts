export interface SavingsGoalItem {
  id: string;
  title: string;
  target: number;
  saved: number;
  deadline: string;
}

export interface SavingsTransaction {
  id: string;
  goalId: string;
  goalTitle: string;
  amount: number;
  note: string;
  createdAt: string;
  type: 'Savings Added';
}

export interface SavingsDashboardState {
  goals: SavingsGoalItem[];
  selectedGoalId: string | null;
  transactions: SavingsTransaction[];
}

const STORAGE_KEY = 'stellarx:savings-dashboard:v1';
const STORAGE_EVENT = 'stellarx:savings-dashboard:updated';

export function getDefaultSavingsDashboardState(): SavingsDashboardState {
  return {
    goals: [],
    selectedGoalId: null,
    transactions: [],
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeGoal(value: unknown): SavingsGoalItem | null {
  if (!isObject(value)) {
    return null;
  }

  const id = typeof value.id === 'string' ? value.id : '';
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const target = Number(value.target);
  const saved = Number(value.saved);
  const deadline = typeof value.deadline === 'string' ? value.deadline : '';

  if (!id || !title || !Number.isFinite(target) || target <= 0 || !Number.isFinite(saved) || saved < 0) {
    return null;
  }

  return {
    id,
    title,
    target: Math.max(1, Math.round(target)),
    saved: Math.min(Math.max(0, Math.round(saved)), Math.max(1, Math.round(target))),
    deadline,
  };
}

function normalizeTransaction(value: unknown): SavingsTransaction | null {
  if (!isObject(value)) {
    return null;
  }

  const id = typeof value.id === 'string' ? value.id : '';
  const goalId = typeof value.goalId === 'string' ? value.goalId : '';
  const goalTitle = typeof value.goalTitle === 'string' ? value.goalTitle.trim() : '';
  const amount = Number(value.amount);
  const note = typeof value.note === 'string' ? value.note.trim() : '';
  const createdAt = typeof value.createdAt === 'string' ? value.createdAt : '';
  const type = value.type === 'Savings Added' ? 'Savings Added' : null;

  if (!id || !goalId || !goalTitle || !Number.isFinite(amount) || amount <= 0 || !createdAt || !type) {
    return null;
  }

  return {
    id,
    goalId,
    goalTitle,
    amount: Math.max(1, Math.round(amount)),
    note,
    createdAt,
    type,
  };
}

export function loadSavingsDashboardState(): SavingsDashboardState {
  return parseSavingsDashboardState(getSavingsDashboardSnapshot());
}

export function getSavingsDashboardSnapshot(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? '';
}

export function parseSavingsDashboardState(snapshot: string): SavingsDashboardState {
  if (!snapshot) {
    return getDefaultSavingsDashboardState();
  }

  try {
    const parsed = JSON.parse(snapshot) as Partial<SavingsDashboardState> | null;
    if (!parsed) {
      return getDefaultSavingsDashboardState();
    }

    const goals = Array.isArray(parsed.goals)
      ? parsed.goals.map(normalizeGoal).filter((goal): goal is SavingsGoalItem => goal !== null)
      : [];
    const transactions = Array.isArray(parsed.transactions)
      ? parsed.transactions
          .map(normalizeTransaction)
          .filter((transaction): transaction is SavingsTransaction => transaction !== null)
      : [];
    const selectedGoalId =
      typeof parsed.selectedGoalId === 'string' &&
      goals.some((goal) => goal.id === parsed.selectedGoalId)
        ? parsed.selectedGoalId
        : goals[0]?.id ?? null;

    return {
      goals,
      selectedGoalId,
      transactions,
    };
  } catch {
    return getDefaultSavingsDashboardState();
  }
}

export function saveSavingsDashboardState(state: SavingsDashboardState): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function subscribeSavingsDashboardState(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };
  const handleCustomUpdate = () => onStoreChange();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(STORAGE_EVENT, handleCustomUpdate);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(STORAGE_EVENT, handleCustomUpdate);
  };
}

export function updateSavingsDashboardState(
  updater: (current: SavingsDashboardState) => SavingsDashboardState,
): SavingsDashboardState {
  const nextState = updater(loadSavingsDashboardState());
  saveSavingsDashboardState(nextState);
  return nextState;
}

export function goalProgress(goal: SavingsGoalItem): number {
  return goal.target > 0 ? Math.min(100, Math.round((goal.saved / goal.target) * 100)) : 0;
}

export function remainingAmount(goal: SavingsGoalItem): number {
  return Math.max(0, goal.target - goal.saved);
}
