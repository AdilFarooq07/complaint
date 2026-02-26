# University Complaint Management System

A full-stack web application for managing university complaints, built with React, Node.js, and MySQL.

## Features

- **User Authentication**: Login and registration system with role-based access (Admin/Student)
- **Complaint Management**: Create, view, update, and delete complaints
- **Role-Based Access**: Different views and permissions for Admin and Student users
- **Dashboard**: Overview of complaint statistics and recent complaints
- **Filtering**: Filter complaints by status, category, and priority
- **Responsive Design**: Modern UI that works on all devices

## Tech Stack

- **Frontend**: React 18, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MySQL Server (v8.0 or higher)

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd complaint
   ```

2. **Install dependencies for all projects**:
   ```bash
   npm run install-all
   ```

   Or install separately:
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Configure Environment Variables**:
   - Create `.env` file from example:
     ```bash
     cd server
     npm run setup-env
     ```
     Or manually copy:
     ```bash
     copy .env.example .env
     # On Mac/Linux: cp .env.example .env
     ```
   - Open `server/.env` and update the following variables (especially `DB_PASSWORD`):
     ```env
     PORT=5000
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=university_complaints
     JWT_SECRET=your-secret-key-change-this-in-production
     NODE_ENV=development
     ```

## Running the Application

### Development Mode (Both Frontend and Backend)

From the root directory:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

### Run Separately

**Backend only:**
```bash
cd server
npm run dev
```

**Frontend only:**
```bash
cd client
npm start
```

## Database Setup

1. **Test your database connection** (recommended before starting):
   ```bash
   cd server
   npm run test-db
   ```

2. **Start the server** - The database tables will be created automatically when you start the server for the first time. The following demo users will be created:

- **Admin**: 
  - Email: `admin@university.edu`
  - Password: `admin123`

- **Student**: 
  - Email: `john.smith@university.edu`
  - Password: `student123`

## Project Structure

```
complaint/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/           # Database configuration
│   ├── middleware/        # Auth middleware
│   ├── routes/            # API routes
│   ├── index.js          # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Student registration

### Complaints
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get single complaint
- `POST /api/complaints` - Create complaint (Student only)
- `PATCH /api/complaints/:id/status` - Update complaint status (Admin only)
- `PATCH /api/complaints/:id/withdraw` - Withdraw complaint (Student owner only)
- `DELETE /api/complaints/:id` - Delete complaint

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users` - Get all users (Admin only)

## Usage

1. **Login**: Use the demo credentials provided above
2. **Student**: Can create complaints and view their own complaints
3. **Admin**: Can view all complaints, update their status, and respond to them

## Features by Role

### Student
- Create new complaints
- View own complaints
- Filter complaints
- Withdraw own complaints
- Delete own complaints

### Admin
- View all complaints
- Update complaint status
- Add admin responses
- Filter and manage complaints
- View user information

## Troubleshooting

### Database Connection Issues

If you're getting a "connection failed" error, follow these steps:

1. **Test Database Connection**:
   ```bash
   cd server
   npm run test-db
   ```
   This will test your MySQL connection and provide specific error messages.

2. **Check MySQL is Running**:
   - **Windows**: Open Services (services.msc) and look for MySQL, or check XAMPP/WAMP control panel
   - **Mac**: Run `brew services list` to check MySQL status
   - **Linux**: Run `sudo systemctl status mysql`

3. **Verify .env File**:
   - Make sure `server/.env` file exists (copy from `server/.env.example` if needed)
   - Check that database credentials are correct:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_actual_password
     DB_NAME=university_complaints
     ```

4. **Common Issues**:
   - **ECONNREFUSED**: MySQL server is not running. Start MySQL service.
   - **ER_ACCESS_DENIED_ERROR**: Wrong username/password. Check your MySQL credentials.
   - **ENOTFOUND**: Cannot resolve hostname. Verify DB_HOST in .env file.
   - **Empty Password**: If MySQL has no password, leave `DB_PASSWORD=` empty in .env

5. **Manual Database Setup** (if needed):
   ```sql
   CREATE DATABASE university_complaints;
   ```
   Then update `server/.env` with your database name.

### Port Already in Use
- Change the PORT in `server/.env` if port 5000 is in use
- Change the port in `client/package.json` proxy if needed

### CORS Issues
- Ensure the backend CORS is configured correctly
- Check that the frontend proxy is set to the correct backend URL

## Production Deployment

1. Build the React app:
   ```bash
   cd client
   npm run build
   ```

2. Set `NODE_ENV=production` in `server/.env`

3. Use a process manager like PM2 for the Node.js server

4. Serve the React build folder using a web server or configure Express to serve static files

## License

This project is open source and available under the MIT License.
