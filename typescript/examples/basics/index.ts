import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { SuperfaceClient } from 'superface/client';

require('dotenv').config();

const openai = new OpenAI();
const superfaceToolkit = new SuperfaceClient();

async function main() {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: 'user',
      // content: 'What tools do you have?',
      content: 'Look for Superface in ARES',
    },
  ];

  console.clear();
  console.log('💬', messages[0]);

  while (true) {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o',
      tools: await superfaceToolkit.getTools(),
      messages,
    });

    const message = chatCompletion.choices[0].message;
    messages.push(message);
    console.log('💬', message);

    if (message.role === 'assistant' && message.tool_calls) {
      for (const toolCall of message.tool_calls) {
        console.log('ℹ️', `Running Superface tool '${toolCall.function.name}'`);

        const toolRun = await superfaceToolkit.runTool({
          userId: 'example_user',
          name: toolCall.function.name,
          args: JSON.parse(toolCall.function.arguments),
        });

        messages.push({
          role: 'tool' as const,
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolRun),
        });
        console.log('💬', messages[messages.length - 1]);
      }
    } else {
      console.log('ℹ️', 'No more tool calls. Exiting.');
      break;
    }
  }
}

void main();
