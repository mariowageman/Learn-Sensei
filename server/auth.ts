import { Router, Request, Response, NextFunction } from "express";
import { db } from "@db";
import { users, roles } from "@db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { UserRole } from "@/lib/rbac";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router = Router();

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId;
  console.log('Session in requireAuth:', req.session);

  if (!userId) {
    return res.status(401).json({ message: "Please log in to continue" });
  }

  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

router.post("/api/auth/register", async (req, res) => {
  console.log('Register request body:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username)
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Get default user role
    const defaultRole = await db.query.roles.findFirst({
      where: (roles, { eq }) => eq(roles.name, UserRole.USER)
    });

    if (!defaultRole) {
      return res.status(500).json({ message: "Default role not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [user] = await db.insert(users).values({
      username,
      password: hashedPassword,
      roleId: defaultRole.id,
      isActive: true,
      metadata: {}
    }).returning();

    // Fetch the complete user data with role
    const userWithRole = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id),
      with: {
        role: true
      }
    });

    // Start session
    req.session.userId = user.id;
    console.log('Session after registration:', req.session);

    res.status(201).json({ 
      id: user.id, 
      username: user.username,
      role: userWithRole?.role.name || UserRole.USER
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: "Registration failed", details: error instanceof Error ? error.message : String(error) });
  }
});

router.post("/api/auth/login", async (req, res) => {
  console.log('Login request body:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
      with: {
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    req.session.userId = user.id;
    console.log('Session after login:', req.session);

    res.json({ 
      id: user.id, 
      username: user.username,
      role: user.role.name
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Login failed", details: error instanceof Error ? error.message : String(error) });
  }
});

router.post("/api/auth/logout", (req, res) => {
  console.log('Logout request - Current session:', req.session);
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ success: true });
  });
});

router.get("/api/auth/user", requireAuth, (req, res) => {
  console.log('Get user request - Current session:', req.session);
  const user = req.user;

  res.json({ 
    id: user.id, 
    username: user.username,
    role: user.role.name 
  });
});

export { router as authRouter };