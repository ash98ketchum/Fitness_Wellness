const express = require('express');
const router = express.Router();
const AICoach = require('../services/ai-coach');

// Simulated User Context (Normally fetched from DB via auth token)
const mockUserContext = {
  id: 'usr_123',
  allergies: ['peanuts', 'shellfish'],
  goals: ['muscle_gain']
};

router.post('/cooking', async (req, res) => {
  try {
    const { mealId, messages } = req.body;
    
    if (!mealId || !messages) {
      return res.status(400).json({ error: 'Missing mealId or messages' });
    }

    const response = await AICoach.processQuery(mealId, mockUserContext, messages);
    
    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
