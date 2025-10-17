/** @format */

const Event = require("../Models/Events");
const {
  getFilteredEvents,
  getEventWithAccessControl,
  checkEventAccess,
  populateEvent,
  addGuestsToEvent,
  removeGuestsFromEvent
} = require("../utils/eventFilters");

exports.CreateEvent = async (req, res) => {
	try {
		const {
			title,
			description,
			startDate,
			endDate,
			location,
			eventType,
			createdBy,
			guests,
		} = req.body;

		let agenda;
		if (req.file && req.uploadurl) {
			agenda = req.uploadurl;
		}

		const event = new Event({
			title,
			description,
			startDate,
			endDate,
			location,
			agenda,
			eventType,
			createdBy,
			guests: guests || [],
		});
		await event.save();
		
		// Populate and return created event
		const populatedEvent = await populateEvent(event);
		
		res.status(201).json({ 
			success: true,
			message: "Event created successfully",
			data: populatedEvent
		});
	} catch (error) {
		console.error("Create event error:", error);
		res.status(500).json({ 
			success: false,
			message: error.message 
		});
	}
};

exports.GetEvents = async (req, res) => {
	try {
		const events = await getFilteredEvents(req.user);
		res.status(200).json({
			success: true,
			data: events
		});
	} catch (error) {
		console.error("Get events error:", error);
		res.status(500).json({ 
			success: false,
			message: error.message 
		});
	}
};

exports.GetEventsbyId = async (req, res) => {
	try {
		const { id } = req.params;
		const event = await getEventWithAccessControl(id, req.user);
		
		if (!event) {
			return res.status(404).json({
				success: false,
				message: "Event not found or access denied"
			});
		}
		
		res.status(200).json({
			success: true,
			data: event
		});
	} catch (error) {
		console.error("Get event by ID error:", error);
		res.status(500).json({ 
			success: false,
			message: error.message 
		});
	}
};

exports.DeleteEvent = async (req, res) => {
	try {
		const { id } = req.params;
		
		// Check access first
		const event = await checkEventAccess(id, req.user);
		
		if (!event) {
			return res.status(404).json({
				success: false,
				message: "Event not found or access denied"
			});
		}
		
		await Event.findByIdAndDelete(id);
		res.status(200).json({ 
			success: true,
			message: "Event deleted successfully" 
		});
	} catch (error) {
		console.error("Delete event error:", error);
		res.status(500).json({ 
			success: false,
			message: error.message 
		});
	}
};

exports.UpdateEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = req.body;

		// Check access first
		const existingEvent = await checkEventAccess(id, req.user);
		
		if (!existingEvent) {
			return res.status(404).json({
				success: false,
				message: "Event not found or access denied"
			});
		}

		// Handle file upload if present
		if (req.file && req.uploadurl) {
			updateData.agenda = req.uploadurl;
		}

		const event = await Event.findByIdAndUpdate(id, updateData, {
			new: true,
			runValidators: true,
		});

		// Populate and return updated event
		const updatedEvent = await populateEvent(event);

		res.status(200).json({
			success: true,
			message: "Event updated successfully",
			data: updatedEvent,
		});
	} catch (error) {
		console.error("Update event error:", error);
		res.status(500).json({ 
			success: false,
			message: error.message 
		});
	}
};

// ==================== GUEST MANAGEMENT ENDPOINTS ====================

exports.AddGuestsToEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const { guestIds } = req.body;

		if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Guest IDs array is required"
			});
		}

		const updatedEvent = await addGuestsToEvent(id, guestIds, req.user);
		
		res.status(200).json({
			success: true,
			message: "Guests added successfully",
			data: updatedEvent
		});
	} catch (error) {
		console.error("Add guests error:", error);
		res.status(500).json({ 
			success: false,
			message: error.message 
		});
	}
};

exports.RemoveGuestsFromEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const { guestIds } = req.body;

		if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: "Guest IDs array is required"
			});
		}

		const updatedEvent = await removeGuestsFromEvent(id, guestIds, req.user);
		
		res.status(200).json({
			success: true,
			message: "Guests removed successfully",
			data: updatedEvent
		});
	} catch (error) {
		console.error("Remove guests error:", error);
		res.status(500).json({ 
			success: false,
			message: error.message 
		});
	}
};
