/** @format */

const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "Achievement title is required"],
			trim: true,
			maxlength: [100, "Achievement title cannot exceed 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Achievement description is required"],
			trim: true,
			maxlength: [500, "Achievement description cannot exceed 500 characters"],
		},
		achievementType: {
			type: String,
			enum: [
				"best_member_of_the_month",
				"best_member_of_the_year",
				"dedication",
			],
			default: "best_member_of_the_month",
		},
		dateAwarded: {
			type: Date,
			default: Date.now,
		},
		awardedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Awarded by user is required"],
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required"],
		},
	
		// Certificate file (PDF or image)
		certificateFile: {
			fileName: String,
			fileUrl: String,
			fileType: String,
			fileSize: Number,
			uploadedAt: { type: Date, default: Date.now },
		},
	
	},
	{
		timestamps: true,
	}
);

achievementSchema.index({ user: 1, dateAwarded: -1 });
achievementSchema.index({ awardedBy: 1 });
achievementSchema.index({ achievementType: 1 });

module.exports = mongoose.model("Achievement", achievementSchema);
