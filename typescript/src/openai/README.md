[SDK](../../../) / [TypeScript](../../) / **OpenAI**

<div style="display: flex; align-items: center;">
  <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/openai.png" alt="OpenAI" width="100" height="100" />
</div>

# Superface SDK for OpenAI

```ts
// import SDK
import Superface from 'superface/openai';
import OpenAI from 'openai';

// Create instance
const superface = new Superface();
const openai = new OpenAI();

const messages: ChatCompletionMessageParam[] = [
  { role: 'user', content: '...' },
];

// Call OpenAI with Superface tools
const chatCompletion = await openai.chat.completions.create({
  model: 'gpt-4o',
  tools: await superface.getTools(),
  messages,
});
const message = chatCompletion.choices[0].message;
messages.push(message);

// handle tool calls
for (const toolCall of message.tool_calls ?? []) {
  const toolRunResult = await superface.runTool({
    userId: 'example_user',
    toolCall,
  });
  messages.push(toolRunResult.toMessage());
}
```

## Beta

Superface SDK offers seamless integration for [OpenAI's automated function calls](https://github.com/openai/openai-node?tab=readme-ov-file#automated-function-calls).

```ts
const openai = new OpenAI();
const superface = new Superface();

const runner = openai.beta.chat.completions
  .runTools({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'What tools do you have?' }],
    tools: await superface.beta.getTools({ userId: 'example_user' }),
  })
  .on('message', (message) => console.log(message));

const finalContent = await runner.finalContent();
console.log();
console.log('Final content:', finalContent);
```
