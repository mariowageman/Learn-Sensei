import { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";

interface ProtectedComponentProps {
  children: ReactNode;
  requiredRole?: string[];
  requiredPermission?: {
    action: string;
    subject: string;
  };
}

export function ProtectedComponent({
  children,
  requiredRole,
  requiredPermission,
}: ProtectedComponentProps) {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return null;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return null;
  }

  if (
    requiredPermission &&
    !hasPermission(requiredPermission.action, requiredPermission.subject)
  ) {
    return null;
  }

  return <>{children}</>;
}
