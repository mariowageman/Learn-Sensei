import { Router } from "express";
import { db } from "@db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "../middleware/rbac";
import { UserRole } from "@/lib/rbac";
import bcrypt from "bcrypt";

const router = Router();

// Get all users (admin only)
router.get("/api/users", requireRole([UserRole.ADMIN]), async (req, res) => {
  try {
    const allUsers = await db.query.users.findMany({
      with: {
        role: true,
      },
    });
    
    // Remove sensitive information
    const sanitizedUsers = allUsers.map(({ password, ...user }) => user);
    res.json(sanitizedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Update user (admin only)
router.patch(
  "/api/users/:userId",
  requireRole([UserRole.ADMIN]),
  async (req, res) => {
    const { userId } = req.params;
    const { username, roleId } = req.body;

    try {
      // Check if username is already taken
      if (username) {
        const existingUser = await db.query.users.findFirst({
          where: (users, { eq, and, ne }) => 
            and(
              eq(users.username, username),
              ne(users.id, parseInt(userId))
            ),
        });

        if (existingUser) {
          return res.status(400).json({ message: "Username already taken" });
        }
      }

      const [updatedUser] = await db
        .update(users)
        .set({ 
          username: username,
          roleId: roleId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, parseInt(userId)))
        .returning();

      const userWithRole = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, updatedUser.id),
        with: {
          role: true,
        },
      });

      // Remove sensitive information
      const { password, ...sanitizedUser } = userWithRole!;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  }
);

// Delete user (admin only)
router.delete(
  "/api/users/:userId",
  requireRole([UserRole.ADMIN]),
  async (req, res) => {
    const { userId } = req.params;

    try {
      // Prevent deleting the last admin user
      const adminUsers = await db.query.users.findMany({
        where: (users, { eq }) => eq(users.roleId, 1), // Assuming 1 is admin role ID
      });

      const targetUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, parseInt(userId)),
      });

      if (targetUser?.roleId === 1 && adminUsers.length === 1) {
        return res.status(400).json({ 
          message: "Cannot delete the last admin user" 
        });
      }

      await db
        .delete(users)
        .where(eq(users.id, parseInt(userId)));

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  }
);

export { router as usersRouter };
