import { FunctionParameters } from 'openai/src/resources/shared.js';
import { Superface } from '.';

/**
 * Superface for OpenAI's beta API.
 */
export class SuperfaceOpenAIBeta {
  private client: Superface;

  constructor(superface: Superface) {
    this.client = superface;
  }

  /**
   * Get tools definitions to be used with convinience wrapper for automatic tool calls handling,
   *
   * Read more in OpenAI's [docs](https://github.com/openai/openai-node#automated-function-calls)
   *
   * @param userId User ID
   *
   * @example
   * const openai = new OpenAI();
   * const superface = new Superface();
   * const runner = openai.beta.chat.completions
   *   .runTools({
   *     model: 'gpt-4o',
   *     messages: [{ role: 'user', content: 'What tools do you have?' }],
   *     tools: await superface.beta.getTools({ userId: 'example_user' }),
   *   })
   *   .on('message', (message) => console.log(message));
   *
   * const finalContent = await runner.finalContent();
   * console.log();
   * console.log('Final content:', finalContent);
   */
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
