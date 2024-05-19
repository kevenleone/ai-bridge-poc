export type FunctionCall = {
  name: string;
  parameters: any;
};

export type MessagePayload = {
  role: 'user' | 'system';
  messages: {
    role?: string;
    text: string;
  }[];
};

export type FunctionCallResponse = {
  aiProvider: 'gemini' | 'openai';
  answers: { role: string; response: any }[];
  model: string;
  tokensCount: {
    total: number;
    prompt: number;
    candidate: number;
  };
};

export type FunctionCallPayload = {
  message: MessagePayload;
  functions: FunctionCall[];
};

export default abstract class AI {
  async getFunctionCall(
    _payload: FunctionCallPayload
  ): Promise<FunctionCallResponse> {
    throw new Error('Implement me');
  }
}
