import { Request, Response } from "express";
import { pool } from "../database/db";
import { sendAppointmentConfirmation } from "../services/emailService";

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== "patient") {
      return res.status(403).json({ message: "Only patients can book" });
    }

    const { doctor_id, appointment_time } = req.body;

    if (!doctor_id || !appointment_time) {
      return res
        .status(400)
        .json({ message: "doctor_id and appointment_time are required" });
    }

    const patientResult = await pool.query(
      "SELECT patient_id FROM patient_profiles WHERE user_id = $1",
      [user.user_id]
    );
    if (patientResult.rowCount === 0) {
      return res
        .status(400)
        .json({ message: "Patient profile not found for this user" });
    }
    const patient_id = patientResult.rows[0].patient_id;

    const apptResult = await pool.query(
      `INSERT INTO appointments 
       (patient_id, doctor_id, appointment_time, status)
       VALUES ($1, $2, $3, 'scheduled')
       RETURNING appointment_id, patient_id, doctor_id, appointment_time, status`,
      [patient_id, doctor_id, appointment_time]
    );

    const appointment = apptResult.rows[0];
    try {
      const patientInfo = await pool.query(
        "SELECT p.first_name, p.last_name, u.email FROM patient_profiles p JOIN users u ON p.user_id = u.user_id WHERE p.patient_id = $1",
        [patient_id]
      );
      const doctorInfo = await pool.query(
        "SELECT first_name, last_name, specialty FROM doctor_profiles WHERE doctor_id = $1",
        [doctor_id]
      );
      if (patientInfo.rows[0] && doctorInfo.rows[0]) {
        const p = patientInfo.rows[0];
        const d = doctorInfo.rows[0];
        await sendAppointmentConfirmation({
          patientEmail: p.email,
          patientName: p.first_name + " " + p.last_name,
          doctorName: d.first_name + " " + d.last_name,
          specialty: d.specialty,
          appointmentTime: appointment.appointment_time
        });
      }
    } catch (emailErr) {
      console.error("Email sending failed (non-critical):", emailErr);
    }
    return res.status(201).json({ appointment });
  } catch (err: any) {
    console.error("createAppointment error:", err);

    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "You already have an appointment at that time" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};

export const listMyAppointments = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.role === "patient") {
      const patientResult = await pool.query(
        "SELECT patient_id FROM patient_profiles WHERE user_id = $1",
        [user.user_id]
      );
      if (patientResult.rowCount === 0) {
        return res
          .status(400)
          .json({ message: "Patient profile not found for this user" });
      }
      const patient_id = patientResult.rows[0].patient_id;

      const result = await pool.query(
        `SELECT a.appointment_id,
                a.appointment_time,
                a.status,
                d.first_name AS doctor_first_name,
                d.last_name  AS doctor_last_name,
                d.specialty
         FROM appointments a
         JOIN doctor_profiles d ON a.doctor_id = d.doctor_id
         WHERE a.patient_id = $1 AND a.deleted_at IS NULL
         ORDER BY a.appointment_time DESC`,
        [patient_id]
      );

      return res.json({ appointments: result.rows });
    } else if (user.role === "doctor") {
      const doctorResult = await pool.query(
        "SELECT doctor_id FROM doctor_profiles WHERE user_id = $1",
        [user.user_id]
      );
      if (doctorResult.rowCount === 0) {
        return res
          .status(400)
          .json({ message: "Doctor profile not found for this user" });
      }
      const doctor_id = doctorResult.rows[0].doctor_id;

      const result = await pool.query(
        `SELECT a.appointment_id,
                a.appointment_time,
                a.status,
                p.first_name AS patient_first_name,
                p.last_name  AS patient_last_name
         FROM appointments a
         JOIN patient_profiles p ON a.patient_id = p.patient_id
         WHERE a.doctor_id = $1 AND a.deleted_at IS NULL
         ORDER BY a.appointment_time DESC`,
        [doctor_id]
      );

      return res.json({ appointments: result.rows });
    } else {
      return res.status(403).json({ message: "Admins use admin reports" });
    }
  } catch (err) {
    console.error("listMyAppointments error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const apptResult = await pool.query(
      "SELECT appointment_id, patient_id, doctor_id, status FROM appointments WHERE appointment_id = $1 AND deleted_at IS NULL",
      [id]
    );

    if (apptResult.rowCount === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appt = apptResult.rows[0];

    if (user.role === "patient") {
      const patientResult = await pool.query(
        "SELECT patient_id FROM patient_profiles WHERE user_id = $1",
        [user.user_id]
      );
      if (
        patientResult.rowCount === 0 ||
        patientResult.rows[0].patient_id !== appt.patient_id
      ) {
        return res
          .status(403)
          .json({ message: "You can cancel only your appointments" });
      }
    } else if (user.role === "doctor") {
      const doctorResult = await pool.query(
        "SELECT doctor_id FROM doctor_profiles WHERE user_id = $1",
        [user.user_id]
      );
      if (
        doctorResult.rowCount === 0 ||
        doctorResult.rows[0].doctor_id !== appt.doctor_id
      ) {
        return res
          .status(403)
          .json({ message: "You can cancel only your appointments" });
      }
    }

    await pool.query(
      "UPDATE appointments SET status = 'canceled', updated_at = NOW() WHERE appointment_id = $1",
      [id]
    );

    return res.json({ message: "Appointment canceled" });
  } catch (err) {
    console.error("cancelAppointment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const markAppointmentDone = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Only doctors can mark appointments as done' });
    }
    const doctorResult = await pool.query(
      'SELECT doctor_id FROM doctor_profiles WHERE user_id = $1',
      [user.user_id]
    );
    if (doctorResult.rowCount === 0) {
      return res.status(400).json({ message: 'Doctor profile not found' });
    }
    const doctor_id = doctorResult.rows[0].doctor_id;
    const apptResult = await pool.query(
      'SELECT appointment_id, doctor_id FROM appointments WHERE appointment_id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (apptResult.rowCount === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (apptResult.rows[0].doctor_id !== doctor_id) {
      return res.status(403).json({ message: 'Not your appointment' });
    }
    await pool.query(
      "UPDATE appointments SET status = 'done', updated_at = NOW() WHERE appointment_id = $1",
      [id]
    );
    return res.json({ message: 'Appointment marked as done' });
  } catch (err) {
    console.error('markAppointmentDone error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
