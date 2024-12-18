[Frameworks](../../../) → **Client** → **TypeScript** | Python (soon)

# <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/client.png" alt="{ }" width="30" height="30" />  Superface Client

> [!NOTE]  
> This is a low-level client, you will need to handle mapping of function descriptors & tool calling manually. For framework specific use, please refer to [supported frameworks](../../../).

Superface SDK lets you integrate external apps with your AI agent using function calling.

This client is optimized for manual handling of tools and is framework agnostic. It allows you to fetch tool definitions, run tools, and manage user connections.

## Installation

```sh
npm install superface
```

## Usage

Obtain your agent's secret key and connect tools you want your agent to have access to in [Superface dashboard](https://pod.superface.ai/hub/api).

```ts
import Superface from 'superface/client';

const superface = new Superface({
  apiKey: process.env.SUPERFACE_API_KEY!,
});
```

### Getting Tool Definitions

```ts
const tools = await superface.getTools();
```

### Integrating with LLM

```ts
const response = await callLLM({
  tools: tools.map(tool => ({ ... })),
  prompt: '...'
});
```

### Handling Tool Calls

1. Iterate through tool calls as returned from LLM
2. Pass the tool call object from the LLM into `runTool()` method on Superface Client
3. Add the tool call response to the original chain of messages

```ts
// ...
const messages = [{ role: 'user', content: '...' } ];

const response = await callLLm({ ... });

// Handle tool calls
for (const toolCall of toolCalls) {
  const toolRun = await superface.runTool({
    userId: 'example_user',
    name: toolCall.function.name,
    args: JSON.parse(toolCall.function.arguments),
  });

  const toolMessage = {
    role: 'tool',
    content: toolRun.result || toolRun.error
  }
  messages.push(toolMessage);
}
```

### Managing User Connections

```ts
const link = await superface.linkToUserConnections({ userId: 'example_user' });
redirect(link.url);
```

## Environment Variables

- `SUPERFACE_API_KEY`: This value is used to authenticate clients to the Superface API.
- `SUPERFACE_CACHE_TIMEOUT`: Set in milliseconds to change the cache timeout for tool definitions. The default is 60000ms.
- `SUPERFACE_MAX_RETRIES`: Maximum number of retries to communicate with Superface servers. This affects `getTools` and `runTool` functions.

For more information, refer to the [Superface Documentation](https://superface.ai/docs).
