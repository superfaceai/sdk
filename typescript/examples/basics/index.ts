import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { SuperfaceClient, ToolRun } from 'superface/client';

export async function* runAgent({
  prompt,
}: {
  prompt: string;
}): AsyncGenerator<
  { kind: 'tool_run'; toolRun: ToolRun } | { kind: 'content'; content: string }
> {
  // Create Superface Toolkit instance
  const superfaceToolkit = new SuperfaceClient({
    apiKey: process.env['SUPERFACE_KEY'],
  });

  const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
  });

  // Install tools at https://pod.superface.ai/hub/settings/tools

  const messages: ChatCompletionMessageParam[] = [];
  messages.push({
    role: 'user',
    content: prompt,
  });

  console.log('messages', messages);

  while (true) {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      tools: await superfaceToolkit.getTools(),
      messages,
    });

    const message = chatCompletion.choices[0].message;
    messages.push(message);

    if (!message.tool_calls) {
      yield { kind: 'content', content: message.content ?? '' };
      return;
    }

    for (const toolCall of message.tool_calls) {
      const result = await superfaceToolkit.runTool({
        userId: 'example_user',
        name: toolCall.function.name,
        args: JSON.parse(toolCall.function.arguments),
      });

      yield { kind: 'tool_run', toolRun: result };

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }
}
