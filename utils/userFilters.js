/**
 * User Filtering and Access Control Utilities
 * Mirrors the approach used in taskFilters to control which users are visible
 *
 * @format
 */

const User = require("../Models/User");

// ==================== USER ACCESS POLICIES ====================

/**
 * User access policies for different roles
 * - President: can see all users
 * - Head/ViceHead: can see users within their own team
 * - Member/HrMember: can see users within their team and other teams (when they have ViewTeamMembers permission)
 */
const userAccessPolicies = {
	President: () => ({}),

	Head: (user) => ({ team: user.team || null }),

	ViceHead: (user) => ({ team: user.team || null }),

	Member: (user) => ({ team: user.team || null }),

	HrMember: (user) => {
		// Check if user has ViewTeamMembers permission
		if (user.role && user.role.permissions) {
			const hasViewTeamMembersPermission = user.role.permissions.some(
				(permission) =>
					permission.key === "view_team_members" ||
					permission === "view_team_members"
			);

			if (hasViewTeamMembersPermission) {
				// HrMembers can see all users when they have ViewTeamMembers permission
				return {};
			}
		}

		// Default: HrMembers cannot see any users
		return { _id: null };
	},
};

/**
 * Get access filter for users based on the requester's role
 * @param {Object} user - The requester user object from JWT (should include team when needed)
 * @returns {Object} MongoDB filter object
 */
const getUserAccessFilter = (user) => {
	if (!user) return { _id: null };

	let roleName;
	if (user.role && typeof user.role === "object" && user.role.key) {
		roleName = user.role.key;
	} else if (typeof user.role === "string") {
		roleName = user.role;
	} else {
		return { _id: null };
	}

	const rolePolicy = userAccessPolicies[roleName];
	if (!rolePolicy) return { _id: null };

	return rolePolicy(user);
};

// ==================== ACCESS CONTROL HELPER FUNCTIONS ====================

/**
 * Ensure requester has necessary context (e.g., team) by fetching from DB if missing
 * @param {Object} user
 * @returns {Promise<Object|null>} Augmented user-like object
 */
const ensureRequesterContext = async (user) => {
	if (!user) return null;
	if (user.team) return user;
	const requesterId = user.id || user._id;
	if (!requesterId) return user;
	try {
		const dbUser = await User.findById(requesterId)
			.select("team role")
			.populate("role", "key");
		if (!dbUser) return user;
		return {
			...user,
			team: dbUser.team,
			role: user.role || dbUser.role?.key || dbUser.role,
		};
	} catch {
		return user;
	}
};

/**
 * Get filtered users based on requester's access permissions
 * @param {Object} user - The authenticated requester user object
 * @returns {Promise<Array>} Filtered users
 */
const getFilteredUsers = async (user) => {
	const requester = await ensureRequesterContext(user);
	const accessFilter = getUserAccessFilter(requester);
	return await User.find(accessFilter)
		.populate("role", "key")
		.populate("team", "name")
		.populate(
			"achievements",
			"title description achievementType dateAwarded badgeIcon"
		);
};

/**
 * Get a single user by ID with access control
 * @param {string} userId - The target user ID
 * @param {Object} user - The authenticated requester user object
 * @returns {Promise<Object|null>} User object or null if not found/access denied
 */
const getUserWithAccessControl = async (userId, user) => {
	const requester = await ensureRequesterContext(user);
	const accessFilter = getUserAccessFilter(requester);

	const found = await User.findOne({ _id: userId, ...accessFilter })
		.populate("role", "key")
		.populate("team", "name")
		.populate(
			"achievements",
			"title description achievementType dateAwarded badgeIcon"
		);

	return found;
};

module.exports = {
	userAccessPolicies,
	getUserAccessFilter,
	getFilteredUsers,
	getUserWithAccessControl,
	ensureRequesterContext,
};
