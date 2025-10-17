
const mongoose = require("mongoose");
const teamSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	teamLeader: {
		type: mongoose.Schema.Types.ObjectId,
		required: false,
		ref: "User",
	},
	teamViceHead: {
		type: [mongoose.Schema.Types.ObjectId],
		required: false,
		ref: "User",
		default: [],
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Add virtual to get all users in this team
teamSchema.virtual("members", {
	ref: "User", 
	localField: "_id", 
	foreignField: "team", 
});

// Make sure virtuals are included in JSON output
teamSchema.set("toObject", { virtuals: true });
teamSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Team", teamSchema);