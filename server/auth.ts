import { Request, Response, NextFunction } from "express";
import { auth } from "@replit/repl-auth";
import { db } from "@db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        bio?: string;
        url?: string;
        profileImage?: string;
        dbId?: number; // Added to store our database user ID
      };
    }
  }
}

// Custom middleware to handle user authentication and database sync
export const authHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // First apply Replit's auth middleware
    auth(req, res, async () => {
      if (!req.user) {
        return next();
      }

      // Check if user exists in our database
      let dbUser = await db.query.users.findFirst({
        where: eq(users.replitId, req.user.id)
      });

      // If not, create new user
      if (!dbUser) {
        const [newUser] = await db.insert(users).values({
          replitId: req.user.id,
          username: req.user.name,
          name: req.user.name,
          profileImage: req.user.profileImage || null
        }).returning();
        dbUser = newUser;
      }

      // Attach database user ID to request
      req.user.dbId = dbUser.id;

      next();
    });
  } catch (error) {
    console.error("Auth error:", error);
    next(error);
  }
};

// Middleware to ensure user is authenticated
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.dbId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};