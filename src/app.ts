import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import redoc from "redoc-express";
import { config } from "./config/index.js";
import { loadSwaggerSpec } from "./utils/loadSwagger.js";
import { registrationRoutes } from "./routes/registration.routes.js";
import { adminRoutes } from "./routes/admin.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { Logger } from "./utils/logger.js";

const app: express.Application = express();
const spec = loadSwaggerSpec();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://unpkg.com",
          "https://cdn.jsdelivr.net",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        workerSrc: ["'self'", "blob:"],
      },
    },
  }),
);

app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 86400, // 24 hours
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(spec));

app.get(
  "/redoc",
  (redoc as any)({
    title: "API Docs",
    specUrl: "/api-docs.json",
  }),
);

app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(spec);
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    Logger.http(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

app.use("/api/v1/registration", registrationRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/attendance", attendanceRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: config.env,
  });
});

app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

app.use(errorHandler);

export { app };
