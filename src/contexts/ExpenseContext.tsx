import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AppData, Expense, MonthlyBudget } from "@/types/expense";
import { saveData, loadData } from "@/utils/storage";
import { useAuth } from "./AuthContext";
import { toast } from "@/hooks/use-toast";

interface ExpenseContextType {
  expenses: Expense[];
  budgets: MonthlyBudget;
  addExpense: (expense: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  setBudget: (category: string, amount: number) => Promise<void>;
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { password, isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<MonthlyBudget>({});
  const [isLoading, setIsLoading] = useState(true);

  const saveToStorage = useCallback(async (data: AppData) => {
    if (password) {
      try {
        await saveData(data, password);
      } catch (error) {
        toast({
          title: "Save Failed",
          description: "Failed to save data to storage.",
          variant: "destructive",
        });
      }
    }
  }, [password]);

  useEffect(() => {
    if (isAuthenticated && password) {
      loadData(password)
        .then((data) => {
          setExpenses(data.expenses);
          setBudgets(data.budgets);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          toast({
            title: "Load Failed",
            description: "Failed to load data.",
            variant: "destructive",
          });
        });
    }
  }, [isAuthenticated, password]);

  const addExpense = async (expense: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const newExpenses = [...expenses, newExpense];
    setExpenses(newExpenses);
    await saveToStorage({ expenses: newExpenses, budgets });
    toast({
      title: "Expense Added",
      description: "Your expense has been recorded.",
    });
  };

  const updateExpense = async (id: string, updatedFields: Partial<Expense>) => {
    const newExpenses = expenses.map((exp) =>
      exp.id === id ? { ...exp, ...updatedFields } : exp
    );
    setExpenses(newExpenses);
    await saveToStorage({ expenses: newExpenses, budgets });
    toast({
      title: "Expense Updated",
      description: "Your expense has been updated.",
    });
  };

  const deleteExpense = async (id: string) => {
    const newExpenses = expenses.filter((exp) => exp.id !== id);
    setExpenses(newExpenses);
    await saveToStorage({ expenses: newExpenses, budgets });
    toast({
      title: "Expense Deleted",
      description: "Your expense has been removed.",
    });
  };

  const setBudget = async (category: string, amount: number) => {
    const newBudgets = { ...budgets, [category]: amount };
    setBudgets(newBudgets);
    await saveToStorage({ expenses, budgets: newBudgets });
    toast({
      title: "Budget Updated",
      description: `Budget for ${category} has been set.`,
    });
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        budgets,
        addExpense,
        updateExpense,
        deleteExpense,
        setBudget,
        isLoading,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within ExpenseProvider");
  }
  return context;
}
