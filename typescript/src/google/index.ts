
import { GenerateContentResponse, FunctionCall, FunctionResponse, ToolListUnion } from '@google/genai';
import SuperfaceClient, {
  isUserIdValid,
  SuperfaceError,
  SuperfaceOptions,
  ToolRun,
  ToolRunActionRequired,
} from '../client';
import { convertToGenaiTools } from './tools';


export { SuperfaceError, SuperfaceOptions, isUserIdValid } from '../client';

/**
 * Result of a tool run.
 *
 * Allows to interact with original response or format result to a message.
 */
export class ToolRunResult<T = unknown> {
  constructor(
    private toolCall: FunctionCall,
    private toolRun: ToolRun<T>
  ) {}

  get status(): ToolRun['status'] {
    return this.toolRun.status;
  }

  get result(): T | undefined {
    if (this.toolRun.status === 'success') {
      return this.toolRun.result;
    }
  }

  get error(): string | undefined {
    if (this.toolRun.status === 'error') {
      return this.toolRun.error;
    }
  }

  get actionType(): ToolRunActionRequired['action_type'] | undefined {
    if (this.toolRun.status === 'requires_action') {
      return this.toolRun.action_type;
    }
  }

  get actionUrl(): ToolRunActionRequired['action_url'] | undefined {
    if (this.toolRun.status === 'requires_action') {
      return this.toolRun.action_url;
    }
  }

  get assistantHint(): ToolRun['assistant_hint'] {
    return this.toolRun.assistant_hint;
  }

  toString(): string {
    return JSON.stringify(this.toolRun);
  }

  toMessage(): FunctionResponse {
    return {
      id: this.toolCall.id,
      name: this.toolCall.name,
      response: this.toolRun,
    };
  }
}

/**
 * Superface for OpenAI's API.
 *
 * To be used with [OpenAI TypeScript and JavaScript API Library](https://github.com/openai/openai-node).
 *
 * @example
 * const superface = new Superface();
 *
 * const chatCompletion = await openai.chat.completions.create({
 *   model: 'gpt-4o',
 *   tools: await superface.getTools(),
 *   messages,
 * });
 *
 * const toolRunResults = await superface.handleToolCalls({
 *   userId: 'example_user',
 *   message: chatCompletion.choices[0].message,
 * });
 */
export class Superface {
  public client: SuperfaceClient;

  constructor(opts: SuperfaceOptions | { client: SuperfaceClient } = {}) {
    this.client = 'client' in opts ? opts.client : new SuperfaceClient(opts);
  }

  /**
   * Get tools definitions
   *
   * Then pass the tools to the OpenAI API.
   *
   * @example
   * const chatCompletion = await openai.chat.completions.create({
   *   model: 'gpt-4o',
   *   tools: await superface.getTools(),
   *   messages,
   * });
   */
  async getTools(): Promise<ToolListUnion> {

    const tools = await this.client.getTools();

    return convertToGenaiTools(tools);
  }

  /**
   * Handle all tool calls in a chat completion message.
   *
   * @example
   * const toolRunResults = await superface.handleToolCalls({
   *  userId: 'example_user',
   *  message: chatCompletion.choices[0].message,
   * });
   * const toolMessages = toolRunResults.map((result) => result.toMessage());
   */
  async handleToolCalls<T = unknown>({
    userId,
    message,
  }: {
    userId: string;
    message: GenerateContentResponse;
  }): Promise<ToolRunResult[]> {
    if (!message.functionCalls) {
      return [];
    }

    if (!isUserIdValid(userId)) {
      throw new SuperfaceError('Invalid user ID');
    }

    return await Promise.all(
      message.functionCalls.map((toolCall) =>
        this.runTool<T>({ userId, toolCall })
      )
    );
  }

  /**
   * Run tool call.
   *
   * Take tool call and run it.
   * To handle all tool calls in a chat completion message, use `handleToolCalls`.
   *
   * @example
   * const toolRunResult = superface.runTool({
   *   userId: 'example_user',
   *   toolCall: chatCompletion.choices[0].message.tool_calls[0],
   * });
   */
  async runTool<T = unknown>({
    userId,
    toolCall,
  }: {
    userId: string;
    toolCall: FunctionCall;
  }): Promise<ToolRunResult<T>> {

    if (!toolCall.name) {
      throw new SuperfaceError('Tool call name is required');
    }

    const result = await this.client.runTool<Record<string, unknown>, T>({
      userId,
      name: toolCall.name,
      args: toolCall.args || {}
    });

    return new ToolRunResult<T>(toolCall, result as ToolRun<T>);
  }

  /**
   * Get link to users connections
   *
   * Fetches a configuration link for the user to manage connections in the Superface.
   *
   * @throws {SuperfaceError}
   *
   * @example
   * const link = await superface.linkToUserConnections({ userId: 'example_user' });
   * redirect(link.url);
   */
  async linkToUserConnections(
    ...args: Parameters<SuperfaceClient['linkToUserConnections']>
  ): ReturnType<SuperfaceClient['linkToUserConnections']> {
    return await this.client.linkToUserConnections(...args);
  }

  /**
   * Check if a tool is connected for a user
   *
   * @example
   * const isConnected = await superface.isToolConnected({ userId: 'example_user', toolName: 'hubspot__create-association__CreateAssociation' });
   */
  async isToolConnected({
    userId,
    toolName,
  }: {
    userId: string;
    toolName: string;
  }): Promise<{
    provider: string;
    connected: boolean;
  }> {
    return this.client.isToolConnected({ userId, toolName });
  }
}

export default Superface;
