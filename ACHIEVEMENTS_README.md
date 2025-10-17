<!-- @format -->

# Achievement Management System

## Overview

The Achievement Management System allows users to create, manage, and track achievements with support for multiple file types including photos and PDFs.

## File Upload Support

### Supported File Types

- **Images**: JPEG, JPG, PNG, GIF
- **Documents**: PDF

### File Categories

#### 1. Certificate File

- **Purpose**: Main achievement certificate or document
- **File Types**: Images (JPEG, PNG, GIF) or PDFs
- **Upload**: During achievement creation or update
- **Field**: `certificateFile`

#### 2. Achievement Photo

- **Purpose**: Visual representation of the achievement
- **File Types**: Images only (JPEG, PNG, GIF)
- **Upload**: Separate endpoint for achievement photos
- **Field**: `achievementPhoto`

#### 3. Supporting Documents

- **Purpose**: Additional files that support the achievement
- **File Types**: Images (JPEG, PNG, GIF) or PDFs
- **Upload**: Multiple documents can be added
- **Field**: `supportingDocuments[]`

## API Endpoints

### Public Routes (No Authentication Required)

#### GET `/api/achievements`

- **Description**: Get all achievements with pagination and filtering
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sort`: Sort field with prefix `-` for descending (default: `-dateAwarded`)
  - `type`: Filter by achievement type
  - `search`: Search in title and description

#### GET `/api/achievements/stats`

- **Description**: Get achievement statistics
- **Response**: Achievement counts by type and total count

### Protected Routes (Authentication Required)

#### GET `/api/achievements/:id`

- **Description**: Get achievement by ID with access control
- **Access**: Based on user role and permissions

#### GET `/api/achievements/user/:userId`

- **Description**: Get achievements for a specific user with access control
- **Access**: Based on user role and permissions

#### POST `/api/achievements`

- **Description**: Create new achievement
- **Permissions**: `CreateAchievement`
- **File Upload**: Certificate file (optional)
- **Body**: `title`, `description`, `achievementType`, `userId`, `badgeIcon`
- **File**: `file` (multipart/form-data)

#### PATCH `/api/achievements/:id`

- **Description**: Update achievement
- **Permissions**: `EditAchievement`
- **Body**: `title`, `description`, `achievementType`, `badgeIcon`

#### DELETE `/api/achievements/:id`

- **Description**: Delete achievement
- **Permissions**: `DeleteAchievement`

#### POST `/api/achievements/:achievementId/supporting-document`

- **Description**: Upload supporting document
- **Permissions**: `EditAchievement`
- **Body**: `description` (optional)
- **File**: `file` (multipart/form-data)

#### POST `/api/achievements/:achievementId/photo`

- **Description**: Upload achievement photo
- **Permissions**: `EditAchievement`
- **File**: `file` (multipart/form-data, images only)

#### DELETE `/api/achievements/:achievementId/file/:fileType/:fileIndex`

- **Description**: Remove file from achievement
- **Permissions**: `EditAchievement`
- **File Types**: `supporting`, `certificate`, `photo`
- **File Index**: Index for supporting documents (0 for single files)

## File Upload Examples

### Create Achievement with Certificate

```bash
curl -X POST {{baseUrl}}/api/achievements \
  -H "Authorization: Bearer {{authToken}}" \
  -F "title=Excellence in Leadership" \
  -F "description=Outstanding leadership skills" \
  -F "achievementType=best_member_of_the_month" \
  -F "userId={{userId}}" \
  -F "file=@certificate.pdf"
```

### Upload Achievement Photo

```bash
curl -X POST {{baseUrl}}/api/achievements/{{achievementId}}/photo \
  -H "Authorization: Bearer {{authToken}}" \
  -F "file=@achievement_photo.jpg"
```

### Upload Supporting Document

```bash
curl -X POST {{baseUrl}}/api/achievements/{{achievementId}}/supporting-document \
  -H "Authorization: Bearer {{authToken}}" \
  -F "description=Project proposal" \
  -F "file=@proposal.pdf"
```

## Access Control

### Role-Based Access

- **President**: Can see all achievements
- **Head/ViceHead**: Can see achievements they awarded or their own
- **Member/HrMember**: Can see their own achievements and achievements they awarded

### File Management Permissions

- Only users who awarded the achievement can modify files
- File type validation ensures security
- File size tracking for monitoring

## File Validation

### Certificate Files

- **Allowed Types**: Images (JPEG, PNG, GIF) and PDFs
- **Purpose**: Official achievement documentation
- **Storage**: Single file per achievement

### Achievement Photos

- **Allowed Types**: Images only (JPEG, PNG, GIF)
- **Purpose**: Visual representation
- **Storage**: Single photo per achievement

### Supporting Documents

- **Allowed Types**: Images (JPEG, PNG, GIF) and PDFs
- **Purpose**: Additional evidence or context
- **Storage**: Multiple documents per achievement

## Error Handling

### File Type Validation

```json
{
	"success": false,
	"message": "Invalid file type. Only images (JPEG, PNG, GIF) and PDFs are allowed"
}
```

### File Size Limits

- File size is tracked and stored
- Consider implementing size limits in upload middleware

### Access Denied

```json
{
	"success": false,
	"message": "You can only modify achievements you awarded"
}
```

## Best Practices

1. **File Naming**: Use descriptive filenames
2. **File Types**: Choose appropriate file types for content
3. **File Sizes**: Optimize files before upload
4. **Access Control**: Always verify user permissions
5. **Validation**: Validate file types on both client and server

## Testing

Use the provided `achievement.http` file to test all endpoints:

1. Set your `baseUrl` and `authToken` variables
2. Test file uploads with different file types
3. Verify access control with different user roles
4. Test file removal functionality
5. Validate error handling with invalid files
