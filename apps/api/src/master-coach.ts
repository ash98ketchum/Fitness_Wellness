import { PrismaClient } from '@prisma/client';
import { AIGateway } from './ai-gateway';
import { buildAgentContext } from './agent-context';

const prisma = new PrismaClient();

export class MasterCoach {
  
  static async evaluateEvent(userId: string, eventType: string, eventData: any) {
    // 1. Log the Event
    const eventLog = await prisma.eventLog.create({
      data: {
        userId,
        eventType,
        eventData: JSON.stringify(eventData),
      }
    });

    console.log(`[Master Coach] Received Event: ${eventType} for User ${userId}`);

    // 2. Build Context
    const contextStr = await buildAgentContext(userId);

    // 3. Goal Evaluator (Master Coach decides how this impacts the goal)
    const evaluation = await AIGateway.generateJson<{
      impactSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
      requiresPlanAdjustment: boolean;
      reasoning: string;
      specializedAgentRequired: 'NUTRITION' | 'WORKOUT' | 'RECOVERY' | 'NONE';
    }>({
      messages: [
        {
          role: 'system',
          content: 'You are the Athelya Master Coach Goal Evaluator. Assess the user\'s new event against their Transformation State. Output JSON with impactSeverity, requiresPlanAdjustment, reasoning, and specializedAgentRequired.'
        },
        {
          role: 'user',
          content: `Context:\n${contextStr}\n\nNew Event:\n${eventType} - ${JSON.stringify(eventData)}`
        }
      ]
    });

    console.log(`[Master Coach] Goal Evaluator decided: ${evaluation.reasoning}`);

    // 4. Delegate to Specialized Agent (if required)
    let agentRecommendation = null;
    if (evaluation.requiresPlanAdjustment && evaluation.specializedAgentRequired !== 'NONE') {
      agentRecommendation = await this.consultSpecializedAgent(
        userId, 
        evaluation.specializedAgentRequired, 
        contextStr, 
        eventType, 
        eventData
      );
    }

    // 5. Single Writer Principle: Master Coach makes the final decision
    const finalDecision = await AIGateway.generateJson<{
      approvedModifications: any;
      confidenceShift: number;
      recoveryShift: number;
      userNotificationMessage: string;
    }>({
      messages: [
        {
          role: 'system',
          content: 'You are the Athelya Master Coach Final Decider. Review the event and agent recommendations. Output JSON to strictly define what DB modifications are approved, how confidence/recovery shifts, and a message for the user.'
        },
        {
          role: 'user',
          content: `Context:\n${contextStr}\n\nEvent:\n${eventType}\n\nAgent Recommendation:\n${JSON.stringify(agentRecommendation)}\n\nMake your final ruling.`
        }
      ]
    });

    // 6. Trigger Notification (Agent-Driven)
    if (finalDecision.userNotificationMessage) {
      await this.triggerAgentNotification(userId, finalDecision.userNotificationMessage);
    }

    // 7. Commit Updates
    await this.commitUpdates(userId, finalDecision, eventLog.id);

    return finalDecision;
  }

  private static async triggerAgentNotification(userId: string, message: string) {
    // In production, this integrates with Expo Push Notifications or Firebase
    console.log(`[Push Notification Dispatch] To User ${userId}: "${message}"`);
  }

  private static async consultSpecializedAgent(userId: string, agentType: string, contextStr: string, eventType: string, eventData: any) {
    console.log(`[Master Coach] Consulting ${agentType} agent...`);
    // Specialized Agents only RETURN recommendations, never write to DB
    return await AIGateway.generateJson<any>({
      messages: [
        {
          role: 'system',
          content: `You are the specialized ${agentType} Agent. Analyze the event and context. Output JSON with your recommended adjustments to the user's plan. You do not make final decisions.`
        },
        {
          role: 'user',
          content: `Context:\n${contextStr}\n\nEvent:\n${eventType} - ${JSON.stringify(eventData)}`
        }
      ]
    });
  }

  private static async commitUpdates(userId: string, finalDecision: any, eventLogId: string) {
    // Write AI Decision Log
    await prisma.aIDecisionLog.create({
      data: {
        userId,
        reason: 'EVENT_RESOLUTION',
        decision: finalDecision.userNotificationMessage,
        impact: JSON.stringify(finalDecision),
        confidence: 100
      }
    });

    // Update Transformation State
    await prisma.transformationState.update({
      where: { userId },
      data: {
        confidenceScore: { increment: finalDecision.confidenceShift || 0 },
        recoveryScore: { increment: finalDecision.recoveryShift || 0 }
      }
    });

    console.log(`[Master Coach] Committed updates for User ${userId}`);
  }
}
