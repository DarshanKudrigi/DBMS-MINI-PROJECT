import { Router } from "express";
import { createComplaint, getComplaintDetails, getMyComplaints } from "../controllers/complaintController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getMyComplaints);
router.post("/", authMiddleware, createComplaint);
router.post("/file", authMiddleware, createComplaint);
router.get("/:id", authMiddleware, getComplaintDetails);

export default router;
