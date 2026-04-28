import { Router } from "express";
import {
	getCategories,
	loginAdmin,
	loginStudent,
	registerStudent
} from "../controllers/authController.js";

const router = Router();

router.post("/register", registerStudent);
router.post("/login/student", loginStudent);
router.post("/login/admin", loginAdmin);
router.get("/categories", getCategories);

export default router;
