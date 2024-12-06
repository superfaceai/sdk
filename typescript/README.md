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
const superfaceToolkit = new Superface();

// get tools definitions
const tools = await superface.getTools();

// format and pass tools to LLM 
const chatCompletion = await openai.chat.completions.create({
  model: 'gpt-4o',
  tools: await superfaceToolkit.getTools(),
  messages,
});

// handle tool calls
for (const toolCall of message.tool_calls) {
  const toolRun = await superfaceToolkit.runTool({
    userId: 'example_user',
    name: toolCall.function.name,
    args: JSON.parse(toolCall.function.arguments),
  });
}
```

Let user manage Connections configuration
```ts
const url = await superface.configurationLink({ userId: 'example_user' });
redirect(url);
```

### OpenAI

TBD if it stays

### Examples

For more examples see [typescript/examples](./examples) folder.

## Environemt variables

`SUPERFACE_API_KEY` this value is used to authenticate clients to Superface API

`SUPERFACE_CACHE_TIMEOUT` Set in miliseconds to change cache of tools definitions. By default they are valid for 60000ms.

`SUPERFACE_MAX_RETRIES`