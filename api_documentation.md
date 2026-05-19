# API Documentation

The backend exposes a RESTful API built with FastAPI. It leverages OpenAPI, and you can view the fully interactive Swagger UI by running the backend and navigating to `/docs`.

Here is a summary of the core endpoints implemented:

## Authentication & Authorization

### `POST /api/v1/auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "admin@bloodbank.com",
    "password": "yourpassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI...",
    "token_type": "bearer"
  }
  ```

## Dashboard & Analytics

### `GET /api/v1/dashboard/stats`
- **Description**: Retrieves high-level dashboard metrics powered by PostgreSQL Views.
- **Response (200 OK)**:
  ```json
  {
    "total_donors": 1245,
    "available_blood_units": 705,
    "pending_requests": 12,
    "expiring_soon": 34
  }
  ```

### `GET /api/v1/inventory/stock`
- **Description**: Retrieves the available blood units grouped by blood type.
- **Response (200 OK)**:
  ```json
  [
    {
      "blood_group": "O+",
      "total_units": 200,
      "total_ml": 90000
    },
    ...
  ]
  ```

*Note: In a fully fleshed-out implementation, endpoints for creating donors, handling requests (`POST /api/v1/requests`), and updating inventory via stored procedures would follow the same REST principles.*
