/** @format */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			required: [true, "First name is required"],
			trim: true,
			maxlength: [50, "First name cannot exceed 50 characters"],
		},
		lastName: {
			type: String,
			required: [true, "Last name is required"],
			trim: true,
			maxlength: [50, "Last name cannot exceed 50 characters"],
		},
		nationalID: {
			type: String,
			required: [true, "National ID is required"],
			unique: true,
			sparse: true,
			trim: true,
		},
		dateOfBirth: {
			type: Date,
			required: [true, "Date of birth is required"],
			validate: {
				validator: function (value) {
					return value <= new Date();
				},
				message: "Date of birth cannot be in the future",
			},
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"Please enter a valid email",
			],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
		},
		phoneNumber: {
			type: String,
			required: [true, "Phone number is required"],
			trim: true,
		},
		team: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Team",
		},
		role: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Role",
		},
		profilePicture: {
			type: String,
			default:
				"https://res.cloudinary.com/your-cloud-name/image/upload/v1/profiles/default-avatar.png",
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		refreshToken: {
			type: String,
		},

		achievements: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Achievement",
			},
		],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("User", userSchema);
