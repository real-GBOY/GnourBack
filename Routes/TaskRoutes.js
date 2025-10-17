/** @format */

const express = require("express");
const router = express.Router();
const TaskController = require("../Controllers/TaskController");
const { handleupload } = require("../Middlewares/UploadMiddleWare");
const {
	verifyToken,
	verifyPermission,
} = require("../Middlewares/AuthMiddleWare");
const {
	checkResourceAccess,
	checkItemAccess,
	addAccessHelpers,
} = require("../Middlewares/AccessControlMiddleware");
const Permissions = require("../config/Permissions");
const Task = require("../Models/Task");

// Add access control helpers to all routes
router.use(addAccessHelpers);

// Basic CRUD routes with access control
router.get(
	"/",
	verifyToken,
	verifyPermission(Permissions.ViewTask),
	checkResourceAccess("tasks"),
	TaskController.getTasks
);

router.get(
	"/:id",
	verifyToken,
	verifyPermission(Permissions.ViewTask),
	checkItemAccess("tasks", () => Task),
	TaskController.getTaskById
);

router.post(
	"/",
	verifyToken,
	verifyPermission(Permissions.CreateTask),
	handleupload,
	TaskController.createTask
);

router.patch(
	"/:id",
	verifyToken,
	verifyPermission(Permissions.EditTask),
	checkItemAccess("tasks", () => Task),
	TaskController.updateTask
);

router.delete(
	"/:id",
	verifyToken,
	verifyPermission(Permissions.DeleteTask),
	checkItemAccess("tasks", () => Task),
	TaskController.deleteTask
);

// File upload routes with access control
router.post(
	"/:taskId/upload-file",
	verifyToken,
	verifyPermission(Permissions.UploadFile),
	checkItemAccess("tasks", () => Task),
	handleupload,
	TaskController.uploadFileToTask
);

router.delete(
	"/:taskId/files/:fileId",
	verifyToken,
	verifyPermission(Permissions.EditTask),
	checkItemAccess("tasks", () => Task),
	TaskController.removeFileFromTask
);

// Task assignment routes with access control
router.post(
	"/:taskId/assign",
	verifyToken,
	verifyPermission(Permissions.EditTask),
	checkItemAccess("tasks", () => Task),
	TaskController.assignTaskToUsers
);

router.post(
	"/:taskId/add-users",
	verifyToken,
	verifyPermission(Permissions.EditTask),
	checkItemAccess("tasks", () => Task),
	TaskController.addUsersToTask
);

router.post(
	"/:taskId/remove-users",
	verifyToken,
	verifyPermission(Permissions.EditTask),
	checkItemAccess("tasks", () => Task),
	TaskController.removeUsersFromTask
);

module.exports = router;
