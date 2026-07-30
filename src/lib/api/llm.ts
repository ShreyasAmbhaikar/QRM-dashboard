import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'text' | 'json';
}

export interface LLMResponse {
  content: string;
  provider: 'groq' | 'cerebras' | 'gemini' | 'mock';
  model: string;
  tokensUsed: number;
}

export class LLMClient {
  private groqClient: Groq | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    if (process.env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  public async generate(request: LLMRequest): Promise<LLMResponse> {
    const systemPrompt = request.systemPrompt || 'You are an expert SEO assistant for Quantum Reach Media.';
    const temperature = request.temperature ?? 0.7;
    const maxTokens = request.maxTokens ?? 2000;

    // Provider 1: Groq (Llama 3.3 70B)
    if (this.groqClient) {
      try {
        logger.info('Attempting LLM generation via Groq...');
        const response = await this.groqClient.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: request.prompt },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature,
          max_tokens: maxTokens,
          response_format: request.responseFormat === 'json' ? { type: 'json_object' } : undefined,
        });

        const content = response.choices[0]?.message?.content || '';
        const tokensUsed = response.usage?.total_tokens || 0;

        logger.info({ provider: 'groq', model: 'llama-3.3-70b-versatile', tokensUsed }, 'LLM generation successful');
        return {
          content,
          provider: 'groq',
          model: 'llama-3.3-70b-versatile',
          tokensUsed,
        };
      } catch (err) {
        logger.warn({ error: err }, 'Groq LLM generation failed or rate limited, failing over to Cerebras...');
      }
    }

    // Provider 2: Cerebras API (Llama 3.3 70B via HTTP endpoint)
    if (process.env.CEREBRAS_API_KEY) {
      try {
        logger.info('Attempting LLM generation via Cerebras...');
        const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'llama3.3-70b',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: request.prompt },
            ],
            temperature,
            max_tokens: maxTokens,
            response_format: request.responseFormat === 'json' ? { type: 'json_object' } : undefined,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || '';
          const tokensUsed = data.usage?.total_tokens || 0;

          logger.info({ provider: 'cerebras', model: 'llama3.3-70b', tokensUsed }, 'LLM generation successful');
          return {
            content,
            provider: 'cerebras',
            model: 'llama3.3-70b',
            tokensUsed,
          };
        }
        logger.warn({ status: res.status }, 'Cerebras LLM generation failed, failing over to Gemini...');
      } catch (err) {
        logger.warn({ error: err }, 'Cerebras API call failed...');
      }
    }

    // Provider 3: Google Gemini
    if (this.geminiClient) {
      try {
        logger.info('Attempting LLM generation via Google Gemini...');
        const model = this.geminiClient.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            responseMimeType: request.responseFormat === 'json' ? 'application/json' : 'text/plain',
          },
        });

        const result = await model.generateContent(request.prompt);
        const response = await result.response;
        const content = response.text();

        logger.info({ provider: 'gemini', model: 'gemini-1.5-flash' }, 'LLM generation successful');
        return {
          content,
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          tokensUsed: 0,
        };
      } catch (err) {
        logger.warn({ error: err }, 'Google Gemini LLM generation failed...');
      }
    }

    // Provider 4: Mock Fallback (Development Default)
    logger.info('No LLM API keys provided or all providers rate-limited. Using intelligent mock fallback.');
    let mockContent = request.responseFormat === 'json' 
      ? JSON.stringify({
          status: 'success',
          summary: 'Mock LLM Response generated for development environment.',
          suggestions: ['Optimize page speed', 'Target long-tail keywords', 'Improve local GBP post cadence'],
        })
      : `[Mock LLM Output] Standard response for prompt: "${request.prompt.substring(0, 60)}..."`;

    return {
      content: mockContent,
      provider: 'mock',
      model: 'development-mock-v1',
      tokensUsed: 100,
    };
  }
}

export const llmClient = new LLMClient();
