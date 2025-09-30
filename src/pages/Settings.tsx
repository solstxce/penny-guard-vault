import { useState } from "react";
import { useExpenses } from "@/contexts/ExpenseContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Upload, Trash2, DollarSign, Moon, Sun } from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import { exportData, importData, clearAllData } from "@/utils/storage";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { formatCurrency, Currency, CURRENCIES } from "@/utils/currency";
import { useTheme } from "next-themes";

export default function Settings() {
  const { budgets, setBudget, currency, setCurrency } = useExpenses();
  const { password, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");

  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategory && budgetAmount) {
      await setBudget(selectedCategory, parseFloat(budgetAmount));
      setSelectedCategory("");
      setBudgetAmount("");
    }
  };

  const handleExport = async () => {
    try {
      if (!password) return;
      const data = await exportData(password);
      const blob = new Blob([data], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `expense-tracker-${new Date().toISOString().split("T")[0]}.enc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Export Complete",
        description: "Your encrypted data has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !password) return;

    try {
      const text = await file.text();
      await importData(text, password);
      toast({
        title: "Import Complete",
        description: "Data imported successfully. Reloading...",
      });
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Check password and file.",
        variant: "destructive",
      });
    }
  };

  const handleClearData = () => {
    clearAllData();
    logout();
    toast({
      title: "Data Cleared",
      description: "All data has been permanently deleted.",
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize your app appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
              <SelectTrigger id="currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CURRENCIES).map(([code, { symbol, name }]) => (
                  <SelectItem key={code} value={code}>
                    {symbol} {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>Set monthly spending limits for each category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSetBudget} className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
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
            <Input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="w-32"
            />
            <Button type="submit">Set</Button>
          </form>

          <div className="space-y-2">
            {Object.entries(budgets).map(([category, amount]) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{category}</span>
                </div>
                <span className="text-sm">{formatCurrency(amount, currency)}</span>
              </div>
            ))}
            {Object.keys(budgets).length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No budgets set yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export, import, or delete your encrypted data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExport} variant="outline" className="w-full justify-start">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>

          <Label htmlFor="import-file" className="block">
            <div className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-md border border-input bg-background px-4 py-2 hover:bg-accent hover:text-accent-foreground">
              <Upload className="h-4 w-4" />
              Import Data
            </div>
            <Input
              id="import-file"
              type="file"
              accept=".enc"
              onChange={handleImport}
              className="hidden"
            />
          </Label>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your expenses,
                  budgets, and settings. Make sure to export your data first if you want to keep
                  it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearData}>Delete Everything</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
