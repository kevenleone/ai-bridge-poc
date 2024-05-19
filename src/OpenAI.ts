import _OpenAI from 'openai';
import AI, { FunctionCallPayload, FunctionCallResponse } from './AI';

export default class OpenAI extends AI {
  private openAI: _OpenAI;

  constructor(apiKey: string) {
    super();

    this.openAI = new _OpenAI({
      apiKey,
    });
  }

  async getFunctionCall(
    payload: FunctionCallPayload
  ): Promise<FunctionCallResponse> {
    const functionCalls = payload.functions;
    const messages = payload.message.messages;
    const model = 'gpt-3.5-turbo';

    const response = await this.openAI.chat.completions.create({
      model,
      functions: functionCalls.map((functionCall) => ({
        name: functionCall.name,
        parameters: functionCall.parameters,
      })),
      function_call: { name: functionCalls[0].name },
      messages: messages.map((message, index) => ({
        role: message.role
          ? message.role
          : index === 0
          ? 'system'
          : ('user' as any),
        content: message.text,
      })),
    });

    const functionCallResponse: FunctionCallResponse = {
      aiProvider: 'openai',
      answers: response.choices.map((choice) => {
        const response = JSON.parse(
          choice.message.function_call?.arguments ?? '{}'
        );

        return {
          role: choice.message.role,
          response,
          [choice.message.function_call?.name ?? 'default']: response,
        };
      }),
      model,
      tokensCount: {
        candidate: response.usage?.completion_tokens ?? 0,
        prompt: response.usage?.prompt_tokens ?? 0,
        total: response.usage?.total_tokens ?? 0,
      },
    };

    return functionCallResponse as FunctionCallResponse;
  }
}
