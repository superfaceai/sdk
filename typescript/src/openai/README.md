[Frameworks](../../../) → **OpenAI** → **TypeScript** | Python (soon)

# <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/openai.png" alt="OpenAI" width="30" height="30" /> Superface SDK for OpenAI

Superface SDK lets you integrate external apps with your OpenAI agent using function calling.

This SDK is optimized to be used with OpenAI SDK or other OpenAI-compatible LLM SDKs.

## Installation

```sh
npm install superface
```

## Usage

Obtain your agent's secret key and connect tools you want your agent to have access to in [Superface dashboard](https://pod.superface.ai/hub/api).

```ts
import Superface from 'superface/openai';

const superface = new Superface({
  apiKey: process.env.SUPERFACE_API_KEY!,
});
```

Load connected tools for agent using [`getTools()` method](#gettools).

```ts
const tools = await superface.getTools();
```

Or use directly in OpenAI chat completion call

```ts
import OpenAI from 'openai';
const openai = new OpenAI();

const messages = [{ role: 'user', content: '...' }];

const chatCompletion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages,
  tools: await superface.getTools(),
});
```

## Handling tool calls

When using [function calling](https://platform.openai.com/docs/guides/function-calling) with raw OpenAI SDK, you need to handle your tools calls manually:

1. Iterate through `tool_calls` as returned from LLM in `assistant` message
2. Pass the tool call object from the LLM into `runTool()` method on Superface SDK
3. Add the tool call response to the original chain of messages

```ts
// ...
const messages = [{ role: 'user', content: '...' } ];

const chatCompletion = await openai.chat.completions.create({ ... });

const toolCalls = chatCompletion.choices[0].message.tool_calls ?? [];

// Handle tool calls
for (const toolCall of toolCalls) {
  const toolRun = await superface.runTool({
    userId: 'example_user_id',
    toolCall,
  });

  const toolMessage = toolRun.toMessage(); // returns message with role='tool'

  messages.push(toolMessage);
}
```

→ Read [`runTool` documentation](#runtool).

### Working with `ToolRunResult`

The `runTool()` method returns `ToolRunResult` that encapsulates the programmatic
result of the tool call.

Most of the time you will want to simply call `.toMessage()` that turns the result into
OpenAI's message with `tool` _role_ and pass that message to the original chain of messages.

→ Read [`ToolRunResult` interface documentation](#toolrunresult-interface).

## Managing user connections

```ts
const link = await superface.linkToUserConnections({
  userId: 'example_user_id',
});
redirect(link.url);
```

→ Read [`linkToUserConnections` documentation](#linktouserconnections).

## Usage with OpenAI's beta tool runner (automated function calls)

The [OpenAI's automated function calls](https://github.com/openai/openai-node?tab=readme-ov-file#automated-function-calls) is supported via `superface.beta.getTools()`. No other configuration is necessary.

```ts
const openai = new OpenAI();
const superface = new Superface();

const runner = openai.beta.chat.completions
  .runTools({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'What tools do you have?' }],
    tools: await superface.beta.getTools({ userId: 'example_user_id' }),
  })
  .on('message', (message) => console.log(message));

const finalContent = await runner.finalContent();
console.log();
console.log('Final content:', finalContent);
```

See full [example](../../examples/openai/beta-automated-function-calls/).

## Examples

- [Simple chat with tool handling](../../examples/openai/handle-tool-calls/)
- [Using OpenAI's beta tool runner](../../examples/openai/beta-automated-function-calls/)

---

# API Reference

### `new Superface()`

Creates a new instance of Superface SDK for OpenAI-compatible SDKs.

```ts
import Superface from 'superface/openai';

const superface = new Superface({
  apiKey: process.env.SUPERFACE_API_KEY!,
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

Returns connected tools to be used in OpenAI-compatible SDKs.

The selection of tools returned by this method is managed in [Superface dashboard](https://pod.superface.ai/hub/api).

The list of tools is cached inside each `Superface` instance for the time specified in the constructor.

```ts
const chatCompletion = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: { role: 'user', content: 'What tools do you have?' },
  tools: await superface.getTools(),
});
```

#### Returns

List of tools to be used in OpenAI-compatible SDKs.

### `runTool()`

Runs a single specific tool call from `assistant` message returned from
OpenAI-compatible API.

For shortcut, see [`handleToolCalls`](#handletoolcalls).

```ts
// ...
const chatCompletion = await openai.chat.completions.create({ ... });

for (const toolCall of chatCompletion.choices[0].message.tool_calls ?? []) {
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
OpenAI-compatible API.

```ts
const chatCompletion = await openai.chat.completions.create({ ... });

const toolRunResults = await superface.handleToolCalls({
  userId: 'example_user_id',
  message: chatCompletion.choices[0].message,
});
```

#### Parameters

| Param     | Description                                                             |
| --------- | ----------------------------------------------------------------------- |
| `userId`  | Your own unique identifier for the end user of the agent                |
| `message` | The original `assistant` message as returned from OpenAI-compatible API |

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

Converts the result into [a `tool` role message](https://platform.openai.com/docs/guides/function-calling#submitting-function-output) as supported by OpenAI-compatible APIs.

---

For more information, refer to the [Superface Documentation](https://superface.ai/docs).
