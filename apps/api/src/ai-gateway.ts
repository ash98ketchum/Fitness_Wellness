import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// We can support multiple providers here later (OpenAI, Claude, Gemini).
// For now, it unifies the Groq implementation.
export type Provider = 'groq' | 'openai' | 'claude';

export interface AIGatewayRequest {
  provider?: Provider;
  model?: string;
  messages: { role: 'system' | 'user' | 'assistant', content: string }[];
  temperature?: number;
  responseFormat?: 'json' | 'text';
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY_1 || process.env.GROQ_API_KEY });

export class AIGateway {
  static async generate(req: AIGatewayRequest): Promise<string> {
    const provider = req.provider || 'groq';
    const model = req.model || 'llama-3.3-70b-versatile';
    const temperature = req.temperature ?? 0.7;

    if (provider === 'groq') {
      try {
        const completion = await groq.chat.completions.create({
          messages: req.messages,
          model,
          temperature,
          response_format: req.responseFormat === 'json' ? { type: 'json_object' } : undefined,
        });
        
        return completion.choices[0]?.message?.content || '';
      } catch (error) {
        console.error('[AIGateway] Error calling Groq:', error);
        throw new Error('AI Generation failed');
      }
    }

    throw new Error(`Provider ${provider} is not yet implemented.`);
  }

  static async generateJson<T>(req: AIGatewayRequest): Promise<T> {
    const res = await this.generate({ ...req, responseFormat: 'json' });
    try {
      return JSON.parse(res) as T;
    } catch (e) {
      console.error('[AIGateway] Failed to parse JSON response:', res);
      throw new Error('Invalid JSON returned from AI');
    }
  }
}
