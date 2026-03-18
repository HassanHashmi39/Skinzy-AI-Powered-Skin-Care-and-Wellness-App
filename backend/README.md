# Skinzy Backend (MERN)

A Node.js + Express + MongoDB backend for the **Skinzy** skin care app.

## Structure
```
backend/
├── config/
│   └── db.js               # MongoDB connection
├── controllers/
│   └── authController.js   # Login & Signup logic
├── middleware/
│   └── authMiddleware.js   # JWT token verification
├── models/
│   └── User.js             # User schema (patient & doctor)
├── routes/
│   └── authRoutes.js       # Auth API routes
├── .env                    # Environment variables
├── index.js                # Main server entry point
└── package.json
```

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/skinzy  # or your MongoDB Atlas URI
JWT_SECRET=your_secret_key_here
```

### 3. Run Server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

## API Endpoints

| Method | Endpoint         | Description              | Auth Required |
|--------|-----------------|--------------------------|---------------|
| POST   | /api/auth/signup | Register (patient/doctor)| No            |
| POST   | /api/auth/login  | Login user               | No            |
| GET    | /api/auth/me     | Get current user profile | Yes (Bearer)  |
| GET    | /api/health      | Health check             | No            |

## Auth Flow

All protected routes require:
```
Authorization: Bearer <token>
```
Token is returned from login/signup response.
