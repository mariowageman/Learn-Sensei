import { z } from "zod";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  SUBSCRIBER = "subscriber",
  MODERATOR = "moderator"
}

export interface Permission {
  action: string;
  subject: string;
}

export const defaultPermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    { action: "manage", subject: "all" },
    { action: "manage", subject: "billing" }
  ],
  [UserRole.MODERATOR]: [
    { action: "read", subject: "all" },
    { action: "create", subject: "post" },
    { action: "update", subject: "post" },
    { action: "delete", subject: "post" },
    { action: "manage", subject: "comment" }
  ],
  [UserRole.SUBSCRIBER]: [
    { action: "read", subject: "all" },
    { action: "access", subject: "premium" }
  ],
  [UserRole.USER]: [
    { action: "read", subject: "post" },
    { action: "read", subject: "comment" }
  ]
};

export const hasPermission = (
  userRole: UserRole,
  action: string,
  subject: string
): boolean => {
  const permissions = defaultPermissions[userRole];
  
  return permissions.some(permission => 
    (permission.action === "manage" && permission.subject === "all") ||
    (permission.action === action && permission.subject === subject) ||
    (permission.action === "manage" && permission.subject === subject) ||
    (permission.action === action && permission.subject === "all")
  );
};

export const roleSchema = z.nativeEnum(UserRole);

export type RBACUser = {
  id: number;
  username: string;
  role: UserRole;
};
