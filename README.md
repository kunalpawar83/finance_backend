# Finance Backend

A robust and maintainable backend for a finance dashboard system built with Node.js, Express, Knex, and Objection.js. This project features role-based access control (RBAC), financial record management with soft delete, pagination, search, and comprehensive error handling.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Objection.js
- **Query Builder**: Knex.js
- **Database**: PostgreSQL
- **Security**: JWT, Bcryptjs

## 🛠️ Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kunalpawar83/finance_backend.git
   cd finance_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Database Configuration

1. Create a PostgreSQL database named `finance_db`.
2. Configure your `.env` file with your database credentials (see [Environment Variables](#environment-variables)).
3. Run migrations:
   ```bash
   npm run migrate
   ```

### Running the Server

- Development mode (with nodemon):
  ```bash
  npm run dev
  ```
- Production mode:
  ```bash
  node index.js
  ```

## 📄 Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=finance_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

## 🔐 Role-Based Access Control (RBAC)

The system supports three user roles:

1.  **Admin**: Full access to all features, including updating users and viewing/managing soft-deleted records.
2.  **Analyst**: Can create and view financial records and access the dashboard summary and trends.
3.  **Viewer**: Can only access the dashboard summary and trends.

Authentication is handled via **JWT (JSON Web Tokens)**. Include the token in the `Authorization` header as `Bearer <token>`.

## ✨ Core Features

### Soft Delete
Financial records are never permanently removed from the database. Instead, they use an `isDelete` boolean flag. 
- Regular list APIs only return records where `isDelete` is `false`.
- Admins can access a specialized endpoint to view and manage deleted records.

### Pagination
List APIs support pagination using query parameters:
- **Records API**: Use `l` for limit (default: 100) and `f` for offset (default: 0).
- **Dashboard API**: Use `limit` (default: 5) and `offset` (default: 0) for recent activity.

### Search & Filtering
- **Search**: Use the `search` query parameter to filter records by `category` (case-insensitive partial match).
- **Filtering**: Filter records by `type` (Income/Expense), `category`, and date range (`startDate` to `endDate`).

## ⚠️ Response Structure & Error Handling

### Standard Response Format
All API responses follow a consistent JSON structure:

**Success:**
```json
{
  "status": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "status": false,
  "code": 1021,
  "message": "Invalid input format",
  "data": null
}
```

> [!IMPORTANT]
> The server always returns an HTTP **200 OK** status code, even when an error occurs. The true status of the operation is indicated by the `status` field within the JSON response body.

## 🛣️ API Documentation

### Users & Authentication
- `POST /users/create`: Register a new user.
- `POST /users/login`: Authenticate and receive a JWT.
- `PATCH /users/update/:id`: Update user details (Admin only).

### Roles
- `POST /roles/create`: Create a new role (Available: Admin, Analyst, Viewer).

### Financial Records
- `POST /records/create`: Create a new financial record (Admin, Analyst).
- `GET /records/`: List all records with filtering and pagination.
- `PATCH /records/update/:id`: Update a record (Admin only).
- `PATCH /records/delete/:id`: Soft delete a record (Admin only).
- `GET /records/delete`: View soft-deleted records (Admin only).

### Dashboard
- `GET /dashboard/summary`: Get totals (income, expense, balance) and recent activity (Admin, Analyst, Viewer).
- `GET /dashboard/trends`: Get monthly income vs. expense trends (Admin, Analyst, Viewer).