/** @format */

const Achievement = require("../Models/Achievement");
const User = require("../Models/User");

// ==================== ACHIEVEMENT ACCESS POLICIES ====================

/**
 * Achievement access policies for different roles
 * - President: can see all achievements
 * - Head/ViceHead: can see achievements they awarded or their own achievements
 * - Member/HrMember: can see their own achievements and achievements within their team
 */
const AchievementAccessPolicies = {
	President: () => ({}),

	Head: (user) => ({
		$or: [{ awardedBy: user.id || user._id }, { user: user.id || user._id }],
	}),

	ViceHead: (user) => ({
		$or: [{ awardedBy: user.id || user._id }, { user: user.id || user._id }],
	}),

	Member: (user) => ({
		$or: [{ user: user.id || user._id }, { awardedBy: user.id || user._id }],
	}),

	HrMember: (user) => ({
		$or: [{ user: user.id || user._id }, { awardedBy: user.id || user._id }],
	}),
};

/**
 * Get access filter for achievements based on the requester's role
 * @param {Object} user - The requester user object from JWT
 * @returns {Object} MongoDB filter object
 */
const getAchievementAccessFilter = (user) => {
	if (!user) {
		return { _id: null };
	}

	let roleName;
	if (user.role && typeof user.role === "object" && user.role.key) {
		roleName = user.role.key;
	} else if (typeof user.role === "string") {
		roleName = user.role;
	} else {
		return { _id: null };
	}

	const rolePolicy = AchievementAccessPolicies[roleName];
	if (!rolePolicy) {
		return { _id: null };
	}

	return rolePolicy(user);
};

// ==================== ACCESS CONTROL HELPER FUNCTIONS ====================

/**
 * Ensure requester has necessary context by fetching from DB if missing
 * @param {Object} user
 * @returns {Promise<Object|null>} Augmented user-like object
 */
const ensureRequesterContext = async (user) => {
	if (!user) return null;
	if (user.id || user._id) return user;

	try {
		const dbUser = await User.findById(user._id || user.id)
			.select("role")
			.populate("role", "key");
		if (!dbUser) return user;
		return {
			...user,
			role: user.role || dbUser.role?.key || dbUser.role,
		};
	} catch {
		return user;
	}
};

/**
 * Get filtered achievements based on requester's access permissions
 * @param {Object} user - The authenticated requester user object
 * @param {Object} additionalFilters - Additional filters to apply
 * @returns {Promise<Array>} Filtered achievements
 */
const getFilteredAchievements = async (user, additionalFilters = {}) => {
	const requester = await ensureRequesterContext(user);
	const accessFilter = getAchievementAccessFilter(requester);

	// Combine access filter with additional filters
	const combinedFilter = { ...accessFilter, ...additionalFilters };

	return await Achievement.find(combinedFilter)
		.populate("user", "firstName lastName email profilePicture")
		.populate("awardedBy", "firstName lastName");
};

/**
 * Get a single achievement by ID with access control
 * @param {string} achievementId - The target achievement ID
 * @param {Object} user - The authenticated requester user object
 * @returns {Promise<Object|null>} Achievement object or null if not found/access denied
 */
const getAchievementWithAccessControl = async (achievementId, user) => {
	const requester = await ensureRequesterContext(user);
	const accessFilter = getAchievementAccessFilter(requester);

	const found = await Achievement.findOne({
		_id: achievementId,
		...accessFilter,
	})
		.populate("user", "firstName lastName email profilePicture")
		.populate("awardedBy", "firstName lastName");

	return found;
};

/**
 * Check if user has access to a specific achievement
 * @param {string} achievementId - The achievement ID
 * @param {Object} user - The authenticated requester user object
 * @returns {Promise<Object|null>} Achievement object or null if access denied
 */
const checkAchievementAccess = async (achievementId, user) => {
	const achievement = await getAchievementWithAccessControl(
		achievementId,
		user
	);
	return achievement;
};

/**
 * Get achievements for a specific user with access control
 * @param {string} userId - The target user ID
 * @param {Object} user - The authenticated requester user object
 * @returns {Promise<Array>} Filtered achievements for the user
 */
const getUserAchievementsWithAccessControl = async (userId, user) => {
	const requester = await ensureRequesterContext(user);
	const accessFilter = getAchievementAccessFilter(requester);

	// For user achievements, we need to check if the requester can see achievements for this user
	let userFilter = {};

	if (requester.role === "President") {
		// President can see all user achievements
		userFilter = { user: userId };
	} else if (requester.role === "Head" || requester.role === "ViceHead") {
		// Head/ViceHead can see achievements they awarded or their own
		userFilter = {
			$or: [
				{ user: userId, awardedBy: requester.id || requester._id },
				{ user: userId, user: requester.id || requester._id },
			],
		};
	} else {
		// Members and HrMembers can only see their own achievements
		if (userId !== (requester.id || requester._id)) {
			return [];
		}
		userFilter = { user: userId };
	}

	return await Achievement.find(userFilter)
		.populate("user", "firstName lastName email profilePicture")
		.populate("awardedBy", "firstName lastName");
};

/**
 * Get achievement statistics with access control
 * @param {Object} user - The authenticated requester user object
 * @returns {Promise<Object>} Achievement statistics
 */
const getAchievementStatsWithAccessControl = async (user) => {
	const requester = await ensureRequesterContext(user);
	const accessFilter = getAchievementAccessFilter(requester);

	const stats = await Achievement.aggregate([
		{ $match: { ...accessFilter } },
		{
			$group: {
				_id: "$achievementType",
				count: { $sum: 1 },
			},
		},
		{ $sort: { count: -1 } },
	]);

	const totalAchievements = await Achievement.countDocuments({
		...accessFilter,
	});

	return {
		byType: stats,
		totalAchievements,
	};
};

/**
 * Populate achievement with user details
 * @param {Object} achievement - The achievement object
 * @returns {Promise<Object>} Populated achievement
 */
const populateAchievement = async (achievement) => {
	return await Achievement.findById(achievement._id)
		.populate("user", "firstName lastName email profilePicture")
		.populate("awardedBy", "firstName lastName");
};

module.exports = {
	// Access Control Functions
	getFilteredAchievements,
	getAchievementWithAccessControl,
	checkAchievementAccess,
	getUserAchievementsWithAccessControl,
	getAchievementStatsWithAccessControl,
	populateAchievement,

	// Access Policies (for internal use)
	AchievementAccessPolicies,
	getAchievementAccessFilter,
	ensureRequesterContext,
};
