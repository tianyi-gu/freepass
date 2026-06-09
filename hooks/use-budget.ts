import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const BUDGET_KEY = '@freepass_budget';
const EXPENSES_KEY = '@freepass_expenses';

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
  const [monthlyBudget, setMonthlyBudgetState] = useState(0);
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [budgetStr, expensesStr] = await Promise.all([
          AsyncStorage.getItem(BUDGET_KEY),
          AsyncStorage.getItem(EXPENSES_KEY),
        ]);
        if (budgetStr) {
          const parsed = parseFloat(budgetStr);
          if (!isNaN(parsed)) setMonthlyBudgetState(parsed);
        }
        if (expensesStr) {
          try {
            const parsed = JSON.parse(expensesStr);
            if (Array.isArray(parsed)) setExpensesState(parsed);
          } catch {
            // Corrupted expenses data — start fresh rather than crashing
            await AsyncStorage.removeItem(EXPENSES_KEY);
          }
        }
      } catch (err) {
        if (__DEV__) console.error('[useBudget] load failed:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const setMonthlyBudget = useCallback(async (amount: number) => {
    setMonthlyBudgetState(amount);
    await AsyncStorage.setItem(BUDGET_KEY, amount.toString());
  }, []);

  // Persist expenses to AsyncStorage whenever they change (after initial load)
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    }
  }, [expenses, isLoading]);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` };
    setExpensesState((prev) => [newExpense, ...prev]);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpensesState((prev) => prev.filter((e) => e.id !== id));
  }, []);

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
