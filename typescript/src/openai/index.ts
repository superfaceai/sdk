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

export class Superface {
  public client: SuperfaceClient;
  public beta: SuperfaceOpenAIBeta;

  constructor(opts: SuperfaceOptions & { client?: SuperfaceClient } = {}) {
    this.client = new SuperfaceClient(opts);
    this.beta = new SuperfaceOpenAIBeta(this);
  }

  async getTools(): Promise<ChatCompletionTool[]> {
    return await this.client.getTools();
  }

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

  async configurationLink(
    ...args: Parameters<SuperfaceClient['configurationLink']>
  ): ReturnType<SuperfaceClient['configurationLink']> {
    return await this.client.configurationLink(...args);
  }
}

export default Superface;
