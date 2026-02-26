import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { testConnection } from "./database/db";
import { runMigrations } from "./database/migrate";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import adminRoutes from "./routes/adminRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// IMPORTANT: trust proxy (Railway, Vercel, etc.)
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:3000",
  "https://medihive-nine.vercel.app",
  "https://medihive-nine.vercel.app/admin",
];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(compression());

// rate limiter AFTER trust proxy
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  // be tolerant if X-Forwarded-For is weird
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "MediHive API is running" });
});

app.listen(PORT, async () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  try {
    await runMigrations();
    await testConnection();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
});
