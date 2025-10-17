/**
 * Access Control Middleware
 * Integrates with existing authentication to provide role-based access control
 *
 * @format
 */

const {
	getAccessFilter,
	getFilteredData,
	getFilteredAggregation,
} = require("../config/accessPolicies");

/**
 * Middleware to check if user has access to a specific resource
 * @param {string} resource - The resource type to check access for
 * @returns {Function} Express middleware function
 */
const checkResourceAccess = (resource) => {
	return async (req, res, next) => {
		try {
			const user = req.user;

			if (!user) {
				return res.status(401).json({
					success: false,
					message: "Authentication required",
				});
			}

			// Get access filter for this user and resource
			let accessFilter;

			// Special handling per resource to get access filter
			if (resource === "tasks") {
				const { getTaskAccessFilter } = require("../utils/taskFilters");
				accessFilter = await getTaskAccessFilter(user);
			} else if (resource === "events") {
				const { getEventAccessFilter } = require("../utils/eventFilters");
				accessFilter = await getEventAccessFilter(user);
			} else if (resource === "feedbacks") {
				const { getFeedbackAccessFilter } = require("../utils/feedbackFilters");
				accessFilter = await getFeedbackAccessFilter(user);
			} else {
				accessFilter = getAccessFilter(resource, user);
			}

			// If filter returns { _id: null }, user has no access
			if (accessFilter._id === null) {
				return res.status(403).json({
					success: false,
					message: "Access denied",
				});
			}

			// Store the access filter in request for use in controllers
			req.accessFilter = accessFilter;
			next();
		} catch (error) {
			console.error("Access control error:", error);
			return res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	};
};

/**
 * Middleware to check if user can access a specific item by ID
 * @param {string} resource - The resource type
 * @param {Function} getModel - Function that returns the Mongoose model
 * @returns {Function} Express middleware function
 */
const checkItemAccess = (resource, getModel) => {
	return async (req, res, next) => {
		try {
			const user = req.user;
			const itemId = req.params.id;

			if (!user) {
				return res.status(401).json({
					success: false,
					message: "Authentication required",
				});
			}

			if (!itemId) {
				return res.status(400).json({
					success: false,
					message: "Item ID is required",
				});
			}

			const Model = getModel();
			let accessFilter;

			// Special handling per resource to get access filter
			if (resource === "tasks") {
				const { getTaskAccessFilter } = require("../utils/taskFilters");
				accessFilter = await getTaskAccessFilter(user);
			} else if (resource === "events") {
				const { getEventAccessFilter } = require("../utils/eventFilters");
				accessFilter = await getEventAccessFilter(user);
			} else if (resource === "feedbacks") {
				const { getFeedbackAccessFilter } = require("../utils/feedbackFilters");
				accessFilter = await getFeedbackAccessFilter(user);
			} else {
				accessFilter = getAccessFilter(resource, user);
			}

			// Check if user can access this specific item
			const item = await Model.findOne({
				_id: itemId,
				...accessFilter,
			});

			if (!item) {
				return res.status(403).json({
					success: false,
					message: "Access denied to this item",
				});
			}

			// Store the item in request for use in controllers
			req.item = item;
			next();
		} catch (error) {
			console.error("Item access control error:", error);
			return res.status(500).json({
				success: false,
				message: "Internal server error",
			});
		}
	};
};

/**
 * Helper function to get filtered data with access control
 * @param {Object} Model - Mongoose model
 * @param {string} resource - Resource type
 * @param {Object} user - User object
 * @param {Object} additionalFilter - Additional filter to apply
 * @returns {Promise<Array>} Filtered results
 */
const getFilteredDataWithAccess = async (
	Model,
	resource,
	user,
	additionalFilter = {}
) => {
	return await getFilteredData(Model, resource, user, additionalFilter);
};

/**
 * Helper function to get filtered aggregation with access control
 * @param {Object} Model - Mongoose model
 * @param {string} resource - Resource type
 * @param {Object} user - User object
 * @param {Array} pipeline - Additional aggregation stages
 * @returns {Promise<Array>} Filtered results
 */
const getFilteredAggregationWithAccess = async (
	Model,
	resource,
	user,
	pipeline = []
) => {
	return await getFilteredAggregation(Model, resource, user, pipeline);
};

/**
 * Middleware to add access control helpers to request object
 */
const addAccessHelpers = (req, res, next) => {
	// Add helper functions to request object
	req.getFilteredData = (Model, resource, additionalFilter = {}) => {
		return getFilteredDataWithAccess(
			Model,
			resource,
			req.user,
			additionalFilter
		);
	};

	req.getFilteredAggregation = (Model, resource, pipeline = []) => {
		return getFilteredAggregationWithAccess(
			Model,
			resource,
			req.user,
			pipeline
		);
	};

	req.getAccessFilter = (resource) => {
		const { getAccessFilter } = require("../config/accessPolicies");
		return getAccessFilter(resource, req.user);
	};

	next();
};

module.exports = {
	checkResourceAccess,
	checkItemAccess,
	addAccessHelpers,
	getFilteredDataWithAccess,
	getFilteredAggregationWithAccess,
};
