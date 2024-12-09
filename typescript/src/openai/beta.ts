import { FunctionParameters } from 'openai/src/resources/shared.js';
import { Superface } from '.';

export class SuperfaceOpenAIBeta {
  private client: Superface;

  constructor(superface: Superface) {
    this.client = superface;
  }

  async getTools({ userId }: { userId: string }) {
    const tools = await this.client.getTools();
    return tools.map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.function.name,
        parameters: tool.function.parameters as FunctionParameters,
        description: tool.function.description as string,
        parse: JSON.parse,
        function: async (args: any) => {
          const result = await this.client.client.runTool({
            userId,
            name: tool.function.name,
            args,
          });

          return JSON.stringify(result);
        },
      },
    }));
  }
}
