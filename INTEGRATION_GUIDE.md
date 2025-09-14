# Department-Based Access Control Integration Guide

## Overview

This guide documents the recent implementation of department-based access control for the Student Clearance System, where Staff users can only update clearance statuses for their assigned department.

## What Was Implemented

### 1. Backend Changes

#### Enhanced User Model (`src/models.py`)

- Added `clearance_department` field to `User` model for staff department assignment
- Updated `UserCreate`, `UserUpdate`, and `UserRead` schemas to include the new field
- Separated academic `Department` enum from administrative `ClearanceDepartment` enum

#### Access Control Logic (`src/routers/clearance.py`)

- **Admin users**: Can update clearance for any department
- **Staff users**: Can only update clearance for their assigned `clearance_department`
- **Students**: Cannot update clearance (existing behavior)
- Returns HTTP 403 with detailed error message if staff tries to access unauthorized department

#### API Documentation

- Enhanced endpoint documentation with department access control explanations
- Added examples showing permission scenarios for different user roles

### 2. Frontend Changes

#### Type Definitions (`frontend/src/types/api.ts`)

- Added `clearance_department?: ClearanceDepartment | null` to:
  - `UserRead` interface
  - `UserCreate` interface
  - `UserUpdate` interface

#### User Management Form (`frontend/src/components/user-form.tsx`)

- Added clearance department selection field for staff users
- Proper form state management with "none" default value
- Conditional rendering for staff role
- Form submission logic handles clearance department assignment

#### Clearance Update Form (`frontend/src/components/clearance-update-form.tsx`)

- Implemented role-based department filtering with `getAvailableDepartments()` function
- **Admin users**: See all departments
- **Staff users**: See only their assigned department
- **Unassigned staff**: See warning message and disabled form
- Added informational alerts showing user permissions
- Disabled form controls when no departments are available

## Access Control Rules

### User Roles and Permissions

1. **Admin Users**

   - Can update clearance for any department
   - See all departments in dropdown
   - No restrictions on clearance operations

2. **Staff Users**

   - Can only update clearance for their assigned `clearance_department`
   - See only their assigned department in dropdown
   - Receive 403 error if attempting to access other departments
   - Must have a clearance department assigned to update any clearance

3. **Student Users**
   - Cannot update clearance status (read-only access)
   - Can view their own clearance information

### Error Handling

- **Backend**: Returns HTTP 403 with detailed error message for unauthorized access
- **Frontend**: Displays warning alerts for staff without assigned departments
- **API Responses**: Clear error messages explaining department access restrictions

## Database Schema Updates

The `User` table now includes:

```sql
clearance_department VARCHAR(50) NULL  -- For staff department assignment
```

Possible values: `LIBRARY`, `BURSARY`, `STUDENT_AFFAIRS`, `ACADEMIC_AFFAIRS`, `HEALTH_CENTER`, or `NULL`

## Getting Started

### Backend Setup

1. Ensure all Python dependencies are installed:

   ```bash
   cd /home/fireheart/codeworld/freelance/clearance_stud
   pip install -r requirements.txt
   ```

2. Run database migrations if needed (the new field should be automatically added)

3. Start the backend server:
   ```bash
   python main.py
   ```

### Frontend Setup

1. Install dependencies (retry if network issues persist):

   ```bash
   cd frontend
   pnpm install
   # OR if pnpm fails:
   npm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   # OR:
   npm run dev
   ```

## Testing the New Features

### 1. Test User Creation

- Create a new staff user and assign them a clearance department
- Verify the department appears in the user form dropdown
- Confirm the assignment saves correctly

### 2. Test Access Control

- Log in as a staff user with assigned department
- Attempt to update clearance for students in your assigned department (should work)
- Try to access clearance updates for other departments (should be restricted)
- Log in as admin and verify access to all departments

### 3. Test Frontend UI

- Verify staff users see only their assigned department
- Check that unassigned staff see warning messages
- Confirm admin users see all departments
- Test form validation and error handling

## API Endpoints

### Updated Endpoints

#### Update Student Clearance

```
PUT /clearance/{student_id}
```

**Access Control:**

- Admin: Can update any department
- Staff: Can only update their assigned clearance_department
- Student: Forbidden (403)

**Request Body:**

```json
{
  "department": "LIBRARY",
  "status": "APPROVED",
  "remarks": "All books returned"
}
```

**Error Responses:**

- `403 Forbidden`: Staff attempting to update unauthorized department
- `400 Bad Request`: Invalid department or student not found

## Security Considerations

1. **Department Assignment**: Only admins should be able to assign clearance departments to staff
2. **Role Validation**: Backend validates user role and department assignment on every request
3. **Error Messages**: Provide clear feedback without exposing sensitive information
4. **Session Management**: Ensure user sessions reflect current role and department assignments

## Future Enhancements

1. **Audit Trail**: Log all clearance updates with user and department information
2. **Bulk Operations**: Allow staff to update multiple students in their department
3. **Department Transfer**: Handle staff moving between departments
4. **Reporting**: Generate department-specific clearance reports

## Troubleshooting

### Common Issues

1. **Frontend Dependencies**

   - If `pnpm install` fails due to network issues, try `npm install`
   - Clear npm/pnpm cache if version conflicts occur

2. **Database Issues**

   - Ensure the `clearance_department` column exists in the `users` table
   - Check that existing staff users have appropriate department assignments

3. **Permission Errors**

   - Verify user has correct role assigned
   - Confirm staff users have `clearance_department` field populated
   - Check JWT token includes updated user information

4. **Frontend Compilation**
   - Ensure TypeScript interfaces are updated with `clearance_department` field
   - Verify imports for `ClearanceDepartment` enum are correct

## Support

For issues related to the department-based access control implementation, check:

1. Backend logs for permission errors
2. Frontend console for TypeScript compilation issues
3. Database schema for missing columns
4. User role and department assignments in the database

The implementation ensures secure, role-based access to clearance operations while maintaining a clean, intuitive user interface for all user types.
