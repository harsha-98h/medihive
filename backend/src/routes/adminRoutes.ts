import { Router } from "express";
import { authenticate, requireRole } from "../middleware/authMiddleware";
import { pool } from "../database/db";
import { Request, Response } from "express";

const router = Router();

router.get("/stats", authenticate, requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const users = await pool.query("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL");
    const doctors = await pool.query("SELECT COUNT(*) FROM doctor_profiles WHERE deleted_at IS NULL");
    const appointments = await pool.query("SELECT COUNT(*) FROM appointments WHERE deleted_at IS NULL");
    const scheduled = await pool.query("SELECT COUNT(*) FROM appointments WHERE status = 'scheduled' AND deleted_at IS NULL");
    res.json({
      total_users: parseInt(users.rows[0].count),
      total_doctors: parseInt(doctors.rows[0].count),
      total_appointments: parseInt(appointments.rows[0].count),
      scheduled_appointments: parseInt(scheduled.rows[0].count)
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users", authenticate, requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT user_id, email, role, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC"
    );
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/appointments", authenticate, requireRole(["admin"]), async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT a.appointment_id, a.appointment_time, a.status,
             p.first_name AS patient_first_name, p.last_name AS patient_last_name,
             d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
             d.specialty
      FROM appointments a
      JOIN patient_profiles p ON a.patient_id = p.patient_id
      JOIN doctor_profiles d ON a.doctor_id = d.doctor_id
      WHERE a.deleted_at IS NULL
      ORDER BY a.appointment_time DESC
    `);
    res.json({ appointments: result.rows });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
