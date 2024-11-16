# Employee Management System API Documentation

## Overview
The Employee Management System API provides endpoints for managing employees, tickets, and user authentication. This RESTful API uses JWT for authentication and follows standard HTTP methods.

## Base URL
```
Production: https://api.ems-system.com/v1
Staging: https://staging-api.ems-system.com/v1
```

## Authentication
All API requests require authentication using JWT tokens except for login and registration endpoints.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Endpoints

### Authentication
#### POST /auth/login
Login to the system.

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
    "token": "string",
    "user": {
        "id": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "role": "string"
    }
}
```

#### POST /auth/register
Register a new user (Admin only).

**Request Body:**
```json
{
    "email": "string",
    "password": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "employee|manager|admin",
    "departmentId": "string"
}
```

### Users
#### GET /users
Get all users (Admin/Manager only).

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `role`: string
- `department`: string
- `search`: string

**Response:**
```json
{
    "data": [{
        "id": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "role": "string",
        "department": {
            "id": "string",
            "name": "string"
        }
    }],
    "pagination": {
        "total": number,
        "pages": number,
        "currentPage": number,
        "limit": number
    }
}
```

#### PUT /users/:id
Update user information.

**Request Body:**
```json
{
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "string",
    "departmentId": "string"
}
```

### Tickets
#### GET /tickets
Get all tickets.

**Query Parameters:**
- `status`: open|in_progress|resolved|closed
- `priority`: low|medium|high
- `assignee`: string (user ID)
- `page`: number
- `limit`: number

**Response:**
```json
{
    "data": [{
        "id": "string",
        "title": "string",
        "description": "string",
        "status": "string",
        "priority": "string",
        "creator": {
            "id": "string",
            "name": "string"
        },
        "assignee": {
            "id": "string",
            "name": "string"
        },
        "createdAt": "string",
        "updatedAt": "string"
    }],
    "pagination": {
        "total": number,
        "pages": number,
        "currentPage": number,
        "limit": number
    }
}
```

#### POST /tickets
Create a new ticket.

**Request Body:**
```json
{
    "title": "string",
    "description": "string",
    "priority": "low|medium|high",
    "assigneeId": "string"
}
```

### Departments
#### GET /departments
Get all departments.

**Response:**
```json
{
    "data": [{
        "id": "string",
        "name": "string",
        "description": "string",
        "employeeCount": number
    }]
}
```

## Error Responses
All error responses follow this format:

```json
{
    "error": {
        "code": "string",
        "message": "string",
        "details": "object (optional)"
    }
}
```

### Common Error Codes
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## Rate Limiting
API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Pagination
All list endpoints support pagination with these parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

## Filtering and Sorting
List endpoints support:
- Filtering using query parameters
- Sorting using `sort` parameter (e.g., `sort=createdAt:desc`)

## WebSocket Events
The API supports real-time updates through WebSocket connections:

```javascript
const ws = new WebSocket('wss://api.ems-system.com/ws');

// Event Types
{
    "ticket_created": {
        "ticketId": "string",
        "title": "string",
        "priority": "string"
    },
    "ticket_updated": {
        "ticketId": "string",
        "changes": {}
    },
    "user_status_changed": {
        "userId": "string",
        "status": "string"
    }
}
```