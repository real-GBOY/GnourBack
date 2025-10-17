# Access Control System with $or Pipelines

This system provides role-based access control using MongoDB's `$or` pipelines to filter data based on user roles and permissions.

## Overview

The access control system automatically filters data based on:
- **User Role**: President, Head, ViceHead, Member, HrMember
- **Resource Type**: tasks, events, teams, users, feedbacks, attendance
- **Ownership Fields**: createdBy, assignedTo, teamId, etc.

## How It Works

### 1. Access Policies (`config/accessPolicies.js`)

Defines what each role can access for each resource:

```javascript
// Example: Task access for Head role
Head: (user) => ({
  $or: [
    { createdBy: user._id },           // Tasks they created
    { assignedTo: { $in: [user._id] } }, // Tasks assigned to them
    { teamId: user.team }              // Tasks in their team
  ]
})
```

### 2. Access Control Middleware (`Middlewares/AccessControlMiddleware.js`)

Provides middleware functions to check access:

```javascript
// Check if user can access a resource
checkResourceAccess('tasks')

// Check if user can access a specific item
checkItemAccess('tasks', () => Task)
```

### 3. Helper Functions

```javascript
// Get filtered data with access control
getFilteredDataWithAccess(Task, 'tasks', user, additionalFilter)

// Get filtered aggregation with access control
getFilteredAggregationWithAccess(Task, 'tasks', user, pipeline)
```

## Usage Examples

### Basic Usage in Controllers

```javascript
// Get tasks with access control
exports.getTasks = async (req, res) => {
  const { getFilteredDataWithAccess } = require('../Middlewares/AccessControlMiddleware');
  const tasks = await getFilteredDataWithAccess(Task, 'tasks', req.user);
  
  res.json({ success: true, data: tasks });
};
```

### Using with Aggregation Pipelines

```javascript
// Complex aggregation with access control
exports.getTaskStatistics = async (req, res) => {
  const pipeline = [
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ];
  
  const statistics = await getFilteredAggregationWithAccess(
    Task, 'tasks', req.user, pipeline
  );
  
  res.json({ success: true, data: statistics });
};
```

### Using in Routes

```javascript
// Apply access control to routes
router.get("/", checkResourceAccess('tasks'), TaskController.getTasks);
router.get("/:id", checkItemAccess('tasks', () => Task), TaskController.getTaskById);
```

## Access Policies by Role

### President
- **All Resources**: Full access to everything
- **Filter**: `{}` (no restrictions)

### Head
- **Tasks**: Can see tasks they created, are assigned to them, or are in their team
- **Events**: Can see events they created or are in their team
- **Teams**: Can see teams they created or are part of
- **Users**: Can see users in their team or unverified users
- **Feedback**: Can see feedback they created or are assigned to them
- **Attendance**: Can see attendance in their team

### ViceHead
- **Tasks**: Can see tasks they created, are assigned to them, or are in their team
- **Events**: Can see events they created or are in their team
- **Teams**: Can see teams they created or are part of
- **Users**: Can see users in their team
- **Feedback**: Can see feedback they created or are assigned to them
- **Attendance**: Can see attendance in their team

### Member
- **Tasks**: Can only see tasks they created or are assigned to them
- **Events**: Can only see events they created
- **Teams**: Can only see their own team
- **Users**: Can only see themselves
- **Feedback**: Can only see feedback they created
- **Attendance**: Can only see their own attendance

### HrMember
- **Tasks**: Can only see tasks they created or are assigned to them
- **Events**: Can only see events they created
- **Teams**: Can only see their own team
- **Users**: Can see users in their team
- **Feedback**: Can see feedback they created or are assigned to them
- **Attendance**: Can see attendance in their team

## Advanced Usage

### 1. Complex Search with Access Control

```javascript
exports.searchTasks = async (req, res) => {
  const { search, status, dateFrom, dateTo } = req.query;
  
  // Build search filter
  const searchFilter = {};
  if (search) {
    searchFilter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (status) searchFilter.status = status;
  if (dateFrom || dateTo) {
    searchFilter.createdAt = {};
    if (dateFrom) searchFilter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) searchFilter.createdAt.$lte = new Date(dateTo);
  }
  
  // Apply access control with additional filters
  const tasks = await getFilteredDataWithAccess(Task, 'tasks', req.user, searchFilter);
  
  res.json({ success: true, data: tasks });
};
```

### 2. Dashboard with Aggregation

```javascript
exports.getUserDashboard = async (req, res) => {
  const pipeline = [
    {
      $addFields: {
        isOverdue: {
          $and: [
            { $lt: ['$dueDate', new Date()] },
            { $ne: ['$status', 'completed'] }
          ]
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        overdueCount: { $sum: { $cond: ['$isOverdue', 1, 0] } }
      }
    }
  ];
  
  const dashboard = await getFilteredAggregationWithAccess(Task, 'tasks', req.user, pipeline);
  
  res.json({ success: true, data: dashboard });
};
```

### 3. Team-based Filtering

```javascript
exports.getTasksByTeam = async (req, res) => {
  const { teamId } = req.params;
  
  // Access control automatically applies $or filters based on user role
  // Additional filters can be added
  const additionalFilter = teamId ? { teamId } : {};
  
  const tasks = await getFilteredDataWithAccess(Task, 'tasks', req.user, additionalFilter);
  
  res.json({ success: true, data: tasks });
};
```

## Integration Steps

### 1. Update Your Controllers

Replace direct model queries with access-controlled versions:

```javascript
// Before
const tasks = await Task.find();

// After
const { getFilteredDataWithAccess } = require('../Middlewares/AccessControlMiddleware');
const tasks = await getFilteredDataWithAccess(Task, 'tasks', req.user);
```

### 2. Update Your Routes

Add access control middleware:

```javascript
// Before
router.get("/", TaskController.getTasks);

// After
router.get("/", checkResourceAccess('tasks'), TaskController.getTasks);
```

### 3. Update Your Models

Ensure your models have the necessary fields for access control:

```javascript
// Task model should have these fields
{
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
}
```

## Benefits

1. **Automatic Filtering**: Data is automatically filtered based on user role
2. **Flexible**: Easy to modify access policies without changing controllers
3. **Secure**: Prevents unauthorized access to data
4. **Scalable**: Works with both simple queries and complex aggregations
5. **Maintainable**: Centralized access control logic

## Testing

Test different roles to ensure access control works correctly:

```javascript
// Test President access (should see all tasks)
const presidentUser = { _id: 'user1', role: { key: 'President' } };
const presidentTasks = await getFilteredDataWithAccess(Task, 'tasks', presidentUser);

// Test Member access (should only see their tasks)
const memberUser = { _id: 'user2', role: { key: 'Member' } };
const memberTasks = await getFilteredDataWithAccess(Task, 'tasks', memberUser);
```

## Troubleshooting

### Common Issues

1. **No data returned**: Check if user has proper role and team assignment
2. **Access denied errors**: Verify access policies are correctly defined
3. **Performance issues**: Consider adding indexes on frequently queried fields

### Debug Mode

Enable debug logging to see what filters are being applied:

```javascript
// In accessPolicies.js
const getAccessFilter = (resource, user) => {
  const filter = rolePolicy(user);
  console.log(`Access filter for ${resource}:`, JSON.stringify(filter, null, 2));
  return filter;
};
```

This system provides a robust, scalable solution for role-based access control using MongoDB's powerful aggregation capabilities.

