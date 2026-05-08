import { Router } from "express";
import { getAdmins, getAllComplaints, updateComplaintStatus } from "../controllers/adminController.js";
import { adminOnly, authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/complaints", authMiddleware, adminOnly, getAllComplaints);
router.get("/admins", authMiddleware, adminOnly, getAdmins);
router.patch("/complaints/:id/status", authMiddleware, adminOnly, updateComplaintStatus);

export default router;
