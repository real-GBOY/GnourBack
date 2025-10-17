/** @format */

// Resolve default export from ESM model file
const ApplicantModule = require("../Models/Applicant");
const Applicant = ApplicantModule.default || ApplicantModule;

// Create new applicant
exports.createApplicant = async (req, res) => {
	try {
		const { firstName, lastName, email, phone, dateOfBirth } = req.body;

		// Prevent duplicates by email or phone, or same person (name + DOB)
		const duplicate = await Applicant.findOne({
			$or: [
				{
					email: String(email || "")
						.trim()
						.toLowerCase(),
				},
				{ phone },
				{
					$and: [
						{ firstName: String(firstName || "").trim() },
						{ lastName: String(lastName || "").trim() },
						{ dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null },
					],
				},
			],
		});

		if (duplicate) {
			return res.status(409).json({
				success: false,
				message:
					"Applicant already exists with the same email/phone or same name and date of birth.",
			});
		}

		const applicant = await Applicant.create(req.body);
		return res.status(201).json({ success: true, data: applicant });
	} catch (error) {
		if (error.name === "ValidationError") {
			return res.status(400).json({ success: false, message: error.message });
		}
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};

// Get all applicants with basic filtering and pagination
exports.getApplicants = async (req, res) => {
	try {
		const {
			page = 1,
			limit = 20,
			selectedTeam,
			academicYear,
			gender,
			q,
		} = req.query;

		const filters = {};
		if (selectedTeam) filters.selectedTeam = selectedTeam;
		if (academicYear) filters.academicYear = academicYear;
		if (gender) filters.gender = gender;
		if (q) {
			filters.$or = [
				{ firstName: { $regex: q, $options: "i" } },
				{ lastName: { $regex: q, $options: "i" } },
				{ email: { $regex: q, $options: "i" } },
			];
		}

		const skip = (Number(page) - 1) * Number(limit);
		const [items, total] = await Promise.all([
			Applicant.find(filters)
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit)),
			Applicant.countDocuments(filters),
		]);

		return res.status(200).json({
			success: true,
			data: items,
			pagination: {
				page: Number(page),
				limit: Number(limit),
				total,
				totalPages: Math.ceil(total / Number(limit) || 1),
			},
		});
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};

// Get single applicant by id
exports.getApplicantById = async (req, res) => {
	try {
		const { id } = req.params;
		const applicant = await Applicant.findById(id);
		if (!applicant) {
			return res
				.status(404)
				.json({ success: false, message: "Applicant not found" });
		}
		return res.status(200).json({ success: true, data: applicant });
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};

// Update applicant
exports.updateApplicant = async (req, res) => {
	try {
		const { id } = req.params;
		const updated = await Applicant.findByIdAndUpdate(id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!updated) {
			return res
				.status(404)
				.json({ success: false, message: "Applicant not found" });
		}
		return res.status(200).json({ success: true, data: updated });
	} catch (error) {
		if (error.name === "ValidationError") {
			return res.status(400).json({ success: false, message: error.message });
		}
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};

// Delete applicant
exports.deleteApplicant = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Applicant.findByIdAndDelete(id);
		if (!deleted) {
			return res
				.status(404)
				.json({ success: false, message: "Applicant not found" });
		}
		return res
			.status(200)
			.json({ success: true, message: "Applicant deleted" });
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: "Internal server error" });
	}
};
