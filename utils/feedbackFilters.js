/**
 * Feedback Filtering and Access Control Utilities
 * Mirrors the approach used in taskFilters/eventFilters to control which feedbacks are visible
 *
 * @format
 */

const Feedback = require("../Models/FeedBacks");
const User = require("../Models/User");

// ==================== FEEDBACK ACCESS POLICIES ====================

/**
 * Feedback access policies for different roles
 * - President: can see all feedback
 * - Head/ViceHead/Member/HrMember: can see feedback they submitted or feedback submitted to them
 */
const feedbackAccessPolicies = {
	President: () => ({}),

	Head: (user) => ({
		$or: [
			{ submittedBy: user.id || user._id },
			{ submittedTo: user.id || user._id },
		],
	}),

	ViceHead: (user) => ({
		$or: [
			{ submittedBy: user.id || user._id },
			{ submittedTo: user.id || user._id },
		],
	}),

	Member: (user) => ({
		$or: [
			{ submittedBy: user.id || user._id },
			{ submittedTo: user.id || user._id },
		],
	}),

	HrMember: (user) => ({
		$or: [
			{ submittedBy: user.id || user._id },
			{ submittedTo: user.id || user._id },
		],
	}),
};

/**
 * Get access filter for feedback based on user's role
 * @param {Object} user - The user object with role information
 * @returns {Object} MongoDB filter object
 */
const getFeedbackAccessFilter = async (user) => {
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

	if (!roleName) {
		return { _id: null };
	}

	// President or undefined role policy fallback
	if (roleName === "President") {
		return {};
	}

	// Head/ViceHead: access any feedback related to their team members (submittedBy/submittedTo)
	if (roleName === "Head" || roleName === "ViceHead") {
		try {
			// Ensure we know the team id. If not in token, fetch user to get it
			let teamId = user.team;
			if (!teamId) {
				const dbUser = await User.findById(user.id || user._id).select("team");
				teamId = dbUser?.team;
			}

			if (!teamId) {
				// No team context, fallback to self-only visibility
				return {
					$or: [
						{ submittedBy: user.id || user._id },
						{ submittedTo: user.id || user._id },
					],
				};
			}

			// Get all member ids in the team (include self)
			const members = await User.find({ team: teamId }).select("_id");
			const memberIds = members.map((m) => m._id);
			const selfId = user.id || user._id;
			if (selfId) memberIds.push(selfId);

			return {
				$or: [
					{ submittedBy: { $in: memberIds } },
					{ submittedTo: { $in: memberIds } },
				],
			};
		} catch (e) {
			return { _id: null };
		}
	}

	// Member/HrMember: see feedback they submitted or that is submitted to them
	return {
		$or: [
			{ submittedBy: user.id || user._id },
			{ submittedTo: user.id || user._id },
		],
	};
};

// ==================== ACCESS CONTROL HELPER FUNCTIONS ====================

/**
 * Get filtered feedbacks based on user's access permissions
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Array>} Filtered feedbacks
 */
const getFilteredFeedbacks = async (user) => {
	const accessFilter = await getFeedbackAccessFilter(user);
	return await Feedback.find(accessFilter)
		.populate("submittedBy", "firstName lastName email")
		.populate("submittedTo", "firstName lastName email")
		.populate("taskId", "title description")
		.populate("meetingId", "title startDate endDate")
		.populate("attendanceId", "status attendance");
};

/**
 * Get a single feedback by ID with access control
 * @param {string} feedbackId - The feedback ID
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Object|null>} Feedback object or null if not found/access denied
 */
const getFeedbackWithAccessControl = async (feedbackId, user) => {
	const accessFilter = await getFeedbackAccessFilter(user);

	const feedback = await Feedback.findOne({ _id: feedbackId, ...accessFilter })
		.populate("submittedBy", "firstName lastName email")
		.populate("submittedTo", "firstName lastName email")
		.populate("taskId", "title description")
		.populate("meetingId", "title startDate endDate")
		.populate("attendanceId", "status attendance");

	return feedback;
};

module.exports = {
	feedbackAccessPolicies,
	getFeedbackAccessFilter,
	getFilteredFeedbacks,
	getFeedbackWithAccessControl,
};
