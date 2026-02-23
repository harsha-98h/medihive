import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../database/db";

const ACCESS_TOKEN_EXPIRES_IN = "15m";

function signToken(payload: object) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN
  });
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, first_name, last_name } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "email, password, role required" });
    }

    if (!["patient", "doctor", "admin"].includes(role)) {
      return res.status(400).json({ message: "invalid role" });
    }

    const existing = await pool.query(
      "SELECT user_id FROM users WHERE email = $1",
      [email]
    );
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, email, role",
      [email, passwordHash, role]
    );

    const user = result.rows[0];

    // Auto-create profile based on role
    if (role === "patient") {
      await pool.query(
        `INSERT INTO patient_profiles (user_id, first_name, last_name)
         VALUES ($1, $2, $3)`,
        [user.user_id, first_name || "New", last_name || "Patient"]
      );
    } else if (role === "doctor") {
      await pool.query(
        `INSERT INTO doctor_profiles (user_id, first_name, last_name, specialty)
         VALUES ($1, $2, $3, $4)`,
        [user.user_id, first_name || "New", last_name || "Doctor", "General Practice"]
      );
    }

    const token = signToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const result = await pool.query(
      "SELECT user_id, email, password_hash, role FROM users WHERE email = $1 AND deleted_at IS NULL",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      user_id: user.user_id,
      email: user.email,
      role: user.role
    });

    res.json({
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
