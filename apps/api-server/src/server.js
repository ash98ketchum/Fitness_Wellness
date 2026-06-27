require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
const planRoutes = require('./routes/plans');
const agentRoutes = require('./routes/agents');
const progressRoutes = require('./routes/progress');

app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/agents', agentRoutes);
app.use('/api/v1/progress', progressRoutes);

// Mock Auth Routes for Testing
app.post('/api/v1/auth/signup', (req, res) => {
  res.json({ token: 'mock-jwt-token', user: { id: 'usr_1', name: req.body.name, email: req.body.email, onboardingCompleted: false } });
});

app.post('/api/v1/auth/login', (req, res) => {
  res.json({ token: 'mock-jwt-token', user: { id: 'usr_1', name: 'Test User', email: req.body.email, onboardingCompleted: true } });
});

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-server' });
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
