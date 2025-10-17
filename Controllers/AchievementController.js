/** @format */

const Achievement = require("../Models/Achievement");
const User = require("../Models/User");
const {
	getFilteredAchievements,
	getAchievementWithAccessControl,
	getUserAchievementsWithAccessControl,
	getAchievementStatsWithAccessControl,
} = require("../utils/achievemnetFilter");

// ==================== CREATE ACHIEVEMENT ====================
exports.createAchievement = async (req, res) => {
	try {
		const { title, description, achievementType, userId, badgeIcon } = req.body;

		// Debug logging
		console.log("Request body:", req.body);
		console.log("Request file:", req.file);
		console.log("Upload URL:", req.uploadurl);

		// Validate required fields
		if (!title || !description || !achievementType || !userId) {
			return res.status(400).json({
				success: false,
				message:
					"Title, description, achievement type, and user ID are required",
			});
		}

		// Check if user exists
		const userExists = await User.findById(userId);
		if (!userExists) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Prepare achievement data
		const achievementData = {
			title,
			description,
			achievementType,
			user: userId,
			badgeIcon,
			awardedBy: req.user.id,
		};

		// Add certificate file if uploaded
		if (req.uploadurl && req.file) {
			// Validate file type
			const allowedTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/gif",
				"application/pdf",
			];
			if (!allowedTypes.includes(req.file.mimetype)) {
				return res.status(400).json({
					success: false,
					message:
						"Invalid file type. Only images (JPEG, PNG, GIF) and PDFs are allowed",
				});
			}

			achievementData.certificateFile = {
				fileName: req.file.originalname,
				fileUrl: req.uploadurl,
				fileType: req.file.mimetype,
				fileSize: req.file.size,
			};
		}

		// Create achievement
		const achievement = await Achievement.create(achievementData);

		// Add achievement to user's achievements array
		await User.findByIdAndUpdate(userId, {
			$push: { achievements: achievement._id },
		});

		// Populate and return
		await achievement.populate([
			{ path: "user", select: "firstName lastName email profilePicture" },
			{ path: "awardedBy", select: "firstName lastName" },
		]);

		res.status(201).json({
			success: true,
			message: "Achievement created successfully",
			data: achievement,
		});
	} catch (error) {
		console.error("Error in createAchievement:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ==================== GET ALL ACHIEVEMENTS ====================
exports.getAllAchievements = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			sort = "-dateAwarded",
			type,
			search,
		} = req.query;

		// Build additional filters
		const additionalFilters = {};
		if (type) additionalFilters.achievementType = type;
		if (search) {
			additionalFilters.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
			];
		}

		// Get filtered achievements with access control
		// If no user is authenticated, get all achievements
		let achievements;
		if (req.user) {
			achievements = await getFilteredAchievements(req.user, additionalFilters);
		} else {
			// For unauthenticated requests, get all achievements
			achievements = await Achievement.find(additionalFilters)
				.populate("user", "firstName lastName email profilePicture")
				.populate("awardedBy", "firstName lastName");
		}

		// Apply pagination and sorting
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		// Sort achievements
		let sortedAchievements = achievements;
		if (sort.startsWith("-")) {
			const field = sort.slice(1);
			sortedAchievements = achievements.sort((a, b) => b[field] - a[field]);
		} else {
			sortedAchievements = achievements.sort((a, b) => a[sort] - b[sort]);
		}

		// Apply pagination
		const paginatedAchievements = sortedAchievements.slice(
			startIndex,
			endIndex
		);

		res.status(200).json({
			success: true,
			data: paginatedAchievements,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(achievements.length / limit),
				totalItems: achievements.length,
				itemsPerPage: parseInt(limit),
			},
		});
	} catch (error) {
		console.error("Error in getAllAchievements:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ==================== GET ACHIEVEMENT BY ID ====================
exports.getAchievementById = async (req, res) => {
	try {
		let achievement;
		if (req.user) {
			achievement = await getAchievementWithAccessControl(
				req.params.id,
				req.user
			);
		} else {
			// For unauthenticated requests, get the achievement directly
			achievement = await Achievement.findById(req.params.id)
				.populate("user", "firstName lastName email profilePicture")
				.populate("awardedBy", "firstName lastName");
		}

		if (!achievement) {
			return res.status(404).json({
				success: false,
				message: "Achievement not found or access denied",
			});
		}

		res.status(200).json({
			success: true,
			data: achievement,
		});
	} catch (error) {
		console.error("Error in getAchievementById:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ==================== GET USER ACHIEVEMENTS ====================
exports.getUserAchievements = async (req, res) => {
	try {
		const { userId } = req.params;
		const { page = 1, limit = 10, sort = "-dateAwarded" } = req.query;

		// Get achievements for specific user with access control
		let achievements;
		if (req.user) {
			achievements = await getUserAchievementsWithAccessControl(
				userId,
				req.user
			);
		} else {
			// For unauthenticated requests, get all achievements for the user
			achievements = await Achievement.find({ user: userId })
				.populate("user", "firstName lastName email profilePicture")
				.populate("awardedBy", "firstName lastName");
		}

		// Apply sorting
		let sortedAchievements = achievements;
		if (sort.startsWith("-")) {
			const field = sort.slice(1);
			sortedAchievements = achievements.sort((a, b) => b[field] - a[field]);
		} else {
			sortedAchievements = achievements.sort((a, b) => a[sort] - b[sort]);
		}

		// Apply pagination
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;
		const paginatedAchievements = sortedAchievements.slice(
			startIndex,
			endIndex
		);

		res.status(200).json({
			success: true,
			data: paginatedAchievements,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(achievements.length / limit),
				totalItems: achievements.length,
				itemsPerPage: parseInt(limit),
			},
		});
	} catch (error) {
		console.error("Error in getUserAchievements:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ==================== UPDATE ACHIEVEMENT ====================
exports.updateAchievement = async (req, res) => {
	try {
		const { title, description, achievementType, badgeIcon } = req.body;

		// Get achievement with access control
		const achievement = await getAchievementWithAccessControl(
			req.params.id,
			req.user
		);
		if (!achievement) {
			return res.status(404).json({
				success: false,
				message: "Achievement not found or access denied",
			});
		}

		// Check if user can edit this achievement
		if (achievement.awardedBy.toString() !== req.user.id) {
			return res.status(403).json({
				success: false,
				message: "You can only edit achievements you awarded",
			});
		}

		// Update achievement
		const updatedAchievement = await Achievement.findByIdAndUpdate(
			req.params.id,
			{ title, description, achievementType, badgeIcon },
			{ new: true, runValidators: true }
		).populate([
			{ path: "user", select: "firstName lastName email profilePicture" },
			{ path: "awardedBy", select: "firstName lastName" },
		]);

		res.status(200).json({
			success: true,
			message: "Achievement updated successfully",
			data: updatedAchievement,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ==================== DELETE ACHIEVEMENT ====================
exports.deleteAchievement = async (req, res) => {
	try {
		// Get achievement with access control
		const achievement = await getAchievementWithAccessControl(
			req.params.id,
			req.user
		);
		if (!achievement) {
			return res.status(404).json({
				success: false,
				message: "Achievement not found or access denied",
			});
		}

		// Check if user can delete this achievement
		if (achievement.awardedBy.toString() !== req.user.id) {
			return res.status(403).json({
				success: false,
				message: "You can only delete achievements you awarded",
			});
		}

		// Soft delete - remove from user's achievements array
		await User.findByIdAndUpdate(achievement.user, {
			$pull: { achievements: achievement._id },
		});

		// Delete the achievement completely
		await Achievement.findByIdAndDelete(req.params.id);

		res.status(200).json({
			success: true,
			message: "Achievement deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ==================== UPLOAD SUPPORTING DOCUMENT ====================
exports.uploadSupportingDocument = async (req, res) => {
	try {
		const { achievementId } = req.params;
		const { description } = req.body;

		// Debug logging
		console.log("Upload supporting document - Request body:", req.body);
		console.log("Upload supporting document - Request file:", req.file);
		console.log("Upload supporting document - Upload URL:", req.uploadurl);

		// Get achievement with access control
		const achievement = await getAchievementWithAccessControl(
			achievementId,
			req.user
		);
		if (!achievement) {
			return res.status(404).json({
				success: false,
				message: "Achievement not found or access denied",
			});
		}

		// Check if user can modify this achievement
		if (achievement.awardedBy.toString() !== req.user.id) {
			return res.status(403).json({
				success: false,
				message: "You can only modify achievements you awarded",
			});
		}

		// Check if file was uploaded
		if (!req.uploadurl || !req.file) {
			return res.status(400).json({
				success: false,
				message: "No file uploaded",
			});
		}

		// Validate file type
		const allowedTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"application/pdf",
		];
		if (!allowedTypes.includes(req.file.mimetype)) {
			return res.status(400).json({
				success: false,
				message:
					"Invalid file type. Only images (JPEG, PNG, GIF) and PDFs are allowed",
			});
		}

		// Add supporting document
		const supportingDocument = {
			fileName: req.file.originalname,
			fileUrl: req.uploadurl,
			fileType: req.file.mimetype,
			fileSize: req.file.size,
			description: description || "",
		};

		achievement.supportingDocuments.push(supportingDocument);
		await achievement.save();

		// Populate and return
		await achievement.populate([
			{ path: "user", select: "firstName lastName email profilePicture" },
			{ path: "awardedBy", select: "firstName lastName" },
		]);

		res.status(200).json({
			success: true,
			message: "Supporting document uploaded successfully",
			data: achievement,
		});
	} catch (error) {
		console.error("Error in uploadSupportingDocument:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ==================== UPLOAD ACHIEVEMENT PHOTO ====================
exports.uploadAchievementPhoto = async (req, res) => {
	try {
		const { achievementId } = req.params;

		// Debug logging
		console.log("Upload achievement photo - Request body:", req.body);
		console.log("Upload achievement photo - Request file:", req.file);
		console.log("Upload achievement photo - Upload URL:", req.uploadurl);

		// Get achievement with access control
		const achievement = await getAchievementWithAccessControl(
			achievementId,
			req.user
		);
		if (!achievement) {
			return res.status(404).json({
				success: false,
				message: "Achievement not found or access denied",
			});
		}

		// Check if user can modify this achievement
		if (achievement.awardedBy.toString() !== req.user.id) {
			return res.status(403).json({
				success: false,
				message: "You can only modify achievements you awarded",
			});
		}

		// Check if file was uploaded
		if (!req.uploadurl || !req.file) {
			return res.status(400).json({
				success: false,
				message: "No file uploaded",
			});
		}

		// Validate file type - only images allowed for achievement photos
		const allowedImageTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
		];
		if (!allowedImageTypes.includes(req.file.mimetype)) {
			return res.status(400).json({
				success: false,
				message:
					"Invalid file type. Only images (JPEG, PNG, GIF) are allowed for achievement photos",
			});
		}

		// Update achievement photo
		achievement.achievementPhoto = {
			fileName: req.file.originalname,
			fileUrl: req.uploadurl,
			fileType: req.file.mimetype,
			fileSize: req.file.size,
		};

		await achievement.save();

		// Populate and return
		await achievement.populate([
			{ path: "user", select: "firstName lastName email profilePicture" },
			{ path: "awardedBy", select: "firstName lastName" },
		]);

		res.status(200).json({
			success: true,
			message: "Achievement photo uploaded successfully",
			data: achievement,
		});
	} catch (error) {
		console.error("Error in uploadAchievementPhoto:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ==================== REMOVE FILE ====================
exports.removeFile = async (req, res) => {
	try {
		const { achievementId, fileType, fileIndex } = req.params;

		// Get achievement with access control
		const achievement = await getAchievementWithAccessControl(
			achievementId,
			req.user
		);
		if (!achievement) {
			return res.status(404).json({
				success: false,
				message: "Achievement not found or access denied",
			});
		}

		// Check if user can modify this achievement
		if (achievement.awardedBy.toString() !== req.user.id) {
			return res.status(403).json({
				success: false,
				message: "You can only modify achievements you awarded",
			});
		}

		// Remove file based on type
		let fileRemoved = false;
		if (
			fileType === "supporting" &&
			achievement.supportingDocuments[fileIndex]
		) {
			achievement.supportingDocuments.splice(fileIndex, 1);
			fileRemoved = true;
		} else if (fileType === "certificate" && achievement.certificateFile) {
			achievement.certificateFile = undefined;
			fileRemoved = true;
		} else if (fileType === "photo" && achievement.achievementPhoto) {
			achievement.achievementPhoto = undefined;
			fileRemoved = true;
		}

		if (!fileRemoved) {
			return res.status(404).json({
				success: false,
				message: "File not found",
			});
		}

		await achievement.save();

		// Populate and return
		await achievement.populate([
			{ path: "user", select: "firstName lastName email profilePicture" },
			{ path: "awardedBy", select: "firstName lastName" },
		]);

		res.status(200).json({
			success: true,
			message: "File removed successfully",
			data: achievement,
		});
	} catch (error) {
		console.error("Error in removeFile:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

// ==================== GET ACHIEVEMENT STATISTICS ====================
exports.getAchievementStats = async (req, res) => {
	try {
		let stats;
		if (req.user) {
			stats = await getAchievementStatsWithAccessControl(req.user);
		} else {
			// For unauthenticated requests, get basic stats
			const basicStats = await Achievement.aggregate([
				{
					$group: {
						_id: "$achievementType",
						count: { $sum: 1 },
					},
				},
				{ $sort: { count: -1 } },
			]);

			const totalAchievements = await Achievement.countDocuments();

			stats = {
				byType: basicStats,
				totalAchievements,
			};
		}

		res.status(200).json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error("Error in getAchievementStats:", error);
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};
