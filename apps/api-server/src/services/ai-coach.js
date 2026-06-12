// Mock Implementation of Voice Cooking Assistant (Context Aware)

class AICoach {
  constructor() {
    this.model = 'gpt-4o';
  }

  async processQuery(mealId, userContext, chatHistory) {
    console.log(`[AI Coach] Processing query for Meal ${mealId}...`);
    
    const lastMessage = chatHistory[chatHistory.length - 1].content.toLowerCase();
    
    // Simulate Context-Aware Logic
    if (lastMessage.includes('peanut') || lastMessage.includes('nut')) {
      if (userContext.allergies.includes('nuts') || userContext.allergies.includes('peanuts')) {
        return {
          reply: "⚠️ STOP! You cannot use peanut butter. You have a severe nut allergy listed in your profile. I recommend using Sunflower Seed Butter (SunButter) instead as a safe, macro-friendly alternative.",
          safetyFlag: 'CRITICAL',
          audioUrl: '/audio/generated_voice_response_1.mp3' // Simulated TTS response
        };
      }
    }

    if (lastMessage.includes('substitute') && lastMessage.includes('chicken')) {
      return {
        reply: "You can substitute the chicken with 200g of Tofu or 150g of Shrimp to keep the protein macros similar. Which would you prefer?",
        safetyFlag: 'SAFE',
        audioUrl: '/audio/generated_voice_response_2.mp3'
      };
    }

    return {
      reply: "I'm here to guide you through cooking this meal. Would you like me to read the first step out loud?",
      safetyFlag: 'SAFE',
      audioUrl: '/audio/generated_voice_response_default.mp3'
    };
  }
}

module.exports = new AICoach();
