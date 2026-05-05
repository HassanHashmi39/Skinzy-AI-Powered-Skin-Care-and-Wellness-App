# Skinzy Backend API 🚀 (MERN)

This is the central API server for the **Skinzy** skin care and wellness ecosystem. Built with Node.js, Express, and MongoDB, it handles user authentication, medical history, appointment scheduling, and patient-doctor communications.

---

## 🛠 Features

- **🛡️ Secure Auth**: JWT-based registration and login system for doctors and patients.
- **📅 Appointment Sync**: Full CRUD for booking and managing clinical visits.
- **💬 Secure Chat**: Low-latency messaging system between users.
- **🔬 Analysis History**: Persistent storage for AI-driven skin results and doctor observations.
- **🔔 Notifications**: Automated system alerts for appointments and analysis updates.
- **☀️ Weather Sync**: (In development) Weather-aware skin care advice based on location.

---

## 📂 Project Structure

```text
backend/
├── config/             # DB & Global App Configurations
├── controllers/        # Logical controllers (Auth, Chat, Appointments)
├── middleware/         # Custom Middleware (Auth, Error handling)
├── models/             # Mongoose Schemas (User, Analysis, Notification)
├── routes/             # Express Route definitions
├── index.js            # Main entry point for the server
└── .env                # Required environment variables
```

---

## ⚙️ Setup & Installation

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Create a `.env` file in the `backend/` root directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/skinzy
JWT_SECRET=your_complex_secret_here
```

### 3. Run Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints (Core)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/signup` | Create a new account | No |
| **POST** | `/api/auth/login` | Login and get JWT | No |
| **POST** | `/api/analyses` | Save a new AI analysis | Yes |
| **GET** | `/api/appointments` | Get scheduled appointments | Yes |
| **GET** | `/api/chat/:userId` | Retrieve chat history | Yes |

---

## 👨‍💻 Contribution
Built by the Skinzy Team.
