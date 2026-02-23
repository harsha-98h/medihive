import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createAppointment,
  listMyAppointments,
  cancelAppointment
} from "../controllers/appointmentController";

const router = Router();

router.post("/", authenticate, createAppointment);
router.get("/", authenticate, listMyAppointments);
router.patch("/:id/cancel", authenticate, cancelAppointment);

export default router;
