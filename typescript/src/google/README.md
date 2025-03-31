[Frameworks](../../../) → **Google GenAi** → **TypeScript** | Python (soon)

# <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/google.png" alt="Google Gen AI SDK (Gemini)" width="30" height="30" /> Superface SDK for Google Gemini (Gen AI)

Superface SDK lets you integrate external apps with your Google Gemini agent using function calling.

This SDK is optimized to be used with Google Gen AI SDK or other Google Gen AI-compatible LLM SDKs.

## Installation

```sh
npm install superface
```

## Usage

Obtain your agent's secret key and connect tools you want your agent to have access to in [Superface dashboard](https://pod.superface.ai/hub/api).

```ts
import Superface from 'superface/google';

const superface = new Superface({
  apiKey: process.env.SUPERFACE_API_KEY,
});
```

Load connected tools for agent using [`getTools()` method](#gettools).

```ts
const tools = await superface.getTools();
```

Or use directly in Google Gen AI chat completion call

```ts
import { GoogleGenAI, ContentUnion } from '@google/genai';
const googleGenAi = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const messages: ContentUnion[] = [
  {
    role: 'user',
    parts: [...]
  }
]

const chatCompletion = await googleGenAi.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: messages,
  config: {
    tools: await superface.getTools()
  }     
});
```

## Handling tool calls

When using [function calling](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/function-calling) with raw Google Gen AI SDK, you need to handle your tools calls manually:

1. Iterate through `functionCalls` as returned from LLM in `assistant` message
2. Pass the tool call object from the LLM into `runTool()` method on Superface SDK
3. Add the tool call response to the original chain of messages

```ts
// ...
const messages: ContentUnion[] = [
  {
    role: 'user',
    parts: [...]
  }
]

const chatCompletion =  await googleGenAi.models.generateContent({ ... });

const toolCalls = chatCompletion.functionCalls ?? [];

// Handle tool calls
for (const toolCall of toolCalls) {
  const toolRun = await superface.runTool({
    userId: 'example_user_id',
    toolCall,
  });

  const toolMessage = toolRun.toMessage(); // returns message with role='user'

  messages.push(toolMessage);
}
```

→ Read [`runTool` documentation](#runtool).

### Working with `ToolRunResult`

The `runTool()` method returns `ToolRunResult` that encapsulates the programmatic
result of the tool call.

Most of the time you will want to simply call `.toMessage()` that turns the result into
Google GenAi's message with `user` _role_ and pass that message to the original chain of messages.

→ Read [`ToolRunResult` interface documentation](#toolrunresult-interface).

## Managing user connections

```ts
const link = await superface.linkToUserConnections({
  userId: 'example_user_id',
});
redirect(link.url);
```

→ Read [`linkToUserConnections` documentation](#linktouserconnections).

---

# API Reference

### `new Superface()`

Creates a new instance of Superface SDK for Google GenAi-compatible SDKs.

```ts
import Superface from 'superface/google';

const superface = new Superface({
  apiKey: process.env.SUPERFACE_API_KEY,
  cacheTimeout: 60_000,
  maxRetries: 3,
  applicationReturnLink: {
    appName: 'Sales assistant',
    appUrl: 'https://example.com/assistant',
  },
});
```

#### Parameters

| Param                           | Description                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `apiKey`                        | Your agent's secret API key (from [Superface dashboard](https://pod.superface.ai/hub/api)) |
| `cacheTimeout`                  | (optional) Tools list cache timeout in milliseconds (default `60000`)                      |
| `maxRetries`                    | (optional) Maximum number of retries for requests (default `3`)                            |
| `applicationReturnLink`         | (optional)                                                                                 |
| `applicationReturnLink.appName` | Name of your agent application                                                             |
| `applicationReturnLink.appUrl`  | URL of your agent application the user should be returned to                               |

### `getTools()`

Returns connected tools to be used in Google GenAi-compatible SDKs.

The selection of tools returned by this method is managed in [Superface dashboard](https://pod.superface.ai/hub/api).

The list of tools is cached inside each `Superface` instance for the time specified in the constructor.

```ts
const chatCompletion = await googleGenAi.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: messages,
  config: {
    tools: await superface.getTools()
  }     
});
```

#### Returns

List of tools to be used in Google GenAi-compatible SDKs.

### `runTool()`

Runs a single specific tool call from `assistant` message returned from
Google GenAi-compatible API.

For shortcut, see [`handleToolCalls`](#handletoolcalls).

```ts
// ...
const chatCompletion = await googleGenAi.models.generateContent({ ... });

for (const toolCall of chatCompletion.functionCalls ?? []) {
  const toolRun = await superface.runTool({
    userId: 'example_user_id',
    toolCall,
  });

  // ...
}
```

#### Parameters

| Param      | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| `userId`   | Your own unique identifier for the end user of the agent           |
| `toolCall` | Single tool call object as returned by LLM via `assistant` message |

#### Returns

[`ToolRunResult`](#toolrunresult-interface)

### `handleToolCalls()`

Shortcut for [`runTool()`](#runtool).

Automatically runs _all_ tool calls in an `assistant` message returned from
Google GenAi-compatible API.

```ts
const chatCompletion = await googleGenAi.models.generateContent({ ... });

const toolRunResults = await superface.handleToolCalls({
  userId: 'example_user_id',
  message: chatCompletion
});
```

#### Parameters

| Param     | Description                                                             |
| --------- | ----------------------------------------------------------------------- |
| `userId`  | Your own unique identifier for the end user of the agent                |
| `message` | The original `assistant` message as returned from Google GenAi-compatible API |

#### Returns

Array of [`ToolRunResult`](#toolrunresult-interface). Empty array if no tool calls were present in the original message.

### `linkToUserConnections()`

Returns link to page where end users can manage their connections to the tools.

The return link back to your agent application can be configured in [Superface instance](#new-superface).

```ts
const link = await superface.linkToUserConnections({
  userId: 'example_user_id',
});
redirect(link.url);
```

#### Parameters

<!-- - `userId` Your own unique identifier for the end user of the agent -->

| Param    | Description                                              |
| -------- | -------------------------------------------------------- |
| `userId` | Your own unique identifier for the end user of the agent |

#### Returns

Object with `url` and metadata.

---

### `ToolRunResult` interface

Result of tool call runs, as returned from the SDK. You can handle it in 2 ways:

- pass the result directly back to LLM using `toMessage()`; or
- check for potential `requires_action` status and handle the required action as per `actionType` manually (e.g. presenting a custom UI for navigating user to authorize the tool)

#### `status` (string enum)

Result state of the tool call.

| status            | meaning                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `success`         | Tool call was successful                                                |
| `error`           | Tool call resulted in error                                             |
| `requires_action` | Tool requires an action on user's side before running, see `actionType` |

#### `assistantHint` (string)

Natural language message that tells the assistant (LLM) how to deal with the tool call result.

| status            | approx behavior                                                                     |
| ----------------- | ----------------------------------------------------------------------------------- |
| `success`         | Tells LLM to use the tool result                                                    |
| `error`           | Tells LLM there was an error and how to deal with it (e.g. whether it is retryable) |
| `requires_action` | Tells LLM how to handle the specific action (e.g. present link to authorize tools)  |

#### `result` (optional, any)

Only when status is `success`.

The result of the tool call, as returned from the external application.

#### `error` (optional string)

Only when status is `error`.

The tool call error.

#### `actionType` (optional string)

Only when status is `requires_action`.

Programmatic type of action that's required from the end user.

| action type        | handling                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `configure_access` | End user needs to authorize the agent to use the tool. <br />This is usually necessary only the first time the tool is being used.<br />Navigate user to `actionUrl` |

#### `actionUrl` (optional string)

Only when status is `requires_action`.

Only when action requires the end user to navigate to an URL.

#### `toMessage()`

Converts the result into [a `user` role message](https://cloud.google.com/vertex-ai/generative-ai/docs/multimodal/function-calling) as supported by Google GenAi-compatible APIs.

---

For more information, refer to the [Superface Documentation](https://superface.ai/docs).
