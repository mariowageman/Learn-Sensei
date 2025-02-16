import { Card } from "@/components/ui/card";
import { LoginButton } from "@/components/auth/LoginButton";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export function LoginPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Welcome to Learn Sensei</h1>
          <p className="text-muted-foreground">
            Sign in to continue your learning journey
          </p>
        </div>
        <LoginButton />
      </Card>
    </div>
  );
}
