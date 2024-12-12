[SDK](../../../) / [TypeScript](../../) / **OpenAI**

<div style="display: flex; align-items: center;">
  <img src="https://github.com/superfaceai/sdk/raw/main/docs/logos/openai.png" alt="OpenAI" width="100" height="100" />
</div>

# Superface SDK for OpenAI

## Installation

To install the Superface SDK, run the following command:

```sh
npm install superface
```

## Usage

### Importing and Creating an Instance

```ts
// import client
import Superface from 'superface/openai';

// create instance 
const superface = new Superface();
```

### Getting Tool Definitions

```ts
const tools = await superface.getTools();
```

### Calling Chat Completions with tools

```ts
import OpenAI from 'openai';

const openai = new OpenAI();
const chatCompletion = await openai.chat.completions.create({
  model: 'gpt-4o',
  tools: await superface.getTools(),
  messages: [
    { role: 'user', content: '...' },
  ]
});
```

### Handling Tool Calls

```ts
for (const toolCall of chatCompletion.choices[0].message.tool_calls ?? []) {
  const toolRunResult = await superface.runTool({
    userId: 'example_user',
    toolCall,
  });
}
```

See full [example](../../examples/openai/handle-tool-calls/).

### Managing User Connections

```ts
const link = await superface.linkToUserConnections({ userId: 'example_user' });
redirect(link.url);
```

### OpenAI's Beta

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

See full [example](../../examples/openai/beta-automated-function-calls/).

For more information, refer to the [Superface Documentation](https://superface.ai/docs).
