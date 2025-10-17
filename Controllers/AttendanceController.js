/** @format */

const Attendance = require("../Models/Attendance");
const mongoose = require("mongoose");

// Helper function to convert string to ObjectId
const toObjectId = (id) => {
	if (!id) return null;
	return mongoose.Types.ObjectId.isValid(id)
		? id
		: new mongoose.Types.ObjectId(id);
};

// Populate options (cleaner and reusable)
const populateOptions = [
	{ path: "user", select: "firstName lastName email" },
	{ path: "event", select: "title startDate endDate" },
	{ path: "verifiedBy", select: "firstName lastName" },
	{ path: "feedbackBy", select: "firstName lastName" },
];

// Create attendance record
exports.createAttendance = async (req, res) => {
	try {
		const {
			user,
			event,
			attendance,
			status,
			lateMinutes,
			earlyLeaveMinutes,
			feedback,
			checkInTime,
			checkOutTime,
		} = req.body;

		const attendanceRecord = new Attendance({
			user: toObjectId(user),
			event: toObjectId(event),
			attendance,
			status,
			lateMinutes,
			earlyLeaveMinutes,
			feedback,
			checkInTime,
			checkOutTime,
		});

		await attendanceRecord.save();

		const populatedRecord = await attendanceRecord.populate(populateOptions);

		res.status(201).json({
			message: "Attendance record created successfully",
			data: populatedRecord,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get all attendance records
// ! Need edit with populate options
exports.getAllAttendance = async (req, res) => {
	try {
		const records = await Attendance.find().populate(populateOptions);
		res.status(200).json(records);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get attendance by ID
exports.getAttendanceById = async (req, res) => {
	try {
		const { id } = req.params;
		const record = await Attendance.findById(id).populate(populateOptions);

		if (!record) {
			return res.status(404).json({ message: "Attendance record not found" });
		}

		res.status(200).json(record);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get attendance by user
exports.getAttendanceByUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const records = await Attendance.find({ user: userId }).populate(
			populateOptions
		);
		res.status(200).json(records);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get attendance by event
exports.getAttendanceByEvent = async (req, res) => {
	try {
		const { eventId } = req.params;
		const records = await Attendance.find({ event: eventId }).populate(
			populateOptions
		);
		res.status(200).json(records);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		const record = await Attendance.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		}).populate(populateOptions);

		if (!record) {
			return res.status(404).json({ message: "Attendance record not found" });
		}

		res.status(200).json({
			message: "Attendance record updated successfully",
			data: record,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
	try {
		const { id } = req.params;
		const record = await Attendance.findByIdAndDelete(id);

		if (!record) {
			return res.status(404).json({ message: "Attendance record not found" });
		}

		res.status(200).json({ message: "Attendance record deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Verify attendance
exports.verifyAttendance = async (req, res) => {
	try {
		const { id } = req.params;
		const { verified, verifiedBy, verificationNotes } = req.body;

		// Validate required fields
		if (verified === undefined) {
			return res.status(400).json({ message: "Verified status is required" });
		}

		if (!verifiedBy) {
			return res.status(400).json({ message: "Verifier ID is required" });
		}

		// Check if attendance record exists
		const existingRecord = await Attendance.findById(id);
		if (!existingRecord) {
			return res.status(404).json({ message: "Attendance record not found" });
		}

		// Update verification status
		const updateData = {
			verified,
			verifiedBy: toObjectId(verifiedBy),
			...(verificationNotes && { verificationNotes }),
		};

		const record = await Attendance.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		}).populate(populateOptions);

		res.status(200).json({
			message: `Attendance ${
				verified ? "verified" : "unverified"
			} successfully`,
			data: record,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Bulk verify attendance for an event
exports.bulkVerifyAttendance = async (req, res) => {
	try {
		const { eventId } = req.params;
		const { attendanceIds, verified, verifiedBy, verificationNotes } = req.body;

		// Validate required fields
		if (
			!attendanceIds ||
			!Array.isArray(attendanceIds) ||
			attendanceIds.length === 0
		) {
			return res
				.status(400)
				.json({ message: "Attendance IDs array is required" });
		}

		if (verified === undefined) {
			return res.status(400).json({ message: "Verified status is required" });
		}

		if (!verifiedBy) {
			return res.status(400).json({ message: "Verifier ID is required" });
		}

		// Update multiple attendance records
		const updateData = {
			verified,
			verifiedBy: toObjectId(verifiedBy),
			...(verificationNotes && { verificationNotes }),
		};

		const result = await Attendance.updateMany(
			{
				_id: { $in: attendanceIds },
				event: eventId,
			},
			updateData
		);

		if (result.matchedCount === 0) {
			return res
				.status(404)
				.json({ message: "No matching attendance records found" });
		}

		// Get updated records
		const updatedRecords = await Attendance.find({
			_id: { $in: attendanceIds },
		}).populate(populateOptions);

		res.status(200).json({
			message: `Successfully ${verified ? "verified" : "unverified"} ${
				result.modifiedCount
			} attendance records`,
			modifiedCount: result.modifiedCount,
			data: updatedRecords,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Get verification statistics for an event
exports.getVerificationStats = async (req, res) => {
	try {
		const { eventId } = req.params;

		const stats = await Attendance.aggregate([
			{ $match: { event: new mongoose.Types.ObjectId(eventId) } },
			{
				$group: {
					_id: null,
					totalRecords: { $sum: 1 },
					verifiedCount: { $sum: { $cond: ["$verified", 1, 0] } },
					unverifiedCount: { $sum: { $cond: ["$verified", 0, 1] } },
					presentCount: {
						$sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
					},
					absentCount: {
						$sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
					},
					lateCount: { $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] } },
					excusedCount: {
						$sum: { $cond: [{ $eq: ["$status", "excused"] }, 1, 0] },
					},
					leftEarlyCount: {
						$sum: { $cond: [{ $eq: ["$status", "left_early"] }, 1, 0] },
					},
				},
			},
		]);

		if (stats.length === 0) {
			return res
				.status(404)
				.json({ message: "No attendance records found for this event" });
		}

		const verificationRate =
			(stats[0].verifiedCount / stats[0].totalRecords) * 100;

		res.status(200).json({
			eventId,
			statistics: {
				...stats[0],
				verificationRate: Math.round(verificationRate * 100) / 100,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// Add feedback to attendance
exports.addFeedback = async (req, res) => {
	try {
		const { id } = req.params;
		const { feedback, feedbackBy } = req.body;

		const record = await Attendance.findByIdAndUpdate(
			id,
			{ feedback, feedbackBy: toObjectId(feedbackBy) },
			{ new: true, runValidators: true }
		).populate(populateOptions);

		if (!record) {
			return res.status(404).json({ message: "Attendance record not found" });
		}

		res.status(200).json({
			message: "Feedback added successfully",
			data: record,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
