import { Request, Response, NextFunction } from "express";
import { UserRole } from "@/lib/rbac";

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role.name as UserRole)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}

export function requirePermission(action: string, subject: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const hasPermission = defaultPermissions[req.user.role.name as UserRole].some(
      permission =>
        (permission.action === action && permission.subject === subject) ||
        (permission.action === "manage" && permission.subject === "all")
    );

    if (!hasPermission) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
}
