/** @format */

const mongoose = require("mongoose");

const Task = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: ["pending", "completed", "in_progress"],
		default: "pending",
	},
	dueDate: {
		type: Date,
		required: true,
	},

	createdAt: {
		type: Date,
		default: Date.now,
	},
	attachments: [
		{
			fileUrl: {
				type: String,
				required: true,
			},
			fileName: {
				type: String,
			},
			uploadedBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
			uploadedAt: {
				type: Date,
				default: Date.now,
			},
		},
	],
	whatAppGroup: {
		type: String,
		required: false,
	},
	assignedTo: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

module.exports = mongoose.model("Task", Task);
