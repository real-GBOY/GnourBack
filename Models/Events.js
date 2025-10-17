/** @format */

const mongoose = require("mongoose");
const Event = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
	// Type of meeting/event
	eventType: {
		type: String,
		enum: [
			"team-meeting",
			"General-meeting",
			"training",
			"workshop",
			"other",
		],
		required: true,
		default: "team-meeting",
	},
	// Meeting agenda or objectives
	agenda: {
		type: String,
		required: false,
	},
	// Meeting status
	status: {
		type: String,
		enum: ["scheduled", "in-progress", "completed", "cancelled"],
		default: "scheduled",
	},

	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	guests: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	]
});

// Update the updatedAt field before saving
Event.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

module.exports = mongoose.model("Event", Event);
