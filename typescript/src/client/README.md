[SDK](../../../) / [TypeScript](../../) / **Client**

<div style="display: flex; align-items: center;">
  <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/superface.png" alt="Superface" width="100" height="100" />
</div>

# Superface Client

Superface Client provides a seamless way to integrate intelligent tools into your applications. It allows you to fetch tool definitions, run tools, and manage user connections.

## Installation

To install the Superface SDK, run the following command:

```sh
npm install superface
```

## Usage

### Importing and Creating an Instance

```ts
// import client
import Superface from 'superface/client';

// create instance 
const superface = new Superface();
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

```ts
for (const toolCall of response.toolCalls) {
  const toolRun = await superface.runTool({
    userId: 'example_user',
    name: toolCall.function.name,
    args: JSON.parse(toolCall.function.arguments),
  });
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
