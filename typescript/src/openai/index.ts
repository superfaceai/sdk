import {
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from 'openai/resources/index.mjs';
import SuperfaceClient, {
  isUserIdValid,
  SuperfaceError,
  SuperfaceOptions,
  ToolRun,
  ToolRunActionRequired,
} from '../client';
import { SuperfaceOpenAIBeta } from './beta';
import {
  ChatCompletionMessage,
  ChatCompletionMessageToolCall,
} from 'openai/src/resources/index.js';

export { SuperfaceError, SuperfaceOptions, isUserIdValid } from '../client';

/**
 * Result of a tool run.
 *
 * Allows to interact with original response or format result to a message.
 */
export class ToolRunResult<T = unknown> {
  constructor(
    private toolCall: ChatCompletionMessageToolCall,
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

  toMessage(): ChatCompletionToolMessageParam {
    return {
      role: 'tool',
      tool_call_id: this.toolCall.id,
      content: this.toString(),
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
  public beta: SuperfaceOpenAIBeta;

  constructor(opts: SuperfaceOptions | { client: SuperfaceClient } = {}) {
    this.client = 'client' in opts ? opts.client : new SuperfaceClient(opts);
    this.beta = new SuperfaceOpenAIBeta(this);
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
  async getTools(): Promise<ChatCompletionTool[]> {
    return await this.client.getTools();
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
    message: ChatCompletionMessage;
  }): Promise<ToolRunResult[]> {
    if (!message.tool_calls) {
      return [];
    }

    if (!isUserIdValid(userId)) {
      throw new SuperfaceError('Invalid user ID');
    }

    return await Promise.all(
      message.tool_calls.map((toolCall) =>
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
    toolCall: ChatCompletionMessageToolCall;
  }): Promise<ToolRunResult<T>> {
    const result = await this.client.runTool<Record<string, unknown>, T>({
      userId,
      name: toolCall.function.name,
      args: JSON.parse(toolCall.function.arguments),
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
  }): Promise<boolean> {
    return (await this.client.isToolConnected({ userId, toolName })).connected;
  }
}

export default Superface;
