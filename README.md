# 🏦 Daily Expenses Sharing Application

## 📖 Overview

This application enables users to manage their daily expenses and seamlessly split costs among participants. Users can create accounts, log in, add expenses, and view their balance sheets.

## ⚙️ Technologies Used

- **Node.js**
- **Express.js**
- **MySQL**
- **bcrypt** for password hashing
- **jsonwebtoken** for authentication
- **json2csv** for CSV generation

## 🚀 Features

- **User Management**
  - User registration and login
  - Password hashing and validation
- **Expense Management**
  - Add expenses with various split methods (equal, exact, percentage)
  - Retrieve individual user expenses
  - Retrieve overall expenses for all users
- **Balance Sheet Generation**
  - Download balance sheets in CSV format

## 📡 API Endpoints

### User Endpoints

#### 1. Create User

- **POST** `/users/createUser`
- **Payload:**
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe",
    "mobileNumber": "1234567890",
    "password": "Password123"
  }
#### 2. Login User

- **POST** `/users/login`
- **Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password123"
  }
  ```
 ## ***On success, token is returned and should be used for further requests*** ##

#### 3. Get User Details

- **GET** `/users/:id`
- **Headers:**
  - `Authorization: <token>`without keyword Bearer
  
#### 4. Get User Balance Sheet

- **GET** `/users/balanceSheet/:id`
- **Headers:**
  - `Authorization: <token>`without keyword Bearer

### Expense Endpoints

#### 5. Add Expense

- **POST** `/expenses/addExpense`
- **Headers:**
  - `Authorization:<token>`without keyword Bearer
- **Payload:**
  ```json
  {
    "amount": 3000,
    "userId": 1,
    "participants": [
      { "userId": 2 },
      { "userId": 3 }
    ],
    "splitMethod": "equal" // or "exact" or "percentage"
  }
  ```
  ```json
  {
    "amount": 1000,
    "userId": 6,
    "participants": [
        {"userId": 5, "percentage": 25},
        {"userId": 6, "percentage": 45},
        {"userId": 8, "percentage": 30}
     ],
    "splitMethod": "percentage"
    }
  ```

   ```json
  {
    "amount": 4299,
    "userId": 5,
    "participants": [
        {"userId": 5, "share": 1500},
        {"userId": 6, "share": 2000},
        {"userId": 8, "share": 799}
    ],
    "splitMethod": "exact"
    }
  ```
#### 6. Get User Expenses

- **GET** `/expenses/user/:id`
- **Headers:**
  - `Authorization:<token>`without keyword Bearer

#### 7. Get Overall Expenses

- **GET** `/expenses/overall`
- **Headers:**
  - `Authorization:<token>` without keyword Bearer

## 🗄️ Database Setup

### Create Database

1. Open your MySQL command line or MySQL Workbench.
2. Create a new database:
   ```sql
   CREATE DATABASE daily_expenses;
   ```

### Create Tables

Execute the following SQL scripts to create necessary tables:

```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile_number` varchar(50) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `user_id` int NOT NULL,
  `split_method` enum('equal','exact','percentage') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `expense_shares` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expense_id` int NOT NULL,
  `user_id` int NOT NULL,
  `share` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `expense_id` (`expense_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 🌿 Environment Variables

Create a `.env` file in the root directory with the following content:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=daily_expenses
JWT_SECRET=your_secret_key
PORT=5000

```

## 🔧 Running the Application Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. The application will run on `http://localhost:5000`.

## 🧪 Testing the API

You can use tools like **Postman** or **curl** to test the endpoints.


