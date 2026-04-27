import { Router } from "express";
import { getAllComplaints, updateComplaintStatus } from "../controllers/adminController.js";
import { adminOnly, authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/complaints", authMiddleware, adminOnly, getAllComplaints);
router.patch("/complaints/:id/status", authMiddleware, adminOnly, updateComplaintStatus);

export default router;
