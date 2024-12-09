import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import Superface from 'superface/openai';

require('dotenv').config();

const openai = new OpenAI();
const superface = new Superface();

async function main() {
  const messages: ChatCompletionMessageParam[] = [
    { role: 'user', content: 'What tools do you have?' },
  ];

  while (true) {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      tools: await superface.getTools(),
      messages,
    });
    const message = chatCompletion.choices[0].message;
    messages.push(message);

    if (message.tool_calls === undefined) {
      console.log(message.content);
      break;
    }

    const toolRunResults = await superface.handleToolCalls({
      userId: 'example_user',
      message: chatCompletion.choices[0].message,
    });
    messages.push(...toolRunResults.map((result) => result.toMessage()));
  }
}

void main();
