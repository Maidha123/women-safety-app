require('dotenv').config();
const express = require('express');
const cors = require('cors');

const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// Standard Middlewares
app.use(cors({
  origin: ['https://women-safety-app-wf9s.vercel.app', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5180', 'http://localhost:5181'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Definition
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));

// Root endpoint status check
app.get('/', (req, res) => {
  res.json({ message: 'Women Safety API is running...' });
});

// Custom Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 7860;

app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});