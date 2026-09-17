import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUser } from '@/contexts/user-context';



export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  tag?: string;
  date: string; // ISO string
}

export type ExpenseCategory =
  | 'Housing'
  | 'Food'
  | 'Transportation'
  | 'Healthcare'
  | 'Personal'
  | 'Education'
  | 'Utilities'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Food',
  'Transportation',
  'Healthcare',
  'Personal',
  'Education',
  'Utilities',
  'Other',
];

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  Housing: 'house.fill',
  Food: 'fork.knife',
  Transportation: 'car.fill',
  Healthcare: 'heart.fill',
  Personal: 'person.fill',
  Education: 'book.fill',
  Utilities: 'bolt.fill',
  Other: 'ellipsis.circle.fill',
};

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Housing: '#E74C3C',
  Food: '#F39C12',
  Transportation: '#3498DB',
  Healthcare: '#E91E63',
  Personal: '#9B59B6',
  Education: '#2E8540',
  Utilities: '#1ABC9C',
  Other: '#95A5A6',
};

export function useBudget() {
  const { user } = useUser();
  const owner = user?.id ?? 'guest';
  const budgetKey = `@freepass_budget:${owner}`;
  const expensesKey = `@freepass_expenses:${owner}`;
  const [monthlyBudget, setMonthlyBudgetState] = useState(0);
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);
  const expensesRef = useRef<Expense[]>([]);
  const writesRef = useRef<Promise<void>>(Promise.resolve());
  const reload = useCallback(() => setLoadVersion((n) => n + 1), []);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError(false);
      try {
        let [budgetStr, expensesStr] = await Promise.all([
          AsyncStorage.getItem(budgetKey),
          AsyncStorage.getItem(expensesKey),
        ]);
        // Previous releases cleared these unscoped values on logout, so any
        // remaining legacy budget belongs to the current device session.
        if (budgetStr === null && expensesStr === null) {
          [budgetStr, expensesStr] = await Promise.all([AsyncStorage.getItem('@freepass_budget'), AsyncStorage.getItem('@freepass_expenses')]);
          const writes: [string, string][] = [];
          if (budgetStr !== null) writes.push([budgetKey, budgetStr]);
          if (expensesStr !== null) writes.push([expensesKey, expensesStr]);
          if (writes.length) {
            await AsyncStorage.multiSet(writes);
            await AsyncStorage.multiRemove(['@freepass_budget', '@freepass_expenses']);
          }
        }
        if (budgetStr) {
          const parsed = parseFloat(budgetStr);
          if (Number.isFinite(parsed) && parsed >= 0) setMonthlyBudgetState(parsed);
        }
        if (expensesStr) {
          try {
            const parsed = JSON.parse(expensesStr);
            // Element-level shape check: one malformed entry (non-numeric
            // amount) would crash the Budget tab on every render, and since
            // the bad data is persisted the tab would stay broken until
            // reinstall. Drop invalid entries instead.
            if (Array.isArray(parsed)) {
              const valid = parsed.filter(
                (e): e is Expense =>
                  !!e &&
                  typeof e === 'object' &&
                  typeof e.id === 'string' &&
                  typeof e.amount === 'number' &&
                  isFinite(e.amount) && e.amount >= 0 &&
                  EXPENSE_CATEGORIES.includes(e.category) &&
                  Number.isFinite(Date.parse(e.date)) &&
                  typeof e.description === 'string' &&
                  typeof e.date === 'string',
              );
              expensesRef.current = valid;
              setExpensesState(valid);
              if (valid.length !== parsed.length) {
                await AsyncStorage.setItem(expensesKey, JSON.stringify(valid));
              }
            }
          } catch {
            // Corrupted expenses data — start fresh rather than crashing
            await AsyncStorage.removeItem(expensesKey);
          }
        }
      } catch (err) {
        setLoadError(true);
        if (__DEV__) console.error('[useBudget] load failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [budgetKey, expensesKey, loadVersion]);

  const setMonthlyBudget = useCallback(async (amount: number) => {
    await AsyncStorage.setItem(budgetKey, amount.toString());
    setMonthlyBudgetState(amount);
  }, [budgetKey]);

  // Serialize mutations and publish state only after durable storage succeeds.
  const updateExpenses = useCallback((update: (current: Expense[]) => Expense[]) => {
    const pending = writesRef.current.then(async () => {
      const next = update(expensesRef.current);
      await AsyncStorage.setItem(expensesKey, JSON.stringify(next));
      expensesRef.current = next;
      setExpensesState(next);
    });
    writesRef.current = pending.catch(() => {});
    return pending;
  }, [expensesKey]);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` };
    return updateExpenses((prev) => [newExpense, ...prev]);
  }, [updateExpenses]);

  const deleteExpense = useCallback((id: string) => updateExpenses((prev) => prev.filter((e) => e.id !== id)), [updateExpenses]);

  const getMonthExpenses = useCallback(
    (year: number, month: number) => {
      return expenses.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      });
    },
    [expenses],
  );

  const getCurrentMonthExpenses = useCallback(() => {
    const now = new Date();
    return getMonthExpenses(now.getFullYear(), now.getMonth());
  }, [getMonthExpenses]);

  const getCurrentMonthTotal = useCallback(() => {
    return getCurrentMonthExpenses().reduce((sum, e) => sum + e.amount, 0);
  }, [getCurrentMonthExpenses]);

  const getCategoryTotals = useCallback(() => {
    const current = getCurrentMonthExpenses();
    const totals: Partial<Record<ExpenseCategory, number>> = {};
    for (const e of current) {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    }
    return totals;
  }, [getCurrentMonthExpenses]);

  const getTopSpendingCategory = useCallback((): ExpenseCategory | null => {
    const totals = getCategoryTotals();
    let max = 0;
    let maxCat: ExpenseCategory | null = null;
    for (const [cat, amount] of Object.entries(totals)) {
      if (amount > max) {
        max = amount;
        maxCat = cat as ExpenseCategory;
      }
    }
    return maxCat;
  }, [getCategoryTotals]);

  return {
    monthlyBudget,
    expenses,
    isLoading,
    loadError,
    reload,
    setMonthlyBudget,
    addExpense,
    deleteExpense,
    getMonthExpenses,
    getCurrentMonthExpenses,
    getCurrentMonthTotal,
    getCategoryTotals,
    getTopSpendingCategory,
  };
}
