export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringDay?: number;
  createdAt: string;
}

export interface MonthlyBudget {
  [category: string]: number;
}

export interface AppData {
  expenses: Expense[];
  budgets: MonthlyBudget;
}

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Transportation",
  "Food",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Subscriptions",
  "Other"
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
