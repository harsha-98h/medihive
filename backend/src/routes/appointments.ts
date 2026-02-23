import { Router, Request, Response } from "express";
import { pool } from "../db";
import { authenticate } from "../middleware/auth";

const router = Router();

// GET /api/appointments - get all appointments for logged in patient
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const patientResult = await pool.query(
      "SELECT patient_id FROM patient_profiles WHERE user_id = $1",
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const patientId = patientResult.rows[0].patient_id;

    const result = await pool.query(
      `SELECT appointment_id, doctor_id, appointment_time, status, notes
       FROM appointments
       WHERE patient_id = $1
       ORDER BY appointment_time DESC`,
      [patientId]
    );

    res.json({ appointments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/appointments - book appointment
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { doctor_id, appointment_time, notes } = req.body;

    const patientResult = await pool.query(
      "SELECT patient_id FROM patient_profiles WHERE user_id = $1",
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const patientId = patientResult.rows[0].patient_id;

    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_time, status, notes)
       VALUES ($1, $2, $3, 'scheduled', $4)
       RETURNING appointment_id`,
      [patientId, doctor_id, appointment_time, notes || null]
    );

    res.status(201).json({
      message: "Appointment booked",
      appointment_id: result.rows[0].appointment_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/appointments/:id/cancel - cancel appointment
router.patch("/:id/cancel", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const appointmentId = parseInt(req.params.id);

    const patientResult = await pool.query(
      "SELECT patient_id FROM patient_profiles WHERE user_id = $1",
      [userId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    const patientId = patientResult.rows[0].patient_id;

    const result = await pool.query(
      `UPDATE appointments
       SET status = 'cancelled'
       WHERE appointment_id = $1 AND patient_id = $2
       RETURNING appointment_id`,
      [appointmentId, patientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
