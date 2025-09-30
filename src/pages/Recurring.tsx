import { useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, RefreshCcw } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import { formatCurrency } from "@/utils/currency";

export default function Recurring() {
  const { expenses, addExpense, deleteExpense, currency, isLoading } = useExpenses();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    recurringDay: "1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addExpense({
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: new Date().toISOString(),
      isRecurring: true,
      recurringDay: parseInt(formData.recurringDay),
    });
    setFormData({
      amount: "",
      category: "",
      description: "",
      recurringDay: "1",
    });
    setIsOpen(false);
  };

  const recurringExpenses = expenses.filter((exp) => exp.isRecurring);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading recurring expenses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Recurring Expenses</h2>
          <p className="text-muted-foreground">Manage your monthly subscriptions and bills</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Recurring Expense</DialogTitle>
              <DialogDescription>
                Set up a monthly recurring expense like subscriptions or bills
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Netflix subscription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="day">Billing Day</Label>
                <Select
                  value={formData.recurringDay}
                  onValueChange={(value) => setFormData({ ...formData, recurringDay: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Day {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Add Recurring Expense
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {recurringExpenses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No recurring expenses set up yet. Add your subscriptions and bills!
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Monthly Recurring</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                    currency
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {recurringExpenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                      <RefreshCcw className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category} • Every {expense.recurringDay}
                        {expense.recurringDay === 1
                          ? "st"
                          : expense.recurringDay === 2
                          ? "nd"
                          : expense.recurringDay === 3
                          ? "rd"
                          : "th"}{" "}
                        of the month
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold">{formatCurrency(expense.amount, currency)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteExpense(expense.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
