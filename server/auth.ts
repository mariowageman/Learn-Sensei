
import { Router, Request, Response, NextFunction } from "express";
import { db } from "@db";
import { users } from "@db/schema";
import bcrypt from "bcrypt";

const router = Router();

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId)
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Authentication failed" });
  }
};

router.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword
    }).returning();

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "Registration failed" });
  }
});

router.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email)
    });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ id: user.id, email: user.email });
  } catch (error) {
    res.status(401).json({ error: "Login failed" });
  }
});

export { router as authRouter };
