const express = require('express');
const router = express.Router();
// const { aiPlanQueue } = require('../queue/bullmq');

// Endpoint: Generate Plan (Trigger AI Pipeline)
router.post('/generate', async (req, res) => {
  const { userId, onboardingData } = req.body;
  
  if (!userId || !onboardingData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // In a real implementation, we would add this to the BullMQ queue here:
    // const job = await aiPlanQueue.add('generate-plan', { userId, onboardingData });
    const mockJobId = 'job-' + Date.now();
    
    res.status(202).json({
      jobId: mockJobId,
      status: 'queued',
      message: 'Diet plan generation has been queued.'
    });
  } catch (error) {
    console.error('Error queuing plan generation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint: Poll Pipeline Status
router.get('/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  // Mock response for MVP scaffolding
  res.json({
    jobId,
    status: 'reviewing',
    message: 'Consulting Nutrition Expert...',
    progress: 60
  });
});

// Endpoint: Fetch Active Plan
router.get('/active', async (req, res) => {
  // Mock response
  res.json({
    planId: 'mock-plan-123',
    totalCalories: 2200,
    macros: { p: 180, c: 200, f: 75 },
    meals: [
      {
        type: 'breakfast',
        name: 'High-Protein Oatmeal',
        calories: 450,
        ingredients: ['Oats', 'Whey Protein', 'Almonds']
      }
    ]
  });
});

// Endpoint: Fetch Latest Plan for Dashboard
router.get('/latest', async (req, res) => {
  res.json({
    plan: {
      id: 'mock-plan-123',
      totalCalories: 2400,
      proteinG: 180,
      carbsG: 220,
      fatsG: 80,
      meals: [
        {
          id: 'meal-1',
          time: '08:00 AM',
          name: 'Protein Oatmeal & Berries',
          calories: 450,
          macros: { protein: 30, carbs: 55, fats: 10 }
        },
        {
          id: 'meal-2',
          time: '01:00 PM',
          name: 'Grilled Chicken Salad',
          calories: 550,
          macros: { protein: 50, carbs: 20, fats: 25 }
        },
        {
          id: 'meal-3',
          time: '07:00 PM',
          name: 'Salmon & Sweet Potato',
          calories: 600,
          macros: { protein: 45, carbs: 40, fats: 20 }
        }
      ]
    }
  });
});

module.exports = router;
