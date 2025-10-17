/**
 * Task Filtering and Access Control Utilities
 * Contains all task-related filtering logic and access control helper functions
 */

const Task = require("../Models/Task");

// ==================== TASK ACCESS POLICIES ====================

/**
 * Task access policies for different roles
 */
const taskAccessPolicies = {
  // President can see all tasks
  President: () => ({}),
  
  // Head can see tasks they created or are assigned to them
  Head: (user) => ({
    $or: [
      { createdBy: user.id || user._id },
      { assignedTo: { $in: [user.id || user._id] } }
    ]
  }),
  
  // ViceHead can see tasks they created or are assigned to them
  ViceHead: (user) => ({
    $or: [
      { createdBy: user.id || user._id },
      { assignedTo: { $in: [user.id || user._id] } }
    ]
  }),
  
  // Member can only see tasks they created or are assigned to them
  Member: (user) => ({
    $or: [
      { createdBy: user.id || user._id },
      { assignedTo: { $in: [user.id || user._id] } }
    ]
  }),
  
  // HrMember can only see tasks they created or are assigned to them
  HrMember: (user) => ({
    $or: [
      { createdBy: user.id || user._id },
      { assignedTo: { $in: [user.id || user._id] } }
    ]
  })
};

/**
 * Get access filter for tasks based on user's role
 * @param {Object} user - The user object with role information
 * @returns {Object} MongoDB filter object
 */
const getTaskAccessFilter = (user) => {
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
  const rolePolicy = taskAccessPolicies[roleName];
  if (!rolePolicy) {
    console.warn(`No access policy defined for role: ${roleName} on tasks`);
    return { _id: null };
  }

  // Return the filter for this user and role
  return rolePolicy(user);
};

// ==================== ACCESS CONTROL HELPER FUNCTIONS ====================

/**
 * Get filtered tasks based on user's access permissions
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Array>} Filtered tasks
 */
const getFilteredTasks = async (user) => {
  const accessFilter = getTaskAccessFilter(user);
  return await Task.find(accessFilter)
    .populate("assignedTo", "firstName lastName email profilePicture")
    .populate("createdBy", "firstName lastName email profilePicture");
};

/**
 * Get a single task by ID with access control
 * @param {string} taskId - The task ID
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Object|null>} Task object or null if not found/access denied
 */
const getTaskWithAccessControl = async (taskId, user) => {
  const accessFilter = getTaskAccessFilter(user);

  // Find task with access control
  const task = await Task.findOne({
    _id: taskId,
    ...accessFilter
  })
    .populate("assignedTo", "firstName lastName email profilePicture")
    .populate("createdBy", "firstName lastName email profilePicture");

  return task;
};

/**
 * Check if user has access to a specific task
 * @param {string} taskId - The task ID
 * @param {Object} user - The authenticated user object
 * @returns {Promise<Object|null>} Task object or null if access denied
 */
const checkTaskAccess = async (taskId, user) => {
  const task = await getTaskWithAccessControl(taskId, user);
  return task;
};

/**
 * Populate task with user details
 * @param {Object} task - The task object
 * @returns {Promise<Object>} Populated task
 */
const populateTask = async (task) => {
  return await Task.findById(task._id)
    .populate("assignedTo", "firstName lastName email profilePicture")
    .populate("createdBy", "firstName lastName email profilePicture");
};

module.exports = {
  // Access Control Functions
  getFilteredTasks,
  getTaskWithAccessControl,
  checkTaskAccess,
  populateTask,
  
  // Access Policies (for internal use)
  taskAccessPolicies,
  getTaskAccessFilter
};
