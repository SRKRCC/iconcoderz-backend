import dotenv from 'dotenv';
import { z } from 'zod';
import { getSecret } from './secrets.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  BASE_URL_CLIENT: z.string().default('http://localhost:5173'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => issue.path.join('.')).join(', ');
      throw new Error(`Invalid environment variables: ${missingVars}`);
    }
    throw error;
  }
};

const env = parseEnv();

export const config = {
  env: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  clientUrl: env.BASE_URL_CLIENT,
  db: {
    url: env.DATABASE_URL,
  },
  cors: {
    origin: env.NODE_ENV === 'production'
      ? [
          'https://iconcoderz.srkrcodingclub.in',
          'https://www.iconcoderz.srkrcodingclub.in',
          env.BASE_URL_CLIENT,
        ]
      : [env.BASE_URL_CLIENT, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'srkr-iconcoderz',
    expiresIn: '1d',
  },
  qr: {
    secretKey: process.env.QR_SECRET_KEY || 'iconcoderz-secret-2026',
  },
  services: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    smtp: {
      host: process.env.SMTP_HOST || '',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
  initialized: false,
};


export async function initConfig() {
  if (config.initialized) return;

  if (config.env === 'production') {
    console.log('Fetching secrets from AWS Secrets Manager...');
    
    const dbSecrets = await getSecret('iconcoderz/prod/db-url');
    if (dbSecrets && dbSecrets.url) config.db.url = dbSecrets.url;

    const cloudinarySecrets = await getSecret('iconcoderz/prod/cloudinary-api');
    if (cloudinarySecrets) {
      config.services.cloudinary.cloudName = cloudinarySecrets.cloud_name;
      config.services.cloudinary.apiKey = cloudinarySecrets.api_key;
      config.services.cloudinary.apiSecret = cloudinarySecrets.api_secret;
    }

    const smtpSecrets = await getSecret('iconcoderz/prod/smtp-credentials');
    if (smtpSecrets) {
      config.services.smtp.host = smtpSecrets.host;
      config.services.smtp.user = smtpSecrets.user;
      config.services.smtp.pass = smtpSecrets.password;
    }

    const jwtSecrets = await getSecret('iconcoderz/prod/jwt-config');
    if (jwtSecrets && jwtSecrets.secret) {
      config.jwt.secret = jwtSecrets.secret;
    }

    const clientSecrets = await getSecret('iconcoderz/prod/client-config');
    if (clientSecrets && clientSecrets.base_url) {
      config.clientUrl = clientSecrets.base_url;
      // Update CORS origins with production client URL
      config.cors.origin = [
        clientSecrets.base_url,
        'https://www.iconcoderz.srkrcodingclub.in',
        'https://iconcoderz.srkrcodingclub.in',
      ];
    }

    const qrSecrets = await getSecret('iconcoderz/prod/qr-config');
    if (qrSecrets && qrSecrets.secret_key) {
      config.qr.secretKey = qrSecrets.secret_key;
    }
  }

  config.initialized = true;
}
