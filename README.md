## Overview

The **Task Management System** is a web application designed to help users manage tasks efficiently. It provides features for task creation, assignment, updates, and retrieval, with secure user authentication and role-based access control.

## API Documentation: https://documenter.getpostman.com/view/34862623/2sAXxY59AR

## Technologies Used

- **Node.js**: JavaScript runtime for building the server.
- **Express**: Web framework for Node.js to handle routing.
- **MongoDB**: NoSQL database for storing task and user data.
- **Redis**: In-memory data structure store used for caching.
- **JWT (JSON Web Tokens)**: Used for user authentication.
- **Joi**: Validation library for request data.
- **Docker**: Containerization tool for deploying the application.

## Installation Instructions

1. **Prerequisites**:
    - Node.js (version 14 or later)
    - Docker (for containerization)
    - MongoDB (running locally or a cloud instance)
2. **Clone the Repository**:
    
    ```bash
    git clone https://github.com/rahul-hooda01/task_management_system.git
    cd task_management_system
    ```
    
3. **Install Dependencies**:
    
    ```bash
    npm install
    ```
    
4. **Set Up Environment Variables**:
Create a `.env` file in the root directory and define in .env.examples

## Running the Application

To run the application in development mode:

```bash
npm run dev
```

To run the application in production mode:

```bash
npm start
```

### Docker Commands

To build and run the Docker containers:

```bash
docker-compose up --build
```

## API Endpoints

### User Authentication

- **Register User**: `POST /api/v1/users/register`
- **Login User**: `POST /api/v1/users/login`
- **Logout User**: `POST /api/v1/users/logout` (secured)
- **Refresh Token**: `POST /api/v1/users/refresh-token`
- **Get Current User**: `GET /api/v1/users/getCurrentUser` (secured)

### Task Management

- **Create Task**: `POST /api/v1/tasks/addTasks` (secured)
- **Get All Tasks**: `GET /api/v1/tasks/getAllTasks` (admin secured)
- **Get My Tasks**: `GET /api/v1/tasks/getMyTasks` (secured)
- **Get Task by ID**: `GET /api/v1/tasks/getTaskById/:id` (secured)
- **Assign Task**: `GET /api/v1/tasks/assign/TasksById/:id` (secured)
- **Update Task**: `PATCH /api/v1/tasks/updateTask/:id` (secured)
- **Delete Task**: `DELETE /api/v1/tasks/deleteTask/:id` (admin secured)
- **Get Task Count by Status**: `GET /api/v1/tasks/getTaskCountByStatus` (secured)

### User Authentication APIs

- **Register User**: `POST /api/v1/users/register`
- **Login User**: `POST /api/v1/users/login`
- **Logout User**: `POST /api/v1/users/logout` (secured)
- **Refresh Token**: `POST /api/v1/users/refresh-token`
- **Get Current User**: `GET /api/v1/users/getCurrentUser` (secured)
- **Update User by ID**: `PATCH /api/v1/users/updateUserById/:id` (secured, admin or manager)
- **Get User by ID**: `GET /api/v1/users/getUserById/:id` (secured, admin or manager)
- **Get All Users**: `GET /api/v1/users/getAllUsers` (secured, admin)

### Task Management APIs

- **Create a New Task**: `POST /api/v1/tasks/addTasks` (secured)
- **Get All Tasks**: `GET /api/v1/tasks/getAllTasks` (secured, admin)
- **Get My Tasks**: `GET /api/v1/tasks/getMyTasks` (secured)
- **Get All Assigned Tasks by User ID**: `GET /api/v1/tasks/getAllAssignTasksByUserId/:id` (secured, admin or manager)
- **Get Task by ID**: `GET /api/v1/tasks/getTaskById/:id` (secured)
- **Assign a Task by ID**: `GET /api/v1/tasks/assign/TasksById/:id` (secured, admin, manager, or user)
- **Update a Task by ID**: `PATCH /api/v1/tasks/updateTask/:id` (secured, admin or manager)
- **Delete a Task by ID**: `DELETE /api/v1/tasks/deleteTask/:id` (secured, admin)
- **Get Task Count by Status**: `GET /api/v1/tasks/getTaskCountByStatus` (secured)

### Notification Settings APIs

- **Change Notification Type**: `PATCH /api/v1/tasks/changeNotificationType` (secured)

### Additional APIs

- **Reset Password**: `POST /api/v1/users/resetPassword` (secured)

## Caching with Redis

Redis is used to cache frequently accessed data, improving response times and reducing the load on the MongoDB database.

## Modules Used

### Development Dependencies

- **nodemon**: Automatically restarts the server on file changes during development.

### Main Dependencies

- **@sendgrid/mail**: To send emails using SendGrid.
- **bcryptjs**: For hashing passwords.
- **cookie-parser**: Middleware for parsing cookies.
- **cors**: Middleware to enable Cross-Origin Resource Sharing.
- **dotenv**: To load environment variables from a `.env` file.
- **express**: Web framework for building the API.
- **express-rate-limit**: Middleware for rate limiting API requests.
- **helmet**: Middleware to secure Express apps by setting various HTTP headers.
- **ioredis**: Redis client for Node.js.
- **joi**: Validation library for input data.
- **jsonwebtoken**: To generate and verify JSON Web Tokens.
- **mongoose**: ODM (Object Data Modeling) library for MongoDB.
- **morgan**: Middleware for logging HTTP requests.
- **twilio**: For sending SMS notifications.
- **winston**: A logging library for Node.js.

## Deployment Instructions

This application can be easily deployed using Docker. Ensure that all environment variables are set in your `.env` file, and use the following command to build and run the containers:

```bash
docker-compose up --build
```

## Troubleshooting

- Ensure that Docker and MongoDB are running properly.
- Check the console for error messages when starting the application or making API requests.

## Contributing

If you wish to contribute to this project, please create a fork of the repository, make your changes, and submit a pull request.

## License

This project is licensed under the ISC License.
