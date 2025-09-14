# Student Clearance System

A comprehensive university student clearance management system with RFID integration and department-based access control.

## Overview

This system manages student clearance across multiple departments including Library, Bursary, Student Affairs, Academic Affairs, and Health Center. It features role-based access control, RFID tag management, and a modern web interface.

## Features

### Core Functionality

- **Student Management**: Create, update, and manage student records
- **Multi-Department Clearance**: Track clearance status across 5 departments
- **RFID Integration**: ESP32-based RFID tag linking and management
- **Role-Based Access**: Admin, Staff, and Student user roles with appropriate permissions

### Recent Enhancements

- **Department-Based Access Control**: Staff users can only update clearance for their assigned department
- **Modern UI**: Next.js frontend with shadcn/ui components
- **Comprehensive Testing**: Full test suite for all API endpoints
- **Secure Authentication**: JWT-based authentication with role validation

## Architecture

### Backend (FastAPI)

- **Framework**: FastAPI with SQLModel ORM
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with role-based access control
- **Documentation**: Automatic OpenAPI/Swagger documentation

### Frontend (Next.js)

- **Framework**: Next.js 14 with App Router
- **UI Library**: shadcn/ui components with Tailwind CSS
- **Package Manager**: pnpm
- **Type Safety**: Full TypeScript integration

### Hardware Integration

- **RFID Reader**: ESP32-based device integration
- **Tag Management**: Link RFID tags to student accounts
- **Real-time Updates**: Device status monitoring

## User Roles & Permissions

### Admin Users

- Full system access
- Can manage users, students, and devices
- Can update clearance for any department
- System configuration and monitoring

### Staff Users

- **Department-Restricted Access**: Can only update clearance for their assigned department
- Student management within their department scope
- Cannot modify system configuration

### Student Users

- View their own clearance status
- Read-only access to their records
- Cannot modify clearance status

## Quick Start

### Backend Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

The backend will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
pnpm install
# OR if pnpm fails:
npm install

# Start development server
pnpm dev
# OR:
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Department-Based Access Control

### New Feature: Staff Department Assignment

Staff users are now assigned to specific clearance departments and can only update clearance status for students within their assigned department.

**Key Changes:**

- Staff users have a `clearance_department` field assignment
- Frontend forms filter available departments based on user role
- API endpoints enforce department-based access control
- Admin users retain full access to all departments

**See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed implementation information.**

## API Endpoints

### Authentication

- `POST /token` - Login and get JWT token
- `POST /users/` - Create new user (Admin only)

### Student Management

- `GET /students/` - List all students
- `POST /students/` - Create new student
- `GET /students/{student_id}` - Get student details
- `PUT /students/{student_id}` - Update student information

### Clearance Management

- `GET /clearance/{student_id}` - Get student clearance status
- `PUT /clearance/{student_id}` - Update clearance status (Department-restricted for Staff)

### Device Management

- `GET /devices/` - List RFID devices
- `POST /devices/` - Register new device
- `POST /rfid/link` - Link RFID tag to student

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_admin.py

# Run with coverage
pytest --cov=src tests/
```

## Deployment

### Backend (Render)

- Environment: Python 3.11+
- Database: PostgreSQL
- Build Command: `pip install -r requirements.txt`
- Start Command: `python main.py`

### Frontend (Vercel)

- Framework: Next.js
- Build Command: `pnpm run build`
- Output Directory: `.next`

## Environment Variables

### Backend

```bash
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost/clearance_db
```

### Frontend

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Project Structure

```
├── src/                    # Backend source code
│   ├── routers/           # API route handlers
│   ├── crud/              # Database operations
│   └── models.py          # Database models
├── frontend/              # Next.js frontend
│   └── src/
│       ├── components/    # React components
│       ├── types/         # TypeScript definitions
│       └── app/           # Next.js app router
├── tests/                 # Test suite
└── ESP_Tag/              # Arduino/ESP32 code
```

### Key Files

- `src/models.py` - Database models and schemas
- `src/routers/clearance.py` - Clearance management with access control
- `frontend/src/types/api.ts` - TypeScript API interfaces
- `frontend/src/components/clearance-update-form.tsx` - Department-restricted UI

## Contributing

1. Follow the existing code structure and naming conventions
2. Add tests for new features
3. Update documentation for API changes
4. Ensure department-based access control is maintained for new features

## Support

- **Backend Issues**: Check FastAPI logs and database connections
- **Frontend Issues**: Verify TypeScript compilation and dependencies
- **Access Control**: Refer to [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **RFID Integration**: Check ESP32 device connectivity and API endpoints

## License

This project is proprietary software for university clearance management.
