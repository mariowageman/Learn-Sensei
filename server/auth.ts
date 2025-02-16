
import { Router } from "express";
import { db } from "@db";
import { users } from "@db/schema";

const router = Router();

router.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [user] = await db.insert(users).values({
      email,
      password: await bcrypt.hash(password, 10)
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
    // Note: Add password verification in step 2
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Login failed" });
  }
});

export { router as authRouter };
