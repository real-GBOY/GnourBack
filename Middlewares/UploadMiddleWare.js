/** @format */

const mutler = require("multer");

const { cloudinary } = require("../config/cloudinary");

const { Readable } = require("stream");
const { error } = require("console");

const storage = mutler.memoryStorage();

// File validation function
const validateFile = (file) => {
	const errors = [];

	// Check if file exists
	if (!file) {
		errors.push("No file uploaded");
		return errors;
	}

	// Check file size (5MB limit)
	const maxSize = 5 * 1024 * 1024; // 5MB in bytes
	if (file.size > maxSize) {
		errors.push("File size too large. Maximum size is 5MB");
	}

	// Check file type
	const allowedTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
		"application/pdf",
		"text/plain",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	];

	if (!allowedTypes.includes(file.mimetype)) {
		errors.push(
			"Invalid file type. Allowed types: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX"
		);
	}

	return errors;
};

// Create a flexible upload middleware that can handle different field names
const createUploadMiddleware = (fieldName = "file") => {
	const upload = mutler({
		storage,
		limits: {
			fileSize: 5 * 1024 * 1024, // 5MB limit
			files: 1, // Only allow 1 file
		},
		fileFilter: (req, file, cb) => {
			const allowedTypes = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/gif",
				"image/webp",
				"application/pdf",
				"text/plain",
				"application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			];

			if (allowedTypes.includes(file.mimetype)) {
				cb(null, true);
			} else {
				cb(
					new Error(
						"Invalid file type. Allowed types: JPG, PNG, GIF, WEBP, PDF, TXT, DOC, DOCX"
					),
					false
				);
			}
		},
	});

	return upload.single(fieldName);
};

function bufferToStream(buffer) {
	const readable = new Readable();

	readable._read = () => {};

	readable.push(buffer);
	readable.push(null);
	return readable;
}

//upload to dir gnour

const handleupload = [
	createUploadMiddleware("file"), // Default field name
	async (req, res, next) => {
		try {
			// Validate file
			const validationErrors = validateFile(req.file);
			if (validationErrors.length > 0) {
				return res.status(400).json({
					error: "File validation failed",
					details: validationErrors,
				});
			}

			const stream = cloudinary.uploader.upload_stream(
				{
					folder: "Gnour",
					resource_type: "auto",
					// Prevent cropping for images
					crop: "limit",
					width: 2000,
					height: 2000,
					quality: "auto",
					fetch_format: "auto",
				},
				(error, result) => {
					if (error) {
						console.error(error);
						return res
							.status(500)
							.json({ error: "Error uploading file: " + error.message });
					}
					req.uploadurl = result.secure_url;
					next();
				}
			);
			stream.end(req.file.buffer);
		} catch (error) {
			console.error(error);
			res.status(500).json({ error: "Error uploading file: " + error.message });
		}
	},
];

// Export both the default handler and a function to create custom handlers
module.exports = {
	handleupload,
	createUploadMiddleware,
};
