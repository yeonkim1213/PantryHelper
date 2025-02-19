
# Pantry Helper

Pantry Helper is a web application designed to assist in managing pantry inventories, users, and other pantry-related activities.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Technologies Used](#technologies-used)
3. [Setup Instructions](#setup-instructions)
4. [Frontend Setup](#frontend-setup)
5. [Backend Setup](#backend-setup)
6. [Running the Application](#running-the-application)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)

---

## Introduction

This project consists of two parts:

1. **Frontend**: Built with React.js and serves as the user interface.
2. **Backend**: Built with Node.js and Express, acting as the API and database handler.

---

## Technologies Used

### Frontend

- React.js
- Ant Design
- Axios
- Recharts
- Moment.js
- XLSX
- React Grid Layout

### Backend

- Node.js
- Express
- MySQL
- Swagger for API Documentation

---

## Setup Instructions

### Prerequisites

Before setting up the project, ensure the following are installed:

- **Node.js** (version 14 or above) and npm: [Download](https://nodejs.org/)
- **Git**: [Download](https://git-scm.com/)
- **MySQL**: [Download](https://dev.mysql.com/downloads/)

---

## Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd pantry-helper-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `pantry-helper-frontend` directory:
   ```bash
   touch .env
   ```
   Add the following:
   ```dotenv
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```

4. **Run the frontend server**:
   ```bash
   npm start
   ```
   By default, the frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd pantry-helper-backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `pantry-helper-backend` directory:
   ```bash
   touch .env
   ```
   Add the following:
   ```dotenv
   DB_HOST=localhost
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   PORT=5000
   ```

4. **Start the MySQL database**:
   Ensure your MySQL server is running. Create the required database:
   ```sql
   CREATE DATABASE pantry_helper;
   ```

5. **Run the backend server**:
   ```bash
   npm start
   ```
   By default, the backend will be available at [http://localhost:5000](http://localhost:5000).

---

## Running the Application

To run the full application:

1. Start the backend server:
   ```bash
   cd pantry-helper-backend
   npm start
   ```

2. Start the frontend server in a new terminal:
   ```bash
   cd pantry-helper-frontend
   npm start
   ```

3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

### Frontend

Add the following to the `pantry-helper-frontend/.env` file:

```dotenv
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Backend

Add the following to the `pantry-helper-backend/.env` file:

```dotenv
DB_HOST=localhost
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
PORT=5000
```

---

## Troubleshooting

1. **Module not found errors**:
   - Ensure all dependencies are installed in both the `pantry-helper-frontend` and `pantry-helper-backend` directories:
     ```bash
     npm install
     ```

2. **Database connection issues**:
   - Check your `.env` file for correct database credentials.
   - Ensure the MySQL server is running.

3. **CORS issues**:
   - Ensure the backend is configured to accept requests from the frontend's origin.

4. **Port conflicts**:
   - Change the `PORT` variable in the `.env` file for the backend.
   - Use the following command to start the frontend on a different port:
     ```bash
     PORT=3001 npm start
     ```

5. **Layout overlapping issues**:
   - Clear browser cache or refresh the application.

6. **API issues**:
   - Use tools like Postman or Insomnia to debug backend API endpoints.

---

## Additional Notes

- **API Documentation**:
  The backend includes Swagger for API documentation. You can access it at:
  ```
  http://localhost:5000/api-docs
  ```

- **Version Compatibility**:
  Ensure you have Node.js 14+ and npm installed. Check your versions using:
  ```bash
  node -v
  npm -v
  ```

---

## Summary

By following these instructions, you will:

1. Install dependencies for both the frontend and backend.
2. Configure environment variables.
3. Run the servers to access the Pantry Helper application.

Enjoy using Pantry Helper! 🎉
