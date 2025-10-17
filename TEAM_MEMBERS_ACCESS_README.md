<!-- @format -->

# Team Members Access for Normal Members

## Overview

This update allows normal members (Members and HrMembers) to view other users' profiles within their team and across other teams in the organization. Previously, these roles were restricted from viewing any user profiles.

## Changes Made

### 1. New Permission Added

- **`ViewTeamMembers`**: New permission that allows users to see team member profiles across the organization

### 2. Role Updates

- **Member Role**: Now includes `ViewTeamMembers` permission
- **HrMember Role**: Now includes `ViewTeamMembers` permission

### 3. Access Control Updates

- **Members** and **HrMembers** can now see all users across the organization (when they have `ViewTeamMembers` permission)
- **Head** and **ViceHead** still restricted to their own team members
- **President** maintains full access to all users

### 4. New API Endpoints

#### Get Team Members for Specific Team

```
GET /api/users/team/:teamId/members
```

- **Permission Required**: `ViewTeamMembers`
- **Purpose**: Get all members of a specific team
- **Response**: List of users with basic profile information (name, email, profile picture, role, verification status)

#### Get All Teams with Members

```
GET /api/users/teams/with-members
```

- **Permission Required**: `ViewTeamMembers`
- **Purpose**: Get organizational structure with all teams and their members
- **Response**: List of teams with their members, team leaders, and vice heads

### 5. Updated Existing Endpoints

#### Get All Users

```
GET /api/users
```

- **Permission Required**: `ViewPerson` OR `ViewTeamMembers`
- **Purpose**: Get all users in the system
- **Response**: List of users with appropriate data filtering based on permission level

#### Get Specific User

```
GET /api/users/:id
```

- **Permission Required**: `ViewPerson` OR `ViewTeamMembers`
- **Purpose**: Get details of a specific user
- **Response**: User details with appropriate data filtering based on permission level

## Permission Logic

### Dual Permission Support

The system now supports two permission types for viewing user data:

1. **`ViewPerson`**: Traditional permission for administrators and team leaders

   - Full access to user data
   - Subject to team-based restrictions for Head/ViceHead roles
   - Used by existing access control logic

2. **`ViewTeamMembers`**: New permission for normal members
   - Access to view all users across the organization
   - Filtered data (no sensitive information)
   - No team-based restrictions

### Permission Checking Flow

```
User Request → Check Role → Check Permissions → Apply Access Control
     ↓              ↓              ↓                ↓
  JWT Token → Role Object → Permission Array → Data Filtering
```

## Usage Examples

### For Normal Members

1. **View your team members**: Use `/team/:teamId/members` with your team ID
2. **Explore other teams**: Use `/teams/with-members` to see the full organization structure
3. **Find specific people**: Use the team members endpoints to discover who works in different teams
4. **View all users**: Use `/users` to see all users in the system
5. **View specific user**: Use `/users/:id` to see details of any user

### For Team Leaders

- Continue using existing endpoints with `ViewPerson` permission
- Members can now see team information without needing elevated permissions

## Security Considerations

### Permission-Based Access

- All endpoints require either `ViewPerson` OR `ViewTeamMembers` permission
- Users without either permission receive 403 Forbidden responses
- Existing security middleware (JWT verification, role checking) remains intact

### Data Exposure

- **Sensitive information is filtered out**: Passwords, refresh tokens, and internal fields are not exposed
- **Public profile data only**: Names, emails, profile pictures, roles, and verification status
- **Team context**: Users can see which team someone belongs to

### Access Control Matrix

| Role      | ViewPerson | ViewTeamMembers | Can See Users | Access Level    |
| --------- | ---------- | --------------- | ------------- | --------------- |
| President | ✅         | ✅              | All Users     | Full Access     |
| Head      | ✅         | ❌              | Own Team Only | Team Restricted |
| ViceHead  | ✅         | ❌              | Own Team Only | Team Restricted |
| Member    | ❌         | ✅              | All Users     | Filtered Data   |
| HrMember  | ❌         | ✅              | All Users     | Filtered Data   |

## API Response Examples

