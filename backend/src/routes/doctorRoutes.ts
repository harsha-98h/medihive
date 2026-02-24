import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import { createDoctorProfile, listDoctors } from "../controllers/doctorController";
import {
  createDoctorRating,
  getDoctorRatingStats,
} from "../controllers/doctorRatingController";

const router = Router();

router.post(
  "/profile",
  authenticate,
  requireRole(["doctor", "admin"]),
  createDoctorProfile
);

router.get("/", listDoctors);

// ratings
router.post(
  "/:id/ratings",
  authenticate,
  requireRole(["patient"]),
  createDoctorRating
);
router.get("/:id/ratings", getDoctorRatingStats);

export default router;
