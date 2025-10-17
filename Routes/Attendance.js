/** @format */

const express = require("express");
const router = express.Router();
const AttendanceController = require("../Controllers/AttendanceController");
const authMiddleware = require("../Middlewares/AuthMiddleWare");
const Permissions = require("../config/Permissions");

// Basic CRUD routes
router.post(
	"/",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.CreateAttendance),
	AttendanceController.createAttendance
);
router.get(
	"/",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.ViewAttendance),
	AttendanceController.getAllAttendance
);
router.get(
	"/:id",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.ViewAttendance),
	AttendanceController.getAttendanceById
);
router.patch(
	"/:id",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.EditAttendance),
	AttendanceController.updateAttendance
);
router.delete(
	"/:id",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.DeleteAttendance),
	AttendanceController.deleteAttendance
);

// Additional routes
router.get(
	"/user/:userId",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.ViewAttendance),
	AttendanceController.getAttendanceByUser
);
router.get(
	"/event/:eventId",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.ViewAttendance),
	AttendanceController.getAttendanceByEvent
);
router.patch(
	"/:id/verify",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.EditAttendance),
	AttendanceController.verifyAttendance
);
router.patch(
	"/event/:eventId/bulk-verify",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.EditAttendance),
	AttendanceController.bulkVerifyAttendance
);
router.get(
	"/event/:eventId/verification-stats",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.ViewAttendance),
	AttendanceController.getVerificationStats
);
router.patch(
	"/:id/feedback",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.EditAttendance),
	AttendanceController.addFeedback
);

module.exports = router;
