# 🚗 OrbitPark-Parking Management System

A full-stack web application for managing parking facilities with real-time space monitoring, automated billing, and role-based access control.

## Overview

This system provides a complete digital solution for parking facility management, featuring:

- **Real-time parking space monitoring** - Track available, occupied, and maintenance spaces
- **Automated entry/exit management** - Quick vehicle check-in and check-out with automated billing
- **Role-based dashboards** - Separate interfaces for Admins, Staff, and Customers
- **Smart billing system** - Automatic fee calculation based on parking duration
- **Transaction history** - Complete record of all parking sessions and revenue

## Tech Stack

**Frontend:**
- HTML5, Tailwind CSS, JavaScript

**Backend:**
- Node.js, Express.js

**Database:**
- MongoDB

**Authentication:**
- JWT (JSON Web Tokens)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or higher)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd parking-management-system
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- dotenv
- bcryptjs
- jsonwebtoken
- cors
- body-parser

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/parking-system
PORT=5000
JWT_SECRET=ParkingSystem@SecureKey#2025!Management
```

### 4. Start MongoDB

Ensure MongoDB is running on your system

### 5. Run the Application

**Backend:**
```bash
npm run dev
```

The server will start at `http://localhost:5000`

**Frontend:**
- Open `frontend/login.html` in your browser, or
- Use VS Code Live Server extension (recommended)


## Usage Guide

### First-Time Setup

1. **Start the backend server** (must be running for the application to work)
   ```bash
   npm run dev
   ```

2. **Open the frontend** in your browser (via Live Server or directly)

3. **Create an Admin account:**
   - Go to Register page
   - Fill in details and select "Admin" role
   - Login with admin credentials

4. **Add parking spaces:**
   - Login as Admin
   - Go to "Parking Spaces" tab
   - Click "Add Space"
   - Create spaces (e.g., A01, A02, EV01, H01)

## 📝 License

This project is created for educational purposes.