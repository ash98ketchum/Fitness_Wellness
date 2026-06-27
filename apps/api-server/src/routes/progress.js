const express = require('express');
const router = express.Router();

let mockMealLogs = [];

// Endpoint: Fetch Progress for Today
router.get('/today', async (req, res) => {
  res.json({
    progress: {
      caloriesConsumed: mockMealLogs.length * 500, // Mock calculation
      date: new Date().toISOString()
    },
    mealLogs: mockMealLogs
  });
});

// Endpoint: Log a meal
router.post('/log', async (req, res) => {
  const { mealId } = req.body;
  
  if (!mealId) {
    return res.status(400).json({ error: 'Missing mealId' });
  }

  mockMealLogs.push({
    id: `log-${Date.now()}`,
    mealId,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, message: 'Meal logged successfully' });
});

module.exports = router;
