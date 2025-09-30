import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { loadData, saveData } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Auth() {
  const { login, needsSetup } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (needsSetup) {
      if (password.length < 8) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 8 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      try {
        await saveData({ expenses: [], budgets: {} }, password);
        login(password);
      } catch (error) {
        toast({
          title: "Setup Failed",
          description: "Failed to create secure storage.",
          variant: "destructive",
        });
      }
    } else {
      try {
        await loadData(password);
        login(password);
      } catch (error) {
        toast({
          title: "Authentication Failed",
          description: "Incorrect password.",
          variant: "destructive",
        });
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {needsSetup ? "Create Password" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {needsSetup
              ? "Set up a password to encrypt your expense data"
              : "Enter your password to unlock your expenses"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {needsSetup && (
              <div className="space-y-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : needsSetup ? "Create & Continue" : "Unlock"}
            </Button>

            {needsSetup && (
              <p className="text-center text-sm text-muted-foreground">
                Remember this password. There's no way to recover it if lost.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
