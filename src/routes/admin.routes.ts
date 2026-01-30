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

router.post("/users/delete", authenticateAdmin, AdminController.deleteUsers);

router.get("/outbox", authenticateAdmin, AdminController.getAllOutbox);
router.post("/outbox/send", authenticateAdmin, AdminController.sendOutboxEmails);
router.post("/outbox/delete", authenticateAdmin, AdminController.deleteOutbox);

export { router as adminRoutes };
