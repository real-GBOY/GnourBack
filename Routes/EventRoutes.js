/** @format */

const router = require("express").Router();

const eventController = require("../Controllers/EventControllers");
const authMiddleware = require("../Middlewares/AuthMiddleWare");
const { handleupload } = require("../Middlewares/UploadMiddleWare");
const {
	checkResourceAccess,
	checkItemAccess,
	addAccessHelpers,
} = require("../Middlewares/AccessControlMiddleware");
const Permissions = require("../config/Permissions");
const Event = require("../Models/Events");

// Add access control helpers to all routes
router.use(addAccessHelpers);

// Event routes with access control
router.post(
	"/",
	handleupload,
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.CreateEvent),
	eventController.CreateEvent
);

router.get(
	"/",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.ViewEvent),
	checkResourceAccess("events"),
	eventController.GetEvents
);

router.get(
	"/:id",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.ViewEvent),
	checkItemAccess("events", () => Event),
	eventController.GetEventsbyId
);

router.delete(
	"/:id",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.DeleteEvent),
	checkItemAccess("events", () => Event),
	eventController.DeleteEvent
);

router.patch(
	"/:id",
	handleupload,
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.EditEvent),
	checkItemAccess("events", () => Event),
	eventController.UpdateEvent
);

// ==================== GUEST MANAGEMENT ROUTES ====================

router.post(
	"/:id/guests",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.EditEvent),
	checkItemAccess("events", () => Event),
	eventController.AddGuestsToEvent
);

router.delete(
	"/:id/guests",
	authMiddleware.verifyToken,
	authMiddleware.verifyPermission(Permissions.EditEvent),
	checkItemAccess("events", () => Event),
	eventController.RemoveGuestsFromEvent
);

module.exports = router;
