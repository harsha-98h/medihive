import { Request, Response } from "express";
import { pool } from "../database/db";

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (user.role === "patient") {
      const result = await pool.query(
        `SELECT p.first_name, p.last_name, p.phone_number, p.address,
                u.email, u.role, u.user_id
         FROM patient_profiles p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.user_id = $1`,
        [user.user_id]
      );
      if (result.rowCount === 0) return res.json({ user });
      return res.json({ user: result.rows[0] });
    }

    if (user.role === "doctor") {
      const result = await pool.query(
        `SELECT d.first_name, d.last_name, d.specialty, d.phone_number, d.address,
                u.email, u.role, u.user_id
         FROM doctor_profiles d
         JOIN users u ON d.user_id = u.user_id
         WHERE d.user_id = $1`,
        [user.user_id]
      );
      if (result.rowCount === 0) return res.json({ user });
      return res.json({ user: result.rows[0] });
    }

    return res.json({ user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const { first_name, last_name, phone_number, address } = req.body;

    if (user.role === "patient") {
      await pool.query(
        `UPDATE patient_profiles SET
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone_number = COALESCE($3, phone_number),
          address = COALESCE($4, address),
          updated_at = NOW()
         WHERE user_id = $5`,
        [first_name || null, last_name || null, phone_number || null, address || null, user.user_id]
      );
    } else if (user.role === "doctor") {
      await pool.query(
        `UPDATE doctor_profiles SET
          first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone_number = COALESCE($3, phone_number),
          address = COALESCE($4, address),
          updated_at = NOW()
         WHERE user_id = $5`,
        [first_name || null, last_name || null, phone_number || null, address || null, user.user_id]
      );
    }

    return res.json({ message: "Profile updated" });
  } catch (err) {
    console.error("updateMe error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

