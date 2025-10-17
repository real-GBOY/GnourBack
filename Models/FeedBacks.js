/** @format */

const mongoose = require("mongoose");
const Feedbacks = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		enum: ["task", "meeting", "attendance", "behavior", "other"],
		default: "other",
	},
	submittedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	submittedTo: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	],
	taskId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Task",
	},
	meetingId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Event",
	},
	attendanceId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Attendance",
	},
});

module.exports = mongoose.model("Feedbacks", Feedbacks);
