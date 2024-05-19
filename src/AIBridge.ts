import AI, { FunctionCallPayload, FunctionCallResponse } from './AI';
import GeminiAI from './GeminiAI';
import OpenAI from './OpenAI';

type AIBridgeConfig = {
  aiProvider: 'gemini' | 'openai';
  apiKey: string;
};

export default class AIBridge extends AI {
  private AIProvider: AI;

  constructor(config: AIBridgeConfig) {
    super();

    this.AIProvider =
      config.aiProvider === 'gemini'
        ? new GeminiAI(config.apiKey)
        : new OpenAI(config.apiKey);
  }

  getFunctionCall(
    _payload: FunctionCallPayload
  ): Promise<FunctionCallResponse> {
    return this.AIProvider.getFunctionCall(_payload);
  }
}
