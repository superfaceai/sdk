import { ChatCompletionToolRunnerParams } from 'openai/lib/ChatCompletionRunner.mjs';
import { Superface } from '.';

export class SuperfaceOpenAIBeta {
  private client: Superface;

  constructor(superface: Superface) {
    this.client = superface;
  }

  async getTools({
    userId,
  }: {
    userId: string;
  }): Promise<ChatCompletionToolRunnerParams<any>['tools']> {
    const tools = await this.client.getTools();
    const client = this.client;

    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.function.name,
        parameters: tool.function.parameters,
        description: tool.function.description,
        parse: JSON.parse,
        async function(args: any) {
          return await client.runTool({
            userId,
            name: tool.function.name,
            args,
          });
        },
      },
    })) as ChatCompletionToolRunnerParams<any>['tools']; // TODO: Figure out whats wrong with the types
  }
}
