import type { Request, Response, NextFunction } from "express";
import replAuth from "@replit/repl-auth";
import { db } from "@db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

// Extend Request type with user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        bio?: string;
        url?: string;
        profileImage?: string;
      };
    }
  }
}

// Simple auth middleware that uses Replit auth
export const authHandler = (req: Request, res: Response, next: NextFunction) => {
  replAuth(req, res, () => {
    // User will be automatically added to req by Replit auth if authenticated
    next();
  });
};

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Helper to get or create user in our database
export const getOrCreateUser = async (req: Request) => {
  if (!req.user) return null;

  const existingUser = await db.query.users.findFirst({
    where: eq(users.replitId, req.user.id)
  });

  if (existingUser) {
    return existingUser;
  }

  const [newUser] = await db.insert(users).values({
    replitId: req.user.id,
    username: req.user.name,
    name: req.user.name,
    profileImage: req.user.profileImage || null
  }).returning();

  return newUser;
};