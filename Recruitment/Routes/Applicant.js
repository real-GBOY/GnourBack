/** @format */

const router = require("express").Router();
const authMiddleware = require("../../Middlewares/AuthMiddleWare");
const { apiLimiter } = require("../../Middlewares/RateLimitMiddleware");
const {
	createApplicant,
	getApplicants,
	getApplicantById,
	updateApplicant,
	deleteApplicant,
} = require("../Controllers/ApplicantController");

router.post("/", apiLimiter, createApplicant);
router.get("/", authMiddleware.verifyToken, getApplicants);
router.get("/:id", authMiddleware.verifyToken, getApplicantById);
router.patch("/:id", authMiddleware.verifyToken, updateApplicant);
router.delete("/:id", authMiddleware.verifyToken, deleteApplicant);

module.exports = router;
