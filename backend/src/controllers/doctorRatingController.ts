import { Request, Response } from "express";
import { pool } from "../database/db";

export const createDoctorRating = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    if (!user || user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can rate doctors" });
    }

    const doctorId = parseInt(req.params.id, 10);
    const { appointment_id, rating, comment } = req.body;

    if (!doctorId || !appointment_id || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Ensure the appointment belongs to this patient and doctor and is completed
    const apptCheck = await pool.query(
      `SELECT a.appointment_id
       FROM appointments a
       JOIN patient_profiles p ON a.patient_id = p.patient_id
       WHERE a.appointment_id = $1
         AND a.doctor_id = $2
         AND p.user_id = $3
         AND a.status = 'completed'`,
      [appointment_id, doctorId, user.user_id]
    );

    if (apptCheck.rowCount === 0) {
      return res
        .status(400)
        .json({ message: "You can only rate completed appointments you attended" });
    }

    const result = await pool.query(
      `INSERT INTO doctor_ratings (doctor_id, patient_id, appointment_id, rating, comment)
       SELECT a.doctor_id, a.patient_id, a.appointment_id, $1, $2
       FROM appointments a
       WHERE a.appointment_id = $3
       RETURNING rating_id, rating, comment, created_at`,
      [rating, comment || null, appointment_id]
    );

    res.status(201).json({ rating: result.rows[0] });
  } catch (err) {
    console.error("createDoctorRating error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDoctorRatingStats = async (req: Request, res: Response) => {
  try {
    const doctorId = parseInt(req.params.id, 10);
    if (!doctorId) {
      return res.status(400).json({ message: "Invalid doctor id" });
    }

    const stats = await pool.query(
      `SELECT
         COALESCE(AVG(rating), 0) AS avg_rating,
         COUNT(*) AS rating_count
       FROM doctor_ratings
       WHERE doctor_id = $1`,
      [doctorId]
    );

    res.json({ stats: stats.rows[0] });
  } catch (err) {
    console.error("getDoctorRatingStats error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
