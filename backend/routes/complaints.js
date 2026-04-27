import { Router } from "express";
import { createComplaint, getMyComplaints } from "../controllers/complaintController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getMyComplaints);
router.post("/", authMiddleware, createComplaint);

export default router;
