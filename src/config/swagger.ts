import swaggerJsdoc from "swagger-jsdoc";
import { config } from "./index.js";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IconCoderz API",
      version: "1.0.0",
      description: "API documentation for IconCoderz Backend",
      contact: {
        name: "SRKR Coding Club",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/v1`,
        description: "Local server",
      },
      {
        url: `https://api.iconcoderz.srkrcodingclub.com/api/v1`,
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/app.ts", "./src/doc/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
