/** @format */

const validator = require("validator");
const mongoose = require("mongoose");

const validateObjectId = (id) => {
	return mongoose.Types.ObjectId.isValid(id);
};

const validateEmail = (email) => {
	return validator.isEmail(email);
};

const validateDate = (date) => {
	return validator.isISO8601(date);
};

const validatePhone = (phone) => {
	return validator.isMobilePhone(phone, "any", { strictMode: false });
};

const validateRequestBody = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.body);
		if (error) {
			return res.status(400).json({
				success: false,
				message: "Validation error",
				errors: error.details.map((detail) => detail.message),
			});
		}
		next();
	};
};

const validateQueryParams = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.query);
		if (error) {
			return res.status(400).json({
				success: false,
				message: "Invalid query parameters",
				errors: error.details.map((detail) => detail.message),
			});
		}
		next();
	};
};

const validateParams = (schema) => {
	return (req, res, next) => {
		const { error } = schema.validate(req.params);
		if (error) {
			return res.status(400).json({
				success: false,
				message: "Invalid parameters",
				errors: error.details.map((detail) => detail.message),
			});
		}
		next();
	};
};

const validateId = (paramName) => {
	return (req, res, next) => {
		const id = req.params[paramName];
		if (!validateObjectId(id)) {
			return res.status(400).json({
				success: false,
				message: `Invalid ${paramName} format`,
			});
		}
		next();
	};
};

const validateDateRange = (startDateField, endDateField) => {
	return (req, res, next) => {
		const startDate = req.body[startDateField];
		const endDate = req.body[endDateField];

		if (startDate && endDate) {
			const start = new Date(startDate);
			const end = new Date(endDate);

			if (isNaN(start.getTime()) || isNaN(end.getTime())) {
				return res.status(400).json({
					success: false,
					message: "Invalid date format",
				});
			}

			if (end <= start) {
				return res.status(400).json({
					success: false,
					message: `${endDateField} must be after ${startDateField}`,
				});
			}
		}
		next();
	};
};

const validateTimeRange = (checkInField, checkOutField) => {
	return (req, res, next) => {
		const checkIn = req.body[checkInField];
		const checkOut = req.body[checkOutField];

		if (checkIn && checkOut) {
			const checkInTime = new Date(checkIn);
			const checkOutTime = new Date(checkOut);

			if (isNaN(checkInTime.getTime()) || isNaN(checkOutTime.getTime())) {
				return res.status(400).json({
					success: false,
					message: "Invalid time format",
				});
			}

			if (checkOutTime <= checkInTime) {
				return res.status(400).json({
					success: false,
					message: `${checkOutField} must be after ${checkInField}`,
				});
			}
		}
		next();
	};
};

const validateEnum = (field, allowedValues) => {
	return (req, res, next) => {
		const value = req.body[field];
		if (value && !allowedValues.includes(value)) {
			return res.status(400).json({
				success: false,
				message: `Invalid ${field}. Allowed values: ${allowedValues.join(
					", "
				)}`,
			});
		}
		next();
	};
};

module.exports = {
	validateObjectId,
	validateEmail,
	validateDate,
	validatePhone,
	validateRequestBody,
	validateQueryParams,
	validateParams,
	validateId,
	validateDateRange,
	validateTimeRange,
	validateEnum,
};
