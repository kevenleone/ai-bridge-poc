import { FunctionCallResponse } from '../AI';

export const prettyPrintResponse = (response: FunctionCallResponse) => {
  console.log(
    `Details ---> \nAI Provider: ${response.aiProvider}\nAI Model: ${response.model}`
  );

  console.log('Pretty Printing answers:');

  for (const answer of response.answers) {
    console.log(answer.response);
  }
};
