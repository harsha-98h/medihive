import { Request, Response } from "express";
import { pool } from "../database/db";

export const createDoctorProfile = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, specialty, phone_number, address } = req.body;
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!first_name || !last_name || !specialty) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO doctor_profiles 
       (user_id, first_name, last_name, specialty, phone_number, address)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING doctor_id, first_name, last_name, specialty, phone_number, address`,
      [userId, first_name, last_name, specialty, phone_number || null, address || null]
    );

    res.status(201).json({ doctor: result.rows[0] });
  } catch (err) {
    console.error("createDoctorProfile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listDoctors = async (req: Request, res: Response) => {
  try {
    const { specialty, search } = req.query;

    const conditions: string[] = ["d.deleted_at IS NULL"];
    const values: any[] = [];
    let index = 1;

    if (specialty) {
      conditions.push(`LOWER(d.specialty) = LOWER($${index++})`);
      values.push(specialty);
    }

    if (search) {
      conditions.push(
        `(LOWER(d.first_name) LIKE LOWER($${index}) OR LOWER(d.last_name) LIKE LOWER($${index}))`
      );
      values.push(`%${search}%`);
      index++;
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const result = await pool.query(
      `SELECT 
         d.doctor_id,
         d.first_name,
         d.last_name,
         d.specialty,
         d.phone_number,
         d.address,
         COALESCE(AVG(r.rating), 0) AS avg_rating,
         COUNT(r.rating_id)       AS rating_count
       FROM doctor_profiles d
       LEFT JOIN doctor_ratings r ON r.doctor_id = d.doctor_id
       ${whereClause}
       GROUP BY d.doctor_id, d.first_name, d.last_name, d.specialty, d.phone_number, d.address
       ORDER BY d.last_name ASC`,
      values
    );

    res.json({ doctors: result.rows });
  } catch (err) {
    console.error("listDoctors error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
