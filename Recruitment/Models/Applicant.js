/** @format */

import mongoose from "mongoose";

const EGYPT_MOBILE_REGEX = /^(?:\+?20|0020|0)1[0125]\d{8}$/;

const ApplicationSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		trim: true,
	},
	lastName: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		validate: {
			validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
			message: "Invalid email address format.",
		},
	},
	phone: {
		type: String,
		required: true,
		trim: true,
		validate: {
			validator: (value) => EGYPT_MOBILE_REGEX.test(value),
			message:
				"Invalid Egyptian mobile number. Use formats like 010XXXXXXXX or +2010XXXXXXXX.",
		},
	},

	gender: {
		type: String,
		required: true,
		enum: ["Male", "Female", "Mickey Mouse"],
	},

	faculty: {
		type: String,
		required: true,
		trim: true,
	},
	academicYear: {
		type: String,
		required: true,
		enum: ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"],
	},

	selectedTeam: {
		type: String,
		required: true,
		enum: [
			"Project",
			"Presentation",
			"Digital Marketing",
			"HR",
			"Logistics",
			"PR-FR",
			"Graphic Design",
			"Video Editing",
		],
	},

	skills: {
		type: [
			{
				type: String,
				trim: true,
			},
		],
		required: true,
		validate: {
			validator: (arr) =>
				Array.isArray(arr) &&
				arr.length > 0 &&
				arr.every(
					(s) =>
						typeof s === "string" &&
						s.trim().length > 0 &&
						s.trim().length <= 50
				),
			message:
				"Provide at least one non-empty skill (each up to 50 characters).",
		},
	},

	relevantExperience: {
		type: String,
		trim: true,
	},

	socialLinks: [
		{
			type: String,
			trim: true,
			validate: {
				validator: (value) =>
					/^(https?:\/\/)([\w-]+\.)+[\w-]+(\/[\w\-._~:\/?#\[\]@!$&'()*+,;=]*)?$/i.test(
						value
					),
				message:
					"Invalid URL. Use full http(s) link, e.g., https://example.com",
			},
		},
	],

	dateOfBirth: {
		type: Date,
		required: true,
		validate: {
			validator: (value) => value instanceof Date && value < new Date(),
			message: "Date of birth must be a valid past date.",
		},
	},

	acceptedTerms: {
		type: Boolean,
		required: true,
		default: false,
	},

	createdAt: {
		type: Date,
		default: Date.now,
	},
});

export default mongoose.model("Application", ApplicationSchema);
