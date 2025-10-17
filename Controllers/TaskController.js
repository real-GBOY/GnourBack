/** @format */

const Task = require("../Models/Task");
const User = require("../Models/User");
const { cloudinary } = require("../config/cloudinary");
const { extractpublicId } = require("../config/cloudinary");
const {
  getFilteredTasks,
  getTaskWithAccessControl,
  checkTaskAccess,
  populateTask
} = require("../utils/taskFilters");

// ==================== CONTROLLER FUNCTIONS ====================

// Create a new task (requires file upload)
exports.createTask = async (req, res) => {
	try {
		const {
			title,
			description,
			status = "pending",
			dueDate,
			whatAppGroup,
			assignedTo,
			userid,
		} = req.body;

		// Handle file upload
		const attachments = [
			{
				fileUrl: req.uploadurl,
				fileName: req.file.originalname,
				uploadedBy: userid,
				uploadedAt: new Date(),
			},
		];

		const task = new Task({
			title,
			description,
			status,
			dueDate,
			whatAppGroup,
			assignedTo: assignedTo || [],
			createdBy: userid, // Assuming user is authenticated
			attachments,
		});

		await task.save();

		// Populate assigned users and creator
		const populatedTask = await populateTask(task);

		res.status(201).json({
			success: true,
			message: "Task created successfully with file",
			data: populatedTask,
		});
	} catch (error) {
		console.error("Create task error:", error);

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

// Get all tasks with filtering and pagination
exports.getTasks = async (req, res) => {
	try {
		const tasks = await getFilteredTasks(req.user);

		res.status(200).json({
			success: true,
			data: tasks,
		});
	} catch (error) {
		console.error("Get tasks error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Get task by ID
exports.getTaskById = async (req, res) => {
	try {
		const { id } = req.params;
		const task = await getTaskWithAccessControl(id, req.user);

		if (!task) {
			return res.status(404).json({
				success: false,
				message: "Task not found or access denied",
			});
		}

		res.status(200).json({
			success: true,
			data: task,
		});
	} catch (error) {
		console.error("Get task by ID error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Update task
exports.updateTask = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, description, status, dueDate, whatAppGroup, assignedTo } =
			req.body;

		// Check access first
		const existingTask = await checkTaskAccess(id, req.user);

		if (!existingTask) {
			return res.status(404).json({
				success: false,
				message: "Task not found or access denied",
			});
		}

		// Validate status if provided
		if (status) {
			const validStatuses = ["pending", "completed", "in_progress"];
			if (!validStatuses.includes(status)) {
				return res.status(400).json({
					success: false,
					message: "Invalid status. Must be pending, completed, or in_progress",
				});
			}
		}

		// Update task
		const task = await Task.findByIdAndUpdate(
			id,
			{
				title,
				description,
				status,
				dueDate,
				whatAppGroup,
				assignedTo,
			},
			{ new: true }
		);

		await task.save();

		// Populate and return updated task
		const updatedTask = await populateTask(task);

		res.status(200).json({
			success: true,
			message: "Task updated successfully",
			data: updatedTask,
		});
	} catch (error) {
		console.error("Update task error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Delete task
exports.deleteTask = async (req, res) => {
	try {
		const { id } = req.params;

		// Check access first
		const task = await checkTaskAccess(id, req.user);

		if (!task) {
			return res.status(404).json({
				success: false,
				message: "Task not found or access denied",
			});
		}

		// Delete attachments from Cloudinary if they exist
		if (task.attachments && task.attachments.length > 0) {
			for (const attachment of task.attachments) {
				try {
					const publicId = extractpublicId(attachment.fileUrl);
					await cloudinary.uploader.destroy(publicId);
				} catch (cloudinaryError) {
					console.error("Error deleting from Cloudinary:", cloudinaryError);
				}
			}
		}

		await Task.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Task deleted successfully",
		});
	} catch (error) {
		console.error("Delete task error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Upload file to task
exports.uploadFileToTask = async (req, res) => {
	try {
		const { taskId } = req.params;
		const { userid } = req.body;

		// Check access first
		const task = await checkTaskAccess(taskId, req.user);

		if (!task) {
			return res.status(404).json({
				success: false,
				message: "Task not found or access denied",
			});
		}

		// Add new attachment
		const newAttachment = {
			fileUrl: req.uploadurl,
			fileName: req.file.originalname,
			uploadedBy: userid,
			uploadedAt: new Date(),
		};

		task.attachments.push(newAttachment);
		await task.save();

		// Populate and return updated task
		const updatedTask = await populateTask(task);

		res.status(200).json({
			success: true,
			message: "File uploaded successfully",
			data: updatedTask,
		});
	} catch (error) {
		console.error("Upload file to task error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Remove file from task
exports.removeFileFromTask = async (req, res) => {
	try {
		const { taskId, fileId } = req.params;

		// Check access first
		const task = await checkTaskAccess(taskId, req.user);

		if (!task) {
			return res.status(404).json({
				success: false,
				message: "Task not found or access denied",
			});
		}

		// Find the attachment
		const attachment = task.attachments.id(fileId);
		if (!attachment) {
			return res.status(404).json({
				success: false,
				message: "File not found",
			});
		}

		// Delete from Cloudinary
		try {
			const publicId = extractpublicId(attachment.fileUrl);
			await cloudinary.uploader.destroy(publicId);
		} catch (cloudinaryError) {
			console.error("Error deleting from Cloudinary:", cloudinaryError);
		}

		// Remove from task
		task.attachments.pull(fileId);
		await task.save();

		// Populate and return updated task
		const updatedTask = await populateTask(task);

		res.status(200).json({
			success: true,
			message: "File removed successfully",
			data: updatedTask,
		});
	} catch (error) {
		console.error("Remove file from task error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Assign task to users
exports.assignTaskToUsers = async (req, res) => {
	try {
		const { taskId } = req.params;
		const { userIds } = req.body;

		// Check access first
		const task = await checkTaskAccess(taskId, req.user);

		if (!task) {
			return res.status(404).json({
				success: false,
				message: "Task not found or access denied",
			});
		}

		// Validate user IDs
		const validUsers = await User.find({ _id: { $in: userIds } });
		if (validUsers.length !== userIds.length) {
			return res.status(400).json({
				success: false,
				message: "Some user IDs are invalid",
			});
		}

		// Update task assignment
		task.assignedTo = userIds;
		await task.save();

		// Populate and return updated task
		const updatedTask = await populateTask(task);

		res.status(200).json({
			success: true,
			message: "Task assigned successfully",
			data: updatedTask,
		});
	} catch (error) {
		console.error("Assign task to users error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Add users to task
exports.addUsersToTask = async (req, res) => {
	try {
		const { taskId } = req.params;
		const { userIds } = req.body;

		// Check access first
		const task = await checkTaskAccess(taskId, req.user);

		if (!task) {
			return res.status(404).json({
				success: false,
				message: "Task not found or access denied",
			});
		}

		// Validate user IDs
		const validUsers = await User.find({ _id: { $in: userIds } });
		if (validUsers.length !== userIds.length) {
			return res.status(400).json({
				success: false,
				message: "Some user IDs are invalid",
			});
		}

		// Add users to task (avoid duplicates)
		const newUserIds = userIds.filter(id => !task.assignedTo.includes(id));
		task.assignedTo.push(...newUserIds);
		await task.save();

		// Populate and return updated task
		const updatedTask = await populateTask(task);

		res.status(200).json({
			success: true,
			message: "Users added to task successfully",
			data: updatedTask,
		});
	} catch (error) {
		console.error("Add users to task error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

// Remove users from task
exports.removeUsersFromTask = async (req, res) => {
	try {
		const { taskId } = req.params;
		const { userIds } = req.body;

		// Check access first
		const task = await checkTaskAccess(taskId, req.user);

		if (!task) {
			return res.status(404).json({
				success: false,
				message: "Task not found or access denied",
			});
		}

		// Remove users from task
		task.assignedTo = task.assignedTo.filter(id => !userIds.includes(id.toString()));
		await task.save();

		// Populate and return updated task
		const updatedTask = await populateTask(task);

		res.status(200).json({
			success: true,
			message: "Users removed from task successfully",
			data: updatedTask,
		});
	} catch (error) {
		console.error("Remove users from task error:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

	