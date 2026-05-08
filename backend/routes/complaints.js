import { Router } from "express";
import { createComplaint, getComplaintDetails, getDepartments, getMyComplaints } from "../controllers/complaintController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getMyComplaints);
router.get("/departments", authMiddleware, getDepartments);
router.post("/", authMiddleware, createComplaint);
router.post("/file", authMiddleware, createComplaint);
router.get("/:id", authMiddleware, getComplaintDetails);

export default router;
