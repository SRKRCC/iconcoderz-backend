import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "../config/index.js";
import { swaggerSpec } from "../config/swagger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadSwaggerSpec = () => {
  if (config.env === "production") {
    try {
      const specPath = path.join(__dirname, "../src/generated/swagger.json");
      if (fs.existsSync(specPath)) {
        return JSON.parse(fs.readFileSync(specPath, "utf8"));
      }
    } catch (error) {
      console.error("Failed to load generated Swagger spec:", error);
    }
  }
  return swaggerSpec;
}; 