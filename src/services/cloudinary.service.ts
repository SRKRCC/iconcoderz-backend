import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";

cloudinary.config({
  cloud_name: config.services.cloudinary.cloudName,
  api_key: config.services.cloudinary.apiKey,
  api_secret: config.services.cloudinary.apiSecret,
});

export class CloudinaryService {
  static generateSignature(folder: string = "iconcoderz-payments") {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      folder,
      timestamp,
    };

    const sortedParams = Object.entries(paramsToSign)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const stringToSign = `${sortedParams}${config.services.cloudinary.apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    return {
      timestamp,
      signature,
      apiKey: config.services.cloudinary.apiKey,
      cloudName: config.services.cloudinary.cloudName,
    };
  }
}
