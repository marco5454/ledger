// Express server entry point for the backend API.
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
// [PHASE 2 ADDED] — Admin routes (protected by auth + admin middleware)
const adminRoutes = require('./routes/adminRoutes');
// [SETTINGS ADDED] User profile and settings routes
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

// Connect to MongoDB before handling requests.
connectDB();

// Middleware to parse JSON bodies and allow cross-origin requests.
app.use(cors());
app.use(express.json());

// Mount routes with clear separation of concerns.
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes); // [SETTINGS ADDED]

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
