import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createAppointment,
  listMyAppointments,
  cancelAppointment,
  markAppointmentDone
} from "../controllers/appointmentController";

const router = Router();

router.post("/", authenticate, createAppointment);
router.get("/", authenticate, listMyAppointments);
router.patch("/:id/cancel", authenticate, cancelAppointment);
router.patch("/:id/done", authenticate, markAppointmentDone);

export default router;
