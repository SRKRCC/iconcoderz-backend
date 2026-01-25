import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { config } from "./index.js";

const region = "ap-south-1";
const client = new SecretsManagerClient({ region });

export async function getSecret(secretId: string): Promise<any> {
  if (
    config.env === "development" &&
    !process.env.AWS_ACCESS_KEY_ID &&
    !process.env.AWS_PROFILE
  ) {
    console.warn(
      `[Secrets] Missing AWS credentials in dev. Returning null for ${secretId}`,
    );
    return null;
  }

  try {
    const command = new GetSecretValueCommand({ SecretId: secretId });
    const response = await client.send(command);

    if (response.SecretString) {
      try {
        return JSON.parse(response.SecretString);
      } catch (e) {
        return response.SecretString;
      }
    }
    return null;
  } catch (error) {
    if (config.env === "development") {
      console.warn(
        `[Secrets] Failed to fetch ${secretId}: ${(error as Error).message}`,
      );
      return null;
    }
    console.error(`[Secrets] Error fetching ${secretId}:`, error);
    throw error;
  }
}
