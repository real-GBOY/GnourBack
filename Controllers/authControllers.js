/** @format */

const User = require("../Models/User");
const {
	generateToken,
	generateRefreshToken,
	verifyToken,
} = require("../config/jwtConfig");
const Role = require("../Models/Role");
const Permission = require("../Models/Permission");
const { populate } = require("../Models/Team");

exports.SignUp = async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			nationalID,
			dateOfBirth,
			email,
			password,
			phoneNumber,
			team,
		} = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({
			$or: [{ email }, { nationalID }],
		});

		if (existingUser) {
			return res.status(400).json({
				success: false,
				message:
					existingUser.email === email
						? "Email already registered"
						: "National ID already registered",
			});
		}

		// Handle photo upload
		const photo = req.file;
		let profilePicture = null;

		if (!photo) {
			return res.status(400).json({
				success: false,
				message: "Photo is required",
			});
		}

		// Cloudinary returns the URL in the secure_url property
		if (photo) {
			//! upload url is the url of the photo in cloudinary
			// Assigen ur field to the url of the photo in cloudinary
			profilePicture = req.uploadurl;
		} else {
			res.status(400).json({
				success: false,
				message: "Photo is required",
			});
		}

		const user = new User({
			firstName,
			lastName,
			nationalID,
			dateOfBirth,
			email,
			password,
			phoneNumber,
			team,
			profilePicture,
		});

		await user.save();

		const saveduser = await User.findById(user._id).populate({
			path: "role",
			populate: {
				path: "permissions",
				model: "Permission",
				select: "key",
			},
		});

		// Generate access token and refresh token
		const accessToken = generateToken({
			id: saveduser._id,
			email: saveduser.email,
			role: saveduser.role,
		});

		const refreshToken = generateRefreshToken({
			id: saveduser._id,
			email: saveduser.email,
		});

		// Save refresh token to user
		await User.findByIdAndUpdate(saveduser._id, { refreshToken });

		res.status(201).json({
			success: true,
			message: "User created successfully",
			data: {
				accessToken,
				refreshToken,
				user: {
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					profilePicture: user.profilePicture,
				},
			},
		});
	} catch (error) {
		console.error("SignUp error:", error);

		if (error.name === "ValidationError") {
			const errors = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors,
			});
		}

		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.Login = async (req, res) => {
	try {
		const { email, password } = req.body;
		// Validate input
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Email and password are required",
			});
		}

		// Find user by email
		const user = await User.findOne({ email }).populate({
			path: "role",
			populate: {
				path: "permissions",
				model: "Permission",
				select: "key",
			},
		});
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		// Verify password (plain text comparison for now)
		if (password !== user.password) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		if (user.isVerified === false) {
			return res.status(401).json({
				success: false,
				message:
					"User is not verified please wait for One Of Admins to verify your account",
			});
		}

		// Generate access token and refresh token
		const accessToken = generateToken({
			id: user._id,
			email: user.email,
			name: `${user.firstName} ${user.lastName}`,
			team: user.team,
			role: {
				id: user.role._id,
				key: user.role.key,
				permissions: user.role.permissions,
			},
		});

		const refreshToken = generateRefreshToken({
			id: user._id,
			email: user.email,
		});

		// Save refresh token to user
		await User.findByIdAndUpdate(user._id, { refreshToken });

		res.status(200).json({
			success: true,
			message: "Login successful",
			data: {
				accessToken,
				refreshToken,
				user: {
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					role: user.role,
					team: user.team,
					profilePicture: user.profilePicture,
				},
			},
		});
		console.log(accessToken);
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Refresh token endpoint
exports.RefreshToken = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({
				success: false,
				message: "Refresh token is required",
			});
		}

		// Verify refresh token
		let decoded;
		try {
			decoded = verifyToken(refreshToken);
		} catch (error) {
			return res.status(401).json({
				success: false,
				message: "Invalid refresh token",
			});
		}

		// Find user and check if refresh token matches
		const user = await User.findById(decoded.id).populate({
			path: "role",
			populate: {
				path: "permissions",
				model: "Permission",
				select: "key",
			},
		});

		if (!user || user.refreshToken !== refreshToken) {
			return res.status(401).json({
				success: false,
				message: "Invalid refresh token",
			});
		}

		// Generate new access token
		const newAccessToken = generateToken({
			id: user._id,
			email: user.email,
			name: `${user.firstName} ${user.lastName}`,
			role: {
				id: user.role._id,
				key: user.role.key,
				permissions: user.role.permissions,
			},
		});

		// Generate new refresh token
		const newRefreshToken = generateRefreshToken({
			id: user._id,
			email: user.email,
		});

		// Update refresh token in database
		await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

		res.status(200).json({
			success: true,
			message: "Token refreshed successfully",
			data: {
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			},
		});
	} catch (error) {
		console.error("RefreshToken error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Logout endpoint
exports.Logout = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({
				success: false,
				message: "Refresh token is required",
			});
		}

		// Find user by refresh token and clear it
		const user = await User.findOne({ refreshToken });

		if (user) {
			await User.findByIdAndUpdate(user._id, { refreshToken: null });
		}

		res.status(200).json({
			success: true,
			message: "Logged out successfully",
		});
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

exports.GetProfile = async (req, res) => {
	try {
		let userId = req.params.id; // Get userId from query parameters

		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "User ID is required",
			});
		}

		// Handle "me" case - get user ID from JWT token
		if (userId === "me") {
			userId = req.user.id;
		}

		const user = await User.findById(userId).populate({
			path: "role",
			populate: {
				path: "permissions",
				model: "Permission",
				select: "key",
			},
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.error("GetProfile error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Get current user's profile
exports.GetMyProfile = async (req, res) => {
	try {
		const userId = req.user.id;

		const user = await User.findById(userId).populate({
			path: "role",
			populate: {
				path: "permissions",
				model: "Permission",
				select: "key",
			},
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.error("GetMyProfile error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Update user profile
exports.UpdateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const { firstName, lastName, phoneNumber, dateOfBirth } = req.body;

		const updateData = {};
		if (firstName) updateData.firstName = firstName;
		if (lastName) updateData.lastName = lastName;
		if (phoneNumber) updateData.phoneNumber = phoneNumber;
		if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;

		// Handle photo upload if provided
		if (req.file) {
			updateData.profilePicture = req.uploadurl;
		}

		const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
			new: true,
		}).populate({
			path: "role",
			populate: {
				path: "permissions",
				model: "Permission",
				select: "key",
			},
		});

		if (!updatedUser) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: updatedUser,
		});
	} catch (error) {
		console.error("UpdateProfile error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Change user password
exports.ChangePassword = async (req, res) => {
	try {
		const userId = req.user.id;
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Current password and new password are required",
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Verify current password
		if (user.password !== currentPassword) {
			return res.status(401).json({
				success: false,
				message: "Current password is incorrect",
			});
		}

		// Update password
		user.password = newPassword;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Password changed successfully",
		});
	} catch (error) {
		console.error("ChangePassword error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};
