import {
  FunctionDeclarationSchemaType,
  GoogleGenerativeAI,
  Tool,
} from '@google/generative-ai';

import AI, {
  FunctionCall,
  FunctionCallPayload,
  FunctionCallResponse,
} from './AI';

export default class GeminiAI extends AI {
  private googleGenerativeAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    super();

    this.googleGenerativeAI = new GoogleGenerativeAI(apiKey);
  }

  private normalizeFunctions(functions: FunctionCall[]) {
    const functionsAsString = JSON.stringify(functions)
      .replaceAll(
        `"type": "string"`,
        `"type": "${FunctionDeclarationSchemaType.STRING}"`
      )
      .replaceAll(
        `"type": "array"`,
        `"type": "${FunctionDeclarationSchemaType.ARRAY}"`
      )
      .replaceAll(
        `"type": "integer"`,
        `"type": "${FunctionDeclarationSchemaType.INTEGER}"`
      )
      .replaceAll(
        `"type": "number"`,
        `"type": "${FunctionDeclarationSchemaType.NUMBER}"`
      )
      .replaceAll(
        `"type": "object"`,
        `"type": "${FunctionDeclarationSchemaType.OBJECT}"`
      )
      .replaceAll(
        `"type": "string"`,
        `"type": "${FunctionDeclarationSchemaType.STRING}"`
      );

    return JSON.parse(functionsAsString);
  }

  async getFunctionCall(
    payload: FunctionCallPayload
  ): Promise<FunctionCallResponse> {
    const model = this.googleGenerativeAI.getGenerativeModel({
      model: 'gemini-pro',
    });

    const functions = this.normalizeFunctions(
      payload.functions
    ) as FunctionCall[];

    const tools: Tool = {
      functionDeclarations: functions.map((functionCall) => ({
        name: functionCall.name,
        parameters: functionCall.parameters,
      })),
    };

    const result = await model.generateContent({
      tools: [tools],
      contents: payload.message.messages.map((message, index) => ({
        role: message.role ?? index === 0 ? 'model' : 'user',
        parts: [{ text: message.text }],
      })),
    });

    const response = await result.response;

    console.log('candidates', response.candidates);

    return {
      aiProvider: 'gemini',
      model: 'gemini-pro',
      answers: response.candidates?.map((candidate) => ({
        response: candidate.content,
        role: 'model',
      })),
      tokensCount: {
        candidate: response.usageMetadata?.candidatesTokenCount ?? 0,
        prompt: response.usageMetadata?.promptTokenCount ?? 0,
        total: response.usageMetadata?.totalTokenCount ?? 0,
      },
    } as FunctionCallResponse;
  }
}
