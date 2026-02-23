import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import { createDoctorProfile, listDoctors } from "../controllers/doctorController";

const router = Router();

router.post(
  "/profile",
  authenticate,
  requireRole(["doctor", "admin"]),
  createDoctorProfile
);

router.get("/", listDoctors);

export default router;
