# Women Safety Emergency Alert Web Application

This is a full-stack Software Engineering project designed to provide quick, reliable assistance to women in emergency situations. The application facilitates SOS alerting, live location sharing, emergency contact management, audio/video evidence logging, and safety path visualization.

## Features

1. **Emergency SOS Trigger**: A prominent button on the dashboard that sends immediate alert messages (and emails/SMS stubs) containing location coordinates to registered emergency contacts.
2. **Live Location Sharing**: Integrates Google Maps API to track and share current coordinates with selected contacts in real-time.
3. **Emergency Contacts Management**: User CRUD dashboard to add, view, update, and delete emergency contacts (name, relationship, phone number, email).
4. **Audio/Video Evidence Capture**: Direct capture from user device microphone and camera when SOS is triggered, uploading the evidence logs to the backend database.
5. **Danger Zone Visualizer**: Displays a heat map or pin indicators of previously reported unsafe locations (incident history analytics) to assist users in navigating safely.
6. **Secure User Authentication**: JWT-based user login and signup with encrypted password storage.
7. **Incident History Dashboard**: Log book of past triggered SOS incidents, including timestamp, location, and captured media evidence.

---

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons, Axios, Google Maps API
- **Backend**: Node.js, Express.js, JWT, Mongoose, Multer (for media handling)
- **Database**: MongoDB
- **Deployment**: Vercel (Frontend & Serverless Backend configuration)

---

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm (v9.x or later)
- MongoDB (Local instance or Atlas cloud cluster)
- Google Maps JavaScript API Key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd women-safety-app
   ```

2. Install all dependencies for both frontend and backend automatically:
   ```bash
   npm run install-all
   ```

3. Setup environment files:
   - Duplicate `.env.example` as `.env` at the root, or place individual `.env` files in `backend/` and `frontend/` folders.
   - Fill in your MongoDB connection string and Google Maps API Key.

### Running the Application

To start both the Express backend and the Vite React frontend in development mode simultaneously:

```bash
npm run dev
```

- **Frontend development server**: [http://localhost:5173](http://localhost:5173)
- **Backend API server**: [http://localhost:5000](http://localhost:5000)

---

## Project Structure

```text
women-safety-app/
├── backend/            # Express REST API
│   ├── config/         # DB Connection
│   ├── controllers/    # API Controllers
│   ├── middleware/     # Auth & Error handling
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # Express Routes
│   └── server.js       # App entrypoint
├── frontend/           # React + Vite client
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── context/    # Global Context states (Auth)
│   │   ├── pages/      # View pages
│   │   └── index.css   # Global styles with Tailwind CSS
└── package.json        # Workspace runner configuration
```
