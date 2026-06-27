import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { buildAgentContext } from './agent-context';
import { AIGateway } from './ai-gateway';

const prisma = new PrismaClient();

export async function runDailyReflection(userId: string) {
  try {
    const contextStr = await buildAgentContext(userId);
    
    // Check if it has been 14 days since the last weight update
    const transformState = await prisma.transformationState.findUnique({ where: { userId } });
    let systemPrompt = 'You are the Athelya Master Coach. Your goal is to review the user\'s daily actions, reflect on their consistency, adjust their recovery score, and provide a motivational summary. Output must be valid JSON with keys: "summary", "motivation", "tomorrowFocus", "recoveryScoreUpdate" (number 0-100), "adjustments" (array of suggested actions).';
    
    if (transformState?.lastWeightUpdate) {
      const daysSinceUpdate = (Date.now() - transformState.lastWeightUpdate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate >= 14) {
        systemPrompt += ' IMPORTANT: The user has not updated their weight in 14 days. You MUST append a friendly reminder to the `motivation` string asking them to tell you their current weight so Athelya can update their plans.';
      }
    }

    // Call the AI Gateway
    const result = await AIGateway.generateJson<{
      summary: string;
      motivation: string;
      tomorrowFocus: string;
      recoveryScoreUpdate: number;
      adjustments: any[];
    }>({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Here is the user's latest context snapshot:\n\n${contextStr}\n\nProvide the Daily Reflection JSON.`
        }
      ]
    });

    // Save reflection to AIDecisionLog
    await prisma.aIDecisionLog.create({
      data: {
        userId,
        reason: 'DAILY_REFLECTION',
        decision: result.summary,
        impact: JSON.stringify(result),
        confidence: 100
      }
    });

    // Update Transformation State recovery score
    await prisma.transformationState.update({
      where: { userId },
      data: {
        recoveryScore: result.recoveryScoreUpdate
      }
    });

    console.log(`[Daily Reflection] Successfully ran for user ${userId}`);
    return result;
  } catch (error) {
    console.error(`[Daily Reflection] Failed for user ${userId}`, error);
  }
}

export function initCronJobs() {
  // Run daily reflection at 11:45 PM every day
  cron.schedule('45 23 * * *', async () => {
    console.log('[CRON] Starting Daily Reflection for all users...');
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      await runDailyReflection(user.id);
    }
    console.log('[CRON] Daily Reflection complete.');
  });
}
