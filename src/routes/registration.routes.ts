import { Router } from "express";
import { RegistrationController } from "../controllers/registration.controller.js";

const router: Router = Router();

router.post("/", RegistrationController.register);
router.get("/upload-signature", RegistrationController.getUploadSignature);

export { router as registrationRoutes };
