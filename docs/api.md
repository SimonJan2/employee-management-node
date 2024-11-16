# Employee Management System API Documentation

## Authentication
### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
    "email": "string",
    "password": "string"
}
```

**Response:**
```json
{
    "user": {
        "id": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "role": "string"
    },
    "accessToken": "string"
}
```

### POST /api/auth/logout
Logout and invalidate session.

### POST /api/auth/refresh
Refresh access token using refresh token cookie.

## Users
### GET /api/users
Get all users (Admin/Manager only).

**Response:**
```json
[
    {
        "id": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "role": "string",
        "departmentId": "string",
        "isActive": "boolean"
    }
]
```

### POST /api/users
Create new user (Admin only).

**Request Body:**
```json
{
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "departmentId": "string"
}
```

## Tickets
### GET /api/tickets
Get all tickets.

### POST /api/tickets
Create new ticket.

**Request Body:**
```json
{
    "title": "string",
    "description": "string",
    "priority": "string",
    "assigneeId": "string"
}
```

## Departments
### GET /api/departments
Get all departments.

### POST /api/departments
Create new department (Admin only).

**Request Body:**
```json
{
    "name": "string",
    "description": "string"
}
```

# Error Responses
```json
{
    "status": "fail|error",
    "message": "Error description"
}
```

# Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error