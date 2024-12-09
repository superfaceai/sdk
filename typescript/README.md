# Superface SDK - TypeScript

## Install

```sh
npm install superface
```

## Use

### Superface Client

```ts
// import client
import Superface from 'superface/client';

// create instance 
const superface = new Superface();

// get tools definitions
const tools = await superface.getTools();

// format and pass tools to LLM 
const response = await callLLM({
  tools: tools.map(tool => ({ ... })),
  prompt: '...'
});

// handle tool calls
for (const toolCall of response.toolCalls) {
  const toolRun = await superface.runTool({
    userId: 'example_user',
    name: toolCall.function.name,
    args: JSON.parse(toolCall.function.arguments),
  });
}
```

Let users manage tool connections
```ts
const connections = await superface.toolConnections({ userId: 'example_user' });
redirect(connections.configuration_url);
```

### With OpenAI

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

### Examples

For more examples see [typescript/examples](./examples) folder.

## Environemt variables

`SUPERFACE_API_KEY` this value is used to authenticate clients to Superface API

`SUPERFACE_CACHE_TIMEOUT` Set in miliseconds to change cache of tools definitions. By default they are valid for 60000ms.

`SUPERFACE_MAX_RETRIES` Max retries to communicate with Superface servers. affects `getTools` and `runTool` functions.