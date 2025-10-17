/** @format */

const mongoose = require("mongoose");
const Attendance = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		event: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Event",
			required: true,
		},
		attendance: {
			type: Boolean,
			required: true,
		},
		status: {
			type: String,
			enum: ["present", "absent", "late", "excused", "left_early"],
			default: "present",
		},
		lateMinutes: {
			type: Number,
			default: 0,
		},
		earlyLeaveMinutes: {
			type: Number,
			default: 0,
		},
		verified: {
			type: Boolean,
			default: false,
		},
		verifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		verificationNotes: {
			type: String,
			default: "",
		},
		feedback: {
			type: String,
			default: "",
		},
		feedbackBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		checkInTime: {
			type: Date,
		},
		checkOutTime: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

Attendance.virtual("duration").get(function () {
	if (this.checkInTime && this.checkOutTime) {
		const ms = this.checkOutTime - this.checkInTime;
		return Math.round(ms / 60000); // return in minutes
	}
	return 0;
});

module.exports = mongoose.model("Attendance", Attendance);
