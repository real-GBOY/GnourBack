/**
 * Event Filtering and Access Control Utilities
 * Contains all event-related filtering logic and access control helper functions
 */

const Event = require("../Models/Events");

// ==================== EVENT ACCESS POLICIES ====================

/**
 * Event access policies for different roles
 */
const eventAccessPolicies = {
  // President can see all events
  President: () => ({}),
  
  // Head can see events they created, are invited to, or events created by team members
  Head: (user) => ({
    $or: [
      { createdBy: user.id || user._id },
      { guests: { $in: [user.id || user._id] } }
    ]
  }),
  
  // ViceHead can see events they created, are invited to, or events created by team members
  ViceHead: (user) => ({
    $or: [
      { createdBy: user.id || user._id },
      { guests: { $in: [user.id || user._id] } }
    ]
  }),
  
  // Member can see events they created or are invited to
  Member: (user) => ({
    $or: [
      { createdBy: user.id || user._id },
      { guests: { $in: [user.id || user._id] } }
    ]
  }),
  
  // HrMember can see events they created or are invited to
  HrMember: (user) => ({
    $or: [
      { createdBy: user.id || user._id },
      { guests: { $in: [user.id || user._id] } }
    ]
  })
};

/**
 * Get access filter for events based on user's role
 * @param {Object} user - The user object with role information
 * @returns {Object} MongoDB filter object
 */
const getEventAccessFilter = (user) => {
  // If no user, return empty filter (no access)
  if (!user) {
    return { _id: null };
  }

  // Get user's role name - handle both populated role object and role key
  let roleName;
  if (user.role && typeof user.role === 'object' && user.role.key) {
    roleName = user.role.key;
  } else if (typeof user.role === 'string') {
    roleName = user.role;
  } else {
    console.warn('No valid role found for user:', user);
    return { _id: null };
  }
  
  // If no role, return empty filter
  if (!roleName) {
    return { _id: null };
  }

  // Get the policy for this role
  const rolePolicy = eventAccessPolicies[roleName];
  if (!rolePolicy) {
    console.warn(`No access policy defined for role: ${roleName} on events`);
    return { _id: null };
  }

  // Return the filter for this user and role
  return rolePolicy(user);
};

// ==================== ACCESS CONTROL HELPER FUNCTIONS ====================

/**
 * Get filtered events based on user's access permissions
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Array>} Filtered events
 */
const getFilteredEvents = async (user) => {
  const accessFilter = getEventAccessFilter(user);
  return await Event.find(accessFilter)
    .populate("createdBy", "firstName lastName email profilePicture")
    .populate("guests", "firstName lastName email profilePicture");
};

/**
 * Get a single event by ID with access control
 * @param {string} eventId - The event ID
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Object|null>} Event object or null if not found/access denied
 */
const getEventWithAccessControl = async (eventId, user) => {
  const accessFilter = getEventAccessFilter(user);

  // Find event with access control
  const event = await Event.findOne({
    _id: eventId,
    ...accessFilter
  })
    .populate("createdBy", "firstName lastName email profilePicture")
    .populate("guests", "firstName lastName email profilePicture");

  return event;
};

/**
 * Check if user has access to a specific event
 * @param {string} eventId - The event ID
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Object|null>} Event object or null if access denied
 */
const checkEventAccess = async (eventId, user) => {
  const event = await getEventWithAccessControl(eventId, user);
  return event;
};

/**
 * Populate event with user details
 * @param {Object} event - The event object
 * @returns {Promise<Object>} Populated event
 */
const populateEvent = async (event) => {
  return await Event.findById(event._id)
    .populate("createdBy", "firstName lastName email profilePicture")
    .populate("guests", "firstName lastName email profilePicture");
};

// ==================== GUEST MANAGEMENT FUNCTIONS ====================

/**
 * Add guests to an event
 * @param {string} eventId - The event ID
 * @param {Array} guestIds - Array of user IDs to add as guests
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Object>} Updated event
 */
const addGuestsToEvent = async (eventId, guestIds, user) => {
  // Check if user has access to modify this event
  const event = await checkEventAccess(eventId, user);
  if (!event) {
    throw new Error("Event not found or access denied");
  }

  // Add guests to the event
  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $addToSet: { guests: { $each: guestIds } } },
    { new: true }
  );

  return await populateEvent(updatedEvent);
};

/**
 * Remove guests from an event
 * @param {string} eventId - The event ID
 * @param {Array} guestIds - Array of user IDs to remove from guests
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Object>} Updated event
 */
const removeGuestsFromEvent = async (eventId, guestIds, user) => {
  // Check if user has access to modify this event
  const event = await checkEventAccess(eventId, user);
  if (!event) {
    throw new Error("Event not found or access denied");
  }

  // Remove guests from the event
  const updatedEvent = await Event.findByIdAndUpdate(
    eventId,
    { $pull: { guests: { $in: guestIds } } },
    { new: true }
  );

  return await populateEvent(updatedEvent);
};

module.exports = {
  // Access Control Functions
  getFilteredEvents,
  getEventWithAccessControl,
  checkEventAccess,
  populateEvent,
  
  // Guest Management Functions
  addGuestsToEvent,
  removeGuestsFromEvent,
  
  // Access Policies (for internal use)
  eventAccessPolicies,
  getEventAccessFilter
};
