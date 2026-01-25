import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middlewares/auth.js";

const router: Router = Router();

// Public route
router.post("/login", AdminController.login);

router.get(
  "/dashboard/stats",
  authenticateAdmin,
  AdminController.getDashboardStats,
);
router.get("/users", authenticateAdmin, AdminController.getAllUsers);
router.get("/users/:id", authenticateAdmin, AdminController.getUserById);
router.patch(
  "/users/:id/payment-status",
  authenticateAdmin,
  AdminController.updatePaymentStatus,
);

export { router as adminRoutes };
