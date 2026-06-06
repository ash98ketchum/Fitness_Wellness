require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
const planRoutes = require('./routes/plans');
app.use('/api/v1/plans', planRoutes);

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-server' });
});

app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
