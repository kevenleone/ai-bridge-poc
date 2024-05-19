import AIBridge from './AIBridge';
import GeminiAI from './GeminiAI';
import OpenAI from './OpenAI';
import env from './env';
import { blogPrompt } from './prompts/blogPrompt';
import { prettyPrintResponse } from './utils/prettyPrint';

const { GEMINI_KEY, OPENAI_KEY } = env;

const prompt = blogPrompt({
  count: 1,
  language: 'English - en-US',
  length: 250,
  topic: 'Dog breeds that are docile enough to live with children.',
});

console.log('Example calling and declaring individual AI Provider');

const geminiAI = new GeminiAI(GEMINI_KEY);
const openAI = new OpenAI(OPENAI_KEY);

prettyPrintResponse(await geminiAI.getFunctionCall(prompt));
prettyPrintResponse(await openAI.getFunctionCall(prompt));

console.log('Example using AIBridge');

const aiProviderGemini = new AIBridge({
  aiProvider: 'gemini',
  apiKey: GEMINI_KEY,
});

const aiProviderOpenAI = new AIBridge({
  aiProvider: 'openai',
  apiKey: OPENAI_KEY,
});

prettyPrintResponse(await aiProviderGemini.getFunctionCall(prompt));
prettyPrintResponse(await aiProviderOpenAI.getFunctionCall(prompt));
