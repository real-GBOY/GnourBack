/** @format */

const Feedback = require("../Models/FeedBacks");
const {
	getFilteredFeedbacks,
	getFeedbackWithAccessControl,
	getFeedbackAccessFilter,
} = require("../utils/feedbackFilters");

// Populate options for cleaner responses
const populateOptions = [
	{ path: "submittedBy", select: "firstName lastName email" },
	{ path: "submittedTo", select: "firstName lastName email" },
	{ path: "taskId", select: "title description" },
	{ path: "meetingId", select: "title startDate endDate" },
	{ path: "attendanceId", select: "status attendance" },
];

// Create feedback
exports.createFeedback = async (req, res) => {
	try {
		const {
			title,
			content,
			category,
			submittedTo,
			taskId,
			meetingId,
			attendanceId,
		} = req.body;

		// Always trust authenticated user context for submittedBy
		const authenticatedUserId = req.user?.id || req.user?._id;
		if (!authenticatedUserId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const feedback = new Feedback({
			title,
			content,
			category,
			submittedBy: authenticatedUserId,
			submittedTo,
			taskId,
			meetingId,
			attendanceId,
		});

		await feedback.save();

		const populatedFeedback = await feedback.populate(populateOptions);

		res.status(201).json({
			message: "Feedback created successfully",
			data: populatedFeedback,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get all feedback (with access control)
exports.getAllFeedback = async (req, res) => {
	try {
		const feedbacks = await getFilteredFeedbacks(req.user);
		res.status(200).json(feedbacks);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get feedback by ID (with access control)
exports.getFeedbackById = async (req, res) => {
	try {
		const { id } = req.params;
		const feedback = await getFeedbackWithAccessControl(id, req.user);

		if (!feedback) {
			return res
				.status(404)
				.json({ message: "Feedback not found or access denied" });
		}

		res.status(200).json(feedback);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get feedback by user (submittedBy)
exports.getFeedbackByUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const accessFilter = await getFeedbackAccessFilter(req.user);
		const feedbacks = await Feedback.find({
			submittedBy: userId,
			...accessFilter,
		}).populate(populateOptions);
		res.status(200).json(feedbacks);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get feedback by category
exports.getFeedbackByCategory = async (req, res) => {
	try {
		const { category } = req.params;
		const accessFilter = await getFeedbackAccessFilter(req.user);
		const feedbacks = await Feedback.find({
			category,
			...accessFilter,
		}).populate(populateOptions);
		res.status(200).json(feedbacks);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get feedback by task
exports.getFeedbackByTask = async (req, res) => {
	try {
		const { taskId } = req.params;
		const accessFilter = await getFeedbackAccessFilter(req.user);
		const feedbacks = await Feedback.find({ taskId, ...accessFilter }).populate(
			populateOptions
		);
		res.status(200).json(feedbacks);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get feedback by meeting
exports.getFeedbackByMeeting = async (req, res) => {
	try {
		const { meetingId } = req.params;
		const accessFilter = await getFeedbackAccessFilter(req.user);
		const feedbacks = await Feedback.find({
			meetingId,
			...accessFilter,
		}).populate(populateOptions);
		res.status(200).json(feedbacks);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get feedback by attendance
exports.getFeedbackByAttendance = async (req, res) => {
	try {
		const { attendanceId } = req.params;
		const accessFilter = await getFeedbackAccessFilter(req.user);
		const feedbacks = await Feedback.find({
			attendanceId,
			...accessFilter,
		}).populate(populateOptions);
		res.status(200).json(feedbacks);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Update feedback
exports.updateFeedback = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const feedback = await Feedback.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		}).populate(populateOptions);

		if (!feedback) {
			return res.status(404).json({ message: "Feedback not found" });
		}

		res.status(200).json({
			message: "Feedback updated successfully",
			data: feedback,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
	try {
		const { id } = req.params;
		const feedback = await Feedback.findByIdAndDelete(id);

		if (!feedback) {
			return res.status(404).json({ message: "Feedback not found" });
		}

		res.status(200).json({ message: "Feedback deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