### Team Members Response

```json
{
	"success": true,
	"data": [
		{
			"_id": "user_id",
			"firstName": "John",
			"lastName": "Doe",
			"email": "john.doe@example.com",
			"profilePicture": "https://...",
			"role": {
				"_id": "role_id",
				"key": "Member"
			},
			"team": {
				"_id": "team_id",
				"name": "Marketing Team",
				"description": "Handles all marketing activities"
			},
			"isActive": true,
			"isVerified": true
		}
	],
	"count": 1
}
```

### Teams with Members Response

```json
{
  "success": true,
  "data": [
    {
      "_id": "team_id",
      "name": "Marketing Team",
      "description": "Handles all marketing activities",
      "teamLeader": {
        "_id": "leader_id",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        "profilePicture": "https://..."
      },
      "teamViceHead": [...],
      "members": [...]
    }
  ],
  "count": 1
}
```

## Testing

### HTTP Test File

Use the updated `http/user.http` file to test the new endpoints:

1. **Test team members endpoint**:

   ```
   GET {{host}}/team/{{teamId}}/members
   {{authHeader}}
   ```

2. **Test teams with members endpoint**:

   ```
   GET {{host}}/teams/with-members
   {{authHeader}}
   ```

3. **Test updated users endpoint**:
   ```
   GET {{host}}
   {{authHeader}}
   ```

### Required Variables

- `@host`: API base URL
- `@teamId`: Valid team ID for testing
- `@token`: Valid JWT token with Member or HrMember role

## Troubleshooting

### Common Issues

1. **"Access Denied: Insufficient permissions"**

   - Check if user has a role assigned
   - Verify role has permissions array
   - Ensure role includes `ViewTeamMembers` permission

2. **"Access Denied: Required permission: view_person or view_team_members"**

   - User lacks both required permissions
   - Check role configuration in database
   - Verify permission keys match exactly

3. **Permission not working for Members**
   - Ensure Member role has `ViewTeamMembers` permission
   - Check if permissions are properly populated in user object
   - Verify JWT token contains role information

### Debug Steps

1. **Check User Role**:

   ```javascript
   console.log("User role:", req.user.role);
   console.log("Role permissions:", req.user.role?.permissions);
   ```

2. **Verify Permission Keys**:

   ```javascript
   const hasPermission = req.user.role.permissions.some(
   	(permission) => permission.key === "view_team_members"
   );
   ```

3. **Check Database**:
   - Verify Role document has correct permissions
   - Ensure Permission document exists with key "view_team_members"
   - Check if user's role reference is correct

## Migration Notes

### For Existing Users

- **Members** and **HrMembers** will automatically gain access to the new functionality
- **No database migrations required** - changes are permission-based only
- **Existing API calls remain unchanged** for users with higher permissions

### For Frontend Applications

- Update permission checks to include `ViewTeamMembers`
- Add UI components for team member browsing
- Consider adding team selection dropdowns for member discovery
- Handle both permission types in permission checking logic

## Benefits

1. **Improved Collaboration**: Members can now see who works in different teams
2. **Better Organization Awareness**: Users understand the full organizational structure
3. **Enhanced Networking**: Members can identify potential collaborators across teams
4. **Maintained Security**: Access is still controlled through the permission system
5. **Scalable Design**: New teams and members are automatically visible
6. **Flexible Access**: Dual permission system allows for different access levels

## Future Enhancements

Potential improvements that could be built on top of this foundation:

1. **Team Member Search**: Add search functionality across all team members
2. **Contact Information**: Allow members to see contact details (with privacy controls)
3. **Team Statistics**: Show team sizes and member counts
4. **Member Activity Status**: Display online/offline status or last activity
5. **Team Hierarchies**: Support for nested team structures
6. **Permission Groups**: Create permission bundles for different access levels

## Support

For questions or issues with the new team members access functionality:

1. Check user permissions and roles
2. Verify JWT token validity
3. Ensure team IDs are valid
4. Review server logs for detailed error messages
5. Use the troubleshooting section above for common issues
6. Verify permission keys match exactly in database
