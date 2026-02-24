import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { getMe, updateMe } from "../controllers/userController";

const router = Router();

router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);

export default router;
