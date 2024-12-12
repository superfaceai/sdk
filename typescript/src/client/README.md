[SDK](../../../) / [TypeScript](../../) / **Client**

<div style="display: flex; align-items: center;">
  <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/superface.png" alt="Superface" width="100" height="100" />
</div>

# Superface Client

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