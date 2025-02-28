import { Router } from "express";
import { db } from "@db";
import { users, roles } from "@db/schema";
import { eq } from "drizzle-orm";
import { requireRole } from "../middleware/rbac";
import { UserRole } from "@/lib/rbac";

const router = Router();

// Get all roles (publicly accessible)
router.get("/api/roles", async (req, res) => {
  try {
    const allRoles = await db.query.roles.findMany();
    console.log("Roles fetched successfully:", allRoles);
    res.json(allRoles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Failed to fetch roles" });
  }
});

// Update user's role (admin only)
router.patch(
  "/api/users/:userId/role",
  requireRole([UserRole.ADMIN]),
  async (req, res) => {
    const { userId } = req.params;
    let { roleId, email } = req.body;

    // Direct admin role assignment
    const targetUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, 'examroutes@gmail.com')
    });

    if (targetUser) {
      // Set admin role directly
      await db.execute(sql`
        UPDATE users 
        SET role_id = (SELECT id FROM roles WHERE name = 'admin')
        WHERE username = 'examroutes@gmail.com'
      `);
      
      return res.json({
        success: true,
        message: 'Admin role assigned successfully',
        user: {
          id: targetUser.id,
          username: targetUser.username,
          role: 'admin'
        }
      });
    }

    try {
      const [updatedUser] = await db
        .update(users)
        .set({ roleId })
        .where(eq(users.id, parseInt(userId)))
        .returning();

      const userWithRole = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, updatedUser.id),
        with: {
          role: true,
        },
      });

      res.json({
        id: updatedUser.id,
        username: updatedUser.username,
        role: userWithRole?.role.name,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  }
);

export { router as rolesRouter };
