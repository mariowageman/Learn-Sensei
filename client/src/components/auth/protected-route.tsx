import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";

interface ProtectedRouteProps {
  children: React.ReactNode;
  path: string;
}

export function ProtectedRoute({ children, path }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return <Route path={path}>{children}</Route>;
}