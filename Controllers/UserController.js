/** @format */

const User = require("../Models/User");
//import roles from config
const Roles = require("../config/Roles");
const {
	getFilteredUsers,
	getUserWithAccessControl,
} = require("../utils/userFilters");
const Team = require("../Models/Team"); // Added import for Team model

exports.getusers = async (req, res) => {
	try {
		// Check if user has permission to view users
		if (!req.user.role || !req.user.role.permissions) {
			return res.status(403).json({
				success: false,
				message: "Access denied: Insufficient permissions",
			});
		}

		// Check if user has ViewPerson or ViewTeamMembers permission
		const hasViewPersonPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_person" || permission === "view_person"
		);

		const hasViewTeamMembersPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_team_members" ||
				permission === "view_team_members"
		);

		if (!hasViewPersonPermission && !hasViewTeamMembersPermission) {
			return res.status(403).json({
				success: false,
				message:
					"Access denied: You don't have permission to view users. Required permission: view_person or view_team_members",
			});
		}

		// If user has ViewPerson permission, use the existing access control
		if (hasViewPersonPermission) {
			const users = await getFilteredUsers(req.user);
			return res.status(200).json(users);
		}

		// If user has ViewTeamMembers permission, return all users with filtered data
		if (hasViewTeamMembersPermission) {
			const users = await User.find()
				.select(
					"firstName lastName email profilePicture role team isActive isVerified achievements"
				)
				.populate("role", "key")
				.populate("team", "name description")
				.populate(
					"achievements",
					"title description achievementType dateAwarded badgeIcon"
				);

			return res.status(200).json({
				success: true,
				data: users,
				count: users.length,
			});
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

exports.getuser = async (req, res) => {
	try {
		// Check if user has permission to view user details
		if (!req.user.role || !req.user.role.permissions) {
			return res.status(403).json({
				success: false,
				message: "Access denied: Insufficient permissions",
			});
		}

		// Check if user has ViewPerson or ViewTeamMembers permission
		const hasViewPersonPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_person" || permission === "view_person"
		);

		const hasViewTeamMembersPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_team_members" ||
				permission === "view_team_members"
		);

		if (!hasViewPersonPermission && !hasViewTeamMembersPermission) {
			return res.status(403).json({
				success: false,
				message:
					"Access denied: You don't have permission to view user details. Required permission: view_person or view_team_members",
			});
		}

		// If user has ViewPerson permission, use the existing access control
		if (hasViewPersonPermission) {
			const user = await getUserWithAccessControl(req.params.id, req.user);
			if (!user) {
				return res
					.status(404)
					.json({ message: "User not found or access denied" });
			}
			return res.status(200).json(user);
		}

		// If user has ViewTeamMembers permission, allow access to any user
		if (hasViewTeamMembersPermission) {
			const user = await User.findById(req.params.id)
				.select(
					"firstName lastName email profilePicture role team isActive isVerified achievements"
				)
				.populate("role", "key")
				.populate("team", "name description")
				.populate(
					"achievements",
					"title description achievementType dateAwarded badgeIcon"
				);

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			return res.status(200).json({
				success: true,
				data: user,
			});
		}
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
};

// Verify user and optionally assign role
exports.verifyUser = async (req, res) => {
	try {
		// Check if user has permission to verify users
		if (!req.user.role || !req.user.role.permissions) {
			return res.status(403).json({
				success: false,
				message: "Access denied: Insufficient permissions",
			});
		}

		// Check if user has ViewUnProvedPerson or ViewTeamMembers permission
		const hasViewUnProvedPersonPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_unproved_person" ||
				permission === "view_unproved_person"
		);

		const hasViewTeamMembersPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_team_members" ||
				permission === "view_team_members"
		);

		if (!hasViewUnProvedPersonPermission && !hasViewTeamMembersPermission) {
			return res.status(403).json({
				success: false,
				message:
					"Access denied: You don't have permission to verify users. Required permission: view_unproved_person or view_team_members",
			});
		}

		const { userId } = req.params;
		const { isVerified, role } = req.body;

		// Validate user ID
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "User ID is required",
			});
		}

		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Update user verification status and role
		const updateData = {};

		if (typeof isVerified === "boolean") {
			updateData.isVerified = isVerified;
		}

		if (role) {
			updateData.role = role;
		}

		const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
			new: true,
		}).populate({
			path: "role",
			populate: {
				path: "permissions",
				model: "Permission",
				select: "key",
			},
		});

		res.status(200).json({
			success: true,
			message: "User verified successfully",
			data: updatedUser,
		});
	} catch (error) {
		console.error("VerifyUser error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Get unverified users
exports.getUnverifiedUsers = async (req, res) => {
	try {
		// Check if user has permission to view unverified users
		if (!req.user.role || !req.user.role.permissions) {
			return res.status(403).json({
				success: false,
				message: "Access denied: Insufficient permissions",
			});
		}

		// Check if user has ViewUnProvedPerson or ViewTeamMembers permission
		const hasViewUnProvedPersonPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_unproved_person" ||
				permission === "view_unproved_person"
		);

		const hasViewTeamMembersPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_team_members" ||
				permission === "view_team_members"
		);

		if (!hasViewUnProvedPersonPermission && !hasViewTeamMembersPermission) {
			return res.status(403).json({
				success: false,
				message:
					"Access denied: You don't have permission to view unverified users. Required permission: view_unproved_person or view_team_members",
			});
		}

		// If user has ViewUnProvedPerson permission, use existing logic
		if (hasViewUnProvedPersonPermission) {
			if (req.user.team) {
				const unverifiedUsers = await User.find({
					isVerified: false,
					team: req.user.team,
				}).populate("team");
				res.status(200).json({
					success: true,
					data: unverifiedUsers,
				});
			} else {
				// all unverified
				const unverifiedUsers = await User.find({ isVerified: false }).populate(
					"team"
				);
				res.status(200).json({
					success: true,
					data: unverifiedUsers,
				});
			}
		}

		// If user has ViewTeamMembers permission, allow access to all unverified users
		if (hasViewTeamMembersPermission) {
			const unverifiedUsers = await User.find({ isVerified: false })
				.select(
					"firstName lastName email profilePicture role team isActive isVerified"
				)
				.populate("role", "key")
				.populate("team", "name description");

			res.status(200).json({
				success: true,
				data: unverifiedUsers,
			});
		}
	} catch (error) {
		console.error("GetUnverifiedUsers error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Assign role to user
exports.assignRole = async (req, res) => {
	try {
		// Check if user has permission to assign roles
		if (!req.user.role || !req.user.role.permissions) {
			return res.status(403).json({
				success: false,
				message: "Access denied: Insufficient permissions",
			});
		}

		// Check if user has ViewUnProvedPerson or ViewTeamMembers permission
		const hasViewUnProvedPersonPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_unproved_person" ||
				permission === "view_unproved_person"
		);

		const hasViewTeamMembersPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_team_members" ||
				permission === "view_team_members"
		);

		if (!hasViewUnProvedPersonPermission && !hasViewTeamMembersPermission) {
			return res.status(403).json({
				success: false,
				message:
					"Access denied: You don't have permission to assign roles. Required permission: view_unproved_person or view_team_members",
			});
		}

		const { userId } = req.params;
		const { roleId } = req.body;

		if (!userId || !roleId) {
			return res.status(400).json({
				success: false,
				message: "User ID and Role ID are required",
			});
		}

		// Find user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Update user with role
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ role: roleId },
			{ new: true }
		).populate({
			path: "role",
			populate: {
				path: "permissions",
				model: "Permission",
				select: "key",
			},
		});

		res.status(200).json({
			success: true,
			message: "Role assigned successfully",
			data: updatedUser,
		});
	} catch (error) {
		console.error("AssignRole error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Get team members for a specific team
exports.getTeamMembers = async (req, res) => {
	try {
		const { teamId } = req.params;

		if (!teamId) {
			return res.status(400).json({
				success: false,
				message: "Team ID is required",
			});
		}

		// Check if user has permission to view team members
		if (!req.user.role || !req.user.role.permissions) {
			return res.status(403).json({
				success: false,
				message: "Access denied: Insufficient permissions",
			});
		}

		// Check if user has ViewTeamMembers permission
		const hasPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_team_members" ||
				permission === "view_team_members"
		);

		if (!hasPermission) {
			return res.status(403).json({
				success: false,
				message:
					"Access denied: You don't have permission to view team members",
			});
		}

		// Get all users in the specified team
		const teamMembers = await User.find({ team: teamId })
			.select(
				"firstName lastName email profilePicture role team isActive isVerified"
			)
			.populate("role", "key")
			.populate("team", "name description");

		res.status(200).json({
			success: true,
			data: teamMembers,
			count: teamMembers.length,
		});
	} catch (error) {
		console.error("GetTeamMembers error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Get all teams with their members (for members to see organization structure)
exports.getAllTeamsWithMembers = async (req, res) => {
	try {
		// Check if user has permission to view team members
		if (!req.user.role || !req.user.role.permissions) {
			return res.status(403).json({
				success: false,
				message: "Access denied: Insufficient permissions",
			});
		}

		// Check if user has ViewTeamMembers permission
		const hasPermission = req.user.role.permissions.some(
			(permission) =>
				permission.key === "view_team_members" ||
				permission === "view_team_members"
		);

		if (!hasPermission) {
			return res.status(403).json({
				success: false,
				message:
					"Access denied: You don't have permission to view team members",
			});
		}

		// Get all teams with their members
		const teams = await Team.find()
			.populate({
				path: "members",
				select:
					"firstName lastName email profilePicture role isActive isVerified",
				populate: {
					path: "role",
					select: "key",
				},
			})
			.populate("teamLeader", "firstName lastName email profilePicture")
			.populate("teamViceHead", "firstName lastName email profilePicture");

		res.status(200).json({
			success: true,
			data: teams,
			count: teams.length,
		});
	} catch (error) {
		console.error("GetAllTeamsWithMembers error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
