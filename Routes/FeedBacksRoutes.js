/** @format */

const express = require("express");
const router = express.Router();
const FeedBacksController = require("../Controllers/FeedBacksController");
const {
	verifyToken,
	verifyPermission,
	setUserData,
} = require("../Middlewares/AuthMiddleWare");
const {
	checkResourceAccess,
	checkItemAccess,
	addAccessHelpers,
} = require("../Middlewares/AccessControlMiddleware");
const Permissions = require("../config/Permissions");
const Feedback = require("../Models/FeedBacks");

// Add user data and access helpers
router.use(setUserData);
router.use(addAccessHelpers);

// CRUD with access control
router.post(
	"/",
	verifyToken,
	verifyPermission(Permissions.CreateFeeBack),
	FeedBacksController.createFeedback
);

router.get(
	"/",
	verifyToken,
	verifyPermission(Permissions.ViewFeedback),
	checkResourceAccess("feedbacks"),
	FeedBacksController.getAllFeedback
);

router.get(
	"/:id",
	verifyToken,
	verifyPermission(Permissions.ViewFeedback),
	checkItemAccess("feedbacks", () => Feedback),
	FeedBacksController.getFeedbackById
);

router.patch(
	"/:id",
	verifyToken,
	verifyPermission(Permissions.EditFeedback),
	checkItemAccess("feedbacks", () => Feedback),
	FeedBacksController.updateFeedback
);

router.delete(
	"/:id",
	verifyToken,
	verifyPermission(Permissions.DeleteFeedback),
	checkItemAccess("feedbacks", () => Feedback),
	FeedBacksController.deleteFeedback
);

// Additional specialized routes
router.get(
	"/user/:userId",
	verifyToken,
	verifyPermission(Permissions.ViewFeedback),
	checkResourceAccess("feedbacks"),
	FeedBacksController.getFeedbackByUser
);
router.get(
	"/category/:category",
	verifyToken,
	verifyPermission(Permissions.ViewFeedback),
	checkResourceAccess("feedbacks"),
	FeedBacksController.getFeedbackByCategory
);
router.get(
	"/task/:taskId",
	verifyToken,
	verifyPermission(Permissions.ViewFeedback),
	checkResourceAccess("feedbacks"),
	FeedBacksController.getFeedbackByTask
);
router.get(
	"/meeting/:meetingId",
	verifyToken,
	verifyPermission(Permissions.ViewFeedback),
	checkResourceAccess("feedbacks"),
	FeedBacksController.getFeedbackByMeeting
);
router.get(
	"/attendance/:attendanceId",
	verifyToken,
	verifyPermission(Permissions.ViewFeedback),
	checkResourceAccess("feedbacks"),
	FeedBacksController.getFeedbackByAttendance
);

module.exports = router;
