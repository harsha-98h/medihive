import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/me", authenticate, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
