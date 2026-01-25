import { Request, Response, NextFunction } from "express";
import { UserSchema } from "../dtos/user.dto.js";
import { RegistrationService } from "../services/registration.service.js";
import { CloudinaryService } from "../services/cloudinary.service.js";
import { sendResponse } from "../utils/response.js";

export class RegistrationController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UserSchema.parse(req.body);
      const user = await RegistrationService.register(data);
      sendResponse(res, 201, "Registration successful", user);
    } catch (error) {
      next(error);
    }
  }

  static async getUploadSignature(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const signature = CloudinaryService.generateSignature();
      sendResponse(res, 200, "Upload signature generated", signature);
    } catch (error) {
      next(error);
    }
  }
}
