/** @format */

const express = require("express");
const router = express.Router();
const {
	createAchievement,
	getAllAchievements,
	getAchievementById,
	getUserAchievements,
	updateAchievement,
	deleteAchievement,
	getAchievementStats,
	uploadSupportingDocument,
	uploadAchievementPhoto,
	removeFile,
} = require("../Controllers/AchievementController");

const {
	verifyToken,
	verifyPermission,
} = require("../Middlewares/AuthMiddleWare");
const { handleupload } = require("../Middlewares/UploadMiddleWare");
const Permissions = require("../config/Permissions");

// ==================== PUBLIC ROUTES ====================
// These routes are public but will use access control filters in the controller if user is authenticated
router.get("/", getAllAchievements);
router.get("/stats", getAchievementStats);

// ==================== PROTECTED ROUTES ====================

router.use(verifyToken);

router.get("/:id", getAchievementById);

router.get("/user/:userId", getUserAchievements);

router.post(
	"/",
	verifyPermission(Permissions.CreateAchievement),
	handleupload,
	createAchievement
);

router.patch(
	"/:id",
	verifyPermission(Permissions.EditAchievement),
	updateAchievement
);

router.delete(
	"/:id",
	verifyPermission(Permissions.DeleteAchievement),
	deleteAchievement
);

router.post(
	"/:achievementId/supporting-document",
	verifyPermission(Permissions.EditAchievement),
	handleupload,
	uploadSupportingDocument
);

// Upload achievement photo - requires EditAchievement permission
router.post(
	"/:achievementId/photo",
	verifyPermission(Permissions.EditAchievement),
	handleupload,
	uploadAchievementPhoto
);

// Remove file - requires EditAchievement permission
router.delete(
	"/:achievementId/file/:fileType/:fileIndex",
	verifyPermission(Permissions.EditAchievement),
	removeFile
);

module.exports = router;
