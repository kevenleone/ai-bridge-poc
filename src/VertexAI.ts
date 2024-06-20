import {
  FunctionDeclarationSchemaType,
  HarmBlockThreshold,
  HarmCategory,
  Tool,
  VertexAI as Vertex,
} from '@google-cloud/vertexai';

import AI, {
  FunctionCall,
  FunctionCallPayload,
  FunctionCallResponse,
} from './AI';

const project = 'liferaycloud-development';
const location = 'us-central1';
const textModel = 'gemini-pro';

export default class VertexAI extends AI {
  private vertexAI: Vertex;

  constructor(apiKey?: string) {
    super();

    this.vertexAI = new Vertex({
      project,
      location,
    });
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

  async testCall(_payload: FunctionCallPayload): Promise<FunctionCallResponse> {
    const model = this.vertexAI.getGenerativeModel({
      model: textModel,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: { maxOutputTokens: 256 },
    });

    const request = {
      contents: [
        { role: 'user', parts: [{ text: 'How are you doing today?' }] },
      ],
    };

    const result = await model.generateContent(request);
    const response = result.response;

    console.log(response);

    return {} as any;
  }

  async getFunctionCall(
    payload: FunctionCallPayload
  ): Promise<FunctionCallResponse> {
    console.log('Called');
    const model = this.vertexAI.getGenerativeModel({
      model: textModel,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
      generationConfig: { maxOutputTokens: 256 },
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

    console.log({ result });

    const response = await result.response;

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
