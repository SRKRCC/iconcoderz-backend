import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller.js";
import { authenticateAdmin } from "../middlewares/auth.js";

const router: Router = Router();

router.use(authenticateAdmin);

router.post("/scan", AttendanceController.scanQR);
router.post("/manual", AttendanceController.manualCheckIn);
router.get("/stats", AttendanceController.getStats);
router.get("/recent", AttendanceController.getRecentScans);
router.get("/list", AttendanceController.getAttendanceList);

export default router;
