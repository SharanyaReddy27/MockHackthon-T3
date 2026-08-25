const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

// Route Imports
const healthcareCenterRoutes = require('./routes/healthcareCenterRoutes');
const referralRoutes = require('./routes/referralRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const referralController = require('./controllers/referralController');
const { getPatientReferralsValidator } = require('./validators/referralValidator');
const validate = require('./middleware/validationMiddleware');
const { optionalAuth } = require('./middleware/authMiddleware');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root & Health Check Endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'Village Health Access System - Referral & Analytics Backend API',
    version: '1.0.0',
    documentation: '/docs/API.md',
    status: 'online'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount Module Routes
app.use('/api/healthcare-centers', healthcareCenterRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/analytics', analyticsRoutes);

// Direct Patient-Referral route as per API specification: GET /api/patients/:patientId/referrals
app.get(
  '/api/patients/:patientId/referrals',
  optionalAuth,
  getPatientReferralsValidator,
  validate,
  referralController.getPatientReferrals
);

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server if not imported by test suite
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  });
}

module.exports = app;