/** @format */

const router = require("express").Router();

const userController = require("../Controllers/UserController");
const {
	verifyToken,
	verifyPermission,
	setUserData,
} = require("../Middlewares/AuthMiddleWare");
const permission = require("../config/Permissions");

// Get all users (requires ViewPerson OR ViewTeamMembers permission)
router.get("/", verifyToken, setUserData, userController.getusers);

// Get team members for a specific team (requires ViewTeamMembers permission)
router.get(
	"/team/:teamId/members",
	verifyToken,
	setUserData,
	verifyPermission(permission.ViewTeamMembers),
	userController.getTeamMembers
);

// Get all teams with their members (requires ViewTeamMembers permission)
router.get(
	"/teams/with-members",
	verifyToken,
	setUserData,
	verifyPermission(permission.ViewTeamMembers),
	userController.getAllTeamsWithMembers
);

// Get unverified users (requires ViewUnProvedPerson OR ViewTeamMembers permission)
router.get(
	"/unverified",
	verifyToken,
	setUserData,
	userController.getUnverifiedUsers
);

// Get a specific user by ID (requires ViewPerson OR ViewTeamMembers permission)
router.get("/:id", verifyToken, setUserData, userController.getuser);

// Verify user and optionally assign role
router.patch(
	"/verify/:userId",
	verifyToken,
	setUserData,
	userController.verifyUser
);

// Assign role to user
router.patch(
	"/assign-role/:userId",
	verifyToken,
	setUserData,
	userController.assignRole
);

module.exports = router;
