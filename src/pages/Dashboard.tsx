import { useMemo } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { formatCurrency } from "@/utils/currency";

export default function Dashboard() {
  const { expenses, budgets, currency, isLoading } = useExpenses();

  const monthlyData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate >= monthStart && expDate <= monthEnd;
    });

    const totalSpent = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = Object.values(budgets).reduce((sum, budget) => sum + budget, 0);

    const categoryTotals: Record<string, number> = {};
    monthExpenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const categoryData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        budget: budgets[category] || 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalSpent,
      totalBudget,
      monthExpenses,
      categoryData,
    };
  }, [expenses, budgets]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading your data...</p>
      </div>
    );
  }

  const { totalSpent, totalBudget, monthExpenses, categoryData } = monthlyData;
  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">{format(new Date(), "MMMM yyyy")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSpent, currency)}</div>
            <p className="text-xs text-muted-foreground">
              {monthExpenses.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget, currency)}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
            {isOverBudget ? (
              <TrendingDown className="h-4 w-4 text-destructive" />
            ) : (
              <TrendingUp className="h-4 w-4 text-accent" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isOverBudget ? "text-destructive" : "text-accent"
              }`}
            >
              {formatCurrency(Math.abs(remaining), currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {isOverBudget ? "Over budget" : "Under budget"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No expenses this month yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <XAxis
                  dataKey="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value, currency)}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value), currency)}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.budget > 0 && entry.amount > entry.budget
                          ? "hsl(var(--destructive))"
                          : "hsl(var(--primary))"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {monthExpenses.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {monthExpenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category} • {format(new Date(expense.date), "MMM d")}
                      </p>
                    </div>
                    <p className="font-semibold">{formatCurrency(expense.amount, currency)}</p>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
