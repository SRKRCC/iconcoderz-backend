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
    
    const dbSecrets = await getSecret('iconcoderz/db-url');
    if (dbSecrets && dbSecrets.url) config.db.url = dbSecrets.url;

    const cloudinarySecrets = await getSecret('iconcoderz/cloudinary-api');
    if (cloudinarySecrets) {
      config.services.cloudinary.cloudName = cloudinarySecrets.cloud_name;
      config.services.cloudinary.apiKey = cloudinarySecrets.api_key;
      config.services.cloudinary.apiSecret = cloudinarySecrets.api_secret;
    }

    const smtpSecrets = await getSecret('iconcoderz/smtp-credentials');
    if (smtpSecrets) {
      config.services.smtp.host = smtpSecrets.host;
      config.services.smtp.user = smtpSecrets.user;
      config.services.smtp.pass = smtpSecrets.password;
    }
  }

  config.initialized = true;
}
