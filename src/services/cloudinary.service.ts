import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';

export class CloudinaryService {
  static generateSignature(folder: string = 'registrations') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      config.services.cloudinary.apiSecret
    );
    
    return { 
        timestamp, 
        signature, 
        apiKey: config.services.cloudinary.apiKey,
        cloudName: config.services.cloudinary.cloudName 
    };
  }
}
