<!-- @format -->

# GnourBack - Team Management Backend

A comprehensive Node.js/Express.js backend application for team management, user authentication, and achievement tracking systems.

## 🚀 Features

- **User Management**: Complete user CRUD operations with role-based access control
- **Team Management**: Team creation, member management, and team-based operations
- **Task Management**: Task assignment, tracking, and status management
- **Event Management**: Event creation, attendance tracking, and scheduling
- **Achievement System**: User achievement tracking and recognition
- **Feedback System**: User feedback collection and management
- **Authentication**: JWT-based authentication
- **File Upload**: Cloudinary integration for profile pictures and file management
- **Access Control**: Granular permission system with role-based access control

## 🔐 Authentication & Authorization

### Local Authentication

- JWT-based authentication with access and refresh tokens
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Granular permission system

## 🛠️ Technology Stack

- **Runtime**: Node.js with Express.js 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT
- **File Upload**: Cloudinary integration with Multer
- **Security**: bcrypt, rate limiting, CORS
- **Development**: Nodemon for auto-restart

## 📁 Project Structure

```
GnourBack/
├── config/                 # Configuration files
│   ├── jwtConfig.js       # JWT configuration
│   ├── dbconfig.js        # Database configuration
│   ├── cloudinary.js      # Cloudinary configuration
│   ├── accessPolicies.js  # Access control policies
│   ├── Roles.js           # Role definitions
│   ├── Permissions.js     # Permission matrix
│   └── SeedRolesAndPermissions.js # Database seeding
├── Controllers/            # Business logic handlers
├── Models/                 # Database models
├── Routes/                 # API endpoint definitions
├── Middlewares/            # Request processing middleware
├── utils/                  # Helper functions and filters
├── http/                   # API testing files
└── index.js               # Main server file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd GnourBack
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=4005
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/gnour_db

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # API Configuration
   API_BASE_URL=http://localhost:4005

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Database Seeding**

   ```bash
   npm run seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation

### Authentication Routes

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### User Management

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Team Management

- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Task Management

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Event Management

- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Achievement System

- `GET /api/achievements` - Get all achievements
- `POST /api/achievements` - Create achievement
- `PUT /api/achievements/:id` - Update achievement
- `DELETE /api/achievements/:id` - Delete achievement

## 🧪 Testing

### Test File Upload

```bash
node test-upload.js
```

### Utility Scripts

**Delete all users except President:**

```bash
node delete-all-users-except-president.js
```

This script will delete all users except those with the President role. A 3-second warning is shown before deletion.

**Delete all tasks:**

```bash
node delete-all-tasks.js
```

This script will delete all tasks from the database. A 3-second warning is shown before deletion.

**Delete all events:**

```bash
node delete-all-events.js
```

This script will delete all events from the database. A 3-second warning is shown before deletion.

### HTTP Testing

Use the files in the `http/` directory with REST Client extensions or tools like Postman.

## 🔒 Security Features

- **Rate Limiting**: Configurable rate limiting for API endpoints
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS**: Configurable CORS settings
- **JWT Security**: Secure token handling with refresh token rotation
- **Password Security**: bcrypt hashing with configurable salt rounds
- **Access Control**: Role-based access control with granular permissions

## 📖 Additional Documentation

- [Access Control System](./ACCESS_CONTROL_README.md)
- [Achievement System](./ACHIEVEMENTS_README.md)
- [Team Members Access](./TEAM_MEMBERS_ACCESS_README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Check the documentation files
- Review the troubleshooting sections
- Open an issue on GitHub

---

**Note**: This backend is designed to work with a frontend application using JWT-based authentication.
