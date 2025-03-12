const MAX_CACHE_TIMEOUT = '60000';
const DEFAULT_MAX_RETRIES = '3';

export type ToolRunAsistantHint = { assistant_hint: string };

export type ToolRunSuccess<TResult> = ToolRunAsistantHint & {
  status: 'success';
  result: TResult;
};

/**
 * Tool run failed
 *
 * The tool run ended with an error.
 */
export type ToolRunError = ToolRunAsistantHint & {
  status: 'error';
  error: string;
};

/**
 * Tool run requires action
 *
 * The response requires an action from the user.
 * For example, the user may need to connect (authenticate) an 3rd party account.
 */
export type ToolRunActionRequired = ToolRunAsistantHint & {
  status: 'requires_action';
  action_type: string;
  action_url: string | null;
};

/**
 * Tool run response
 *
 * Superface responses are either successful, failed, or require action.
 * The response contains an assistant hint that can help LLM understand the result and what to do next.
 *
 */
export type ToolRun<TResult = unknown> =
  | ToolRunSuccess<TResult>
  | ToolRunError
  | ToolRunActionRequired;

/**
 * Response with a link to the user's connections
 */
export type UserConnectionsLink = {
  status: 'success';
  url: string;
  assistant_hint: string;
};

/**
 * Tool definition
 *
 * Currenty only function tools are supported.
 *
 * @param type Type of the tool (currently only 'function' is supported)
 * @param function Function tool definition
 * @param function.name Name of the tool
 * @param function.description Description of the tool
 * @param function.parameters Parameters of the tool. Defined as JSON schema.
 */
export type ToolDefinition = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>; // TODO: JSONSchema type
  };
};

/**
 * @param apiKey API key for the Superface
 * @param applicationReturnLink Optional return link from Connections page to the application
 * @param cacheTimeout Optional cache timeout in milliseconds (default 60000)
 * @param maxRetries Optional maximum number of retries for requests (default 3)
 */
export type SuperfaceOptions = {
  apiKey?: string;
  applicationReturnLink?: ApplicationReturnLink;
  cacheTimeout?: number; // ms
  maxRetries?: number;
};

/**
 * @param appName Name of the application (showed on Connections page)
 * @param appUrl URL of the application where user should be redirected from Connections page
 */
export type ApplicationReturnLink = {
  appName: string;
  appUrl: string;
};

/**
 * Generic error thrown by the Superface client
 *
 * This should make intercepting errors easier.
 * To access the original error, use the `originalError` property.
 */
export class SuperfaceError extends Error {
  originalError?: unknown;

  constructor(message: string, error?: unknown) {
    super(message);
    this.name = 'SuperfaceError';
    this.originalError = error;
  }
}

const USER_ID_REGEX = /^[a-zA-Z0-9-_|]{1,100}$/;

/**
 * @returns Whether the user ID is valid
 */
export function isUserIdValid(userId: string): boolean {
  return new RegExp(USER_ID_REGEX).test(userId);
}

/**
 * @throws {SuperfaceError} If the user ID is invalid
 */
export function assertUserId(userId: string): asserts userId is string {
  if (!isUserIdValid(userId)) {
    throw new SuperfaceError(
      `Invalid user ID: ${userId}. Must match ${USER_ID_REGEX}`
    );
  }
}

/**
 * Superface HTTP Client
 *
 * Low level client for the Superface API.
 * Consider using framework-specific clients.
 *
 * @example
 * import Superface from '@superfaceai/client';
 * const superface = new Superface({ apiKey });
 *
 * // Get and pass the tools to the LLM Call
 * const tools = await superface.getTools();
 *
 * // Once the LLM Call is done, check messages for tool calls and run them
 * const result = await superface.runTool({ userId, name, args });
 */
export class Superface {
  private superfaceUrl: string;
  private apiKey: string;
  private returnLink?: ApplicationReturnLink;
  private cacheTimeout: number;
  private maxRetries: number;
  private toolsCache?: { timestamp: number; body: ToolDefinition[] };

  constructor(opts: SuperfaceOptions = {}) {
    this.superfaceUrl =
      (process.env.SUPERFACE_URL as string) || 'https://pod.superface.ai';
    this.apiKey = opts.apiKey ?? (process.env.SUPERFACE_API_KEY as string);
    this.returnLink = opts.applicationReturnLink;
    this.cacheTimeout =
      opts.cacheTimeout ??
      parseInt(process.env.SUPERFACE_CACHE_TIMEOUT || MAX_CACHE_TIMEOUT, 10);
    this.maxRetries =
      opts.maxRetries ??
      parseInt(process.env.SUPERFACE_MAX_RETRIES || DEFAULT_MAX_RETRIES, 10);

    if (!this.apiKey) {
      throw new SuperfaceError(`
        The SUPERFACE_API_KEY environment variable is missing or empty; either provide it, or instantiate the SuperfaceClient with an apiKey option, like new SuperfaceClient({ apiKey: 'My API Key' })`);
    }
  }

  /**
   * List installed tools
   *
   * Tool definitions of installed tools in the Superface.
   * Contains the name, description, and input parameters of the tool.
   *
   * Result is cached. Use cacheTimeout option on Superface to set the cache timeout or set env variable SUPERFACE_CACHE_TIMEOUT. Default is 60000ms.
   *
   * @throws {SuperfaceError} If the request fails
   */
  async getTools(): Promise<ToolDefinition[]> {
    const now = Date.now();

    if (
      this.toolsCache &&
      now - this.toolsCache.timestamp < this.cacheTimeout
    ) {
      return this.toolsCache.body;
    }

    let response: Response;
    let lastError: SuperfaceError | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        response = await fetch(`${this.superfaceUrl}/api/hub/fd`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        });
      } catch (err: unknown) {
        lastError = new SuperfaceError(`Unable to fetch tool definitions`, err);
        await delay(attempt);
        continue;
      }

      if (!response.ok) {
        if (response.status === 401) {
          const body = (await response.json()) as {
            title: string;
            detail: string;
          };

          throw new SuperfaceError(`${body.title}. ${body.detail}`);
        }

        lastError = new SuperfaceError(
          `Failed to fetch tool definitions. HTTP status ${response.status}`
        );
        await delay(attempt);
        continue;
      }

      let body: ToolDefinition[];
      try {
        body = await response.json();
      } catch (err: unknown) {
        lastError = new SuperfaceError(`Unable to parse tool definitions`, err);
        await delay(attempt);
        continue;
      }

      this.toolsCache = { timestamp: now, body };
      return body;
    }

    throw (
      lastError ??
      new SuperfaceError(
        `Failed to fetch tool definitions. Maximum retries reached.`
      )
    );
  }

  /**
   * Run a tool
   *
   * Runs a tool with the given name and arguments in the Superface.
   * The tool must be installed in the Superface.
   *
   * Request is retried up to 3 times with exponential backoff. Max retries can be set with SUPERFACE_MAX_RETRIES environment variable.
   *
   * @param userId User ID
   * @param name Name of the tool
   * @param args Arguments for the tool
   *
   * @throws {SuperfaceError}
   *
   * @example
   * const toolRun = await superface.runTool({
   *   userId: 'example_user',
   *   name: toolCall.function.name,
   *   args: JSON.parse(toolCall.function.arguments),
   * });
   *
   * switch (toolRun.status) {
   *   case 'success': {
   *     console.log('✅', 'Tool run successful');
   *     console.log(toolRun.result);
   *     break;
   *   }
   *   case 'error': {
   *     console.error('❌', 'Tool run failed');
   *     console.error(toolRun.error);
   *     break;
   *   }
   *   case 'requires_action': {
   *     console.error('❗', 'Tool run requires action');
   *     console.error(toolRun.action_type, ' => ', toolRun.action_url);
   *     break;
   *   }
   * }
   */
  async runTool<
    TArgs extends Record<string, unknown> = Record<string, unknown>,
    TResult = unknown
  >({
    userId,
    name,
    args,
  }: {
    name: string;
    userId: string;
    args: TArgs;
  }): Promise<ToolRun> {
    assertUserId(userId);

    let response: Response;
    let lastErrorResult: ToolRun | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const headers = new Headers({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
          'x-superface-user-id': userId,
        });

        if (this.returnLink?.appName && this.returnLink.appUrl) {
          headers.append('x-superface-app-name', this.returnLink.appName);
          headers.append('x-superface-app-url', this.returnLink.appUrl);
        }

        response = await fetch(`${this.superfaceUrl}/api/hub/perform/${name}`, {
          method: 'POST',
          body: JSON.stringify(args),
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            const body = (await response.json()) as {
              title: string;
              detail: string;
            };

            throw new SuperfaceError(`${body.title}. ${body.detail}`);
          }

          lastErrorResult = {
            status: 'error',
            error: `Failed to connect to Superface. HTTP status ${response.status}`,
            assistant_hint: 'Please try again.',
          };
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const body = await response.json();
            return body as ToolRun<TResult>;
          } catch (err) {
            return {
              status: 'error',
              error: 'Failed to parse response from Superface ' + err,
              assistant_hint: 'Please try again.',
            };
          }
        } else {
          lastErrorResult = {
            status: 'error',
            error: `Failed to connect to Superface Wrong content type ${contentType} received`,
            assistant_hint: 'Please try again.',
          };
        }
      } catch (err) {
        lastErrorResult = {
          status: 'error',
          error: `Failed to connect to Superface (attempt ${
            attempt + 1
          }): ${err}`,
          assistant_hint: 'Please try again.',
        };
      }

      await delay(attempt);
    }

    return (
      lastErrorResult ?? {
        status: 'error',
        error: 'Failed to connect to Superface. Maximum retries reached.',
        assistant_hint: 'Please try again.',
      }
    );
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
  async linkToUserConnections({
    userId,
  }: {
    userId: string;
  }): Promise<UserConnectionsLink> {
    assertUserId(userId);

    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
      'x-superface-user-id': userId,
    });

    if (this.returnLink?.appName && this.returnLink.appUrl) {
      headers.append('x-superface-app-name', this.returnLink.appName);
      headers.append('x-superface-app-url', this.returnLink.appUrl);
    }

    let lastError: SuperfaceError | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.superfaceUrl}/api/hub/session`, {
          method: 'POST',
          headers,
        });

        if (!response.ok) {
          if (response.status === 401) {
            const body = (await response.json()) as {
              title: string;
              detail: string;
            };

            throw new SuperfaceError(`${body.title}. ${body.detail}`);
          }

          lastError = new SuperfaceError(
            `Failed to fetch configuration link. HTTP status ${response.status}`
          );
          await delay(attempt);
          continue;
        }

        const body = (await response.json()) as {
          status: 'success';
          configuration_url: string;
          assistant_hint: string;
        };

        return {
          status: body.status,
          url: body.configuration_url,
          assistant_hint: body.assistant_hint,
        };
      } catch (err) {
        lastError = new SuperfaceError(
          `Unable to fetch configuration link.`,
          err
        );
        await delay(attempt);
      }
    }

    throw (
      lastError ??
      new SuperfaceError(
        `Failed to fetch configuration link. Maximum retries reached.`
      )
    );
  }

  /**
   * Check if a tool is connected for a user
   * @param userId User ID to check
   * @param toolName Name of the tool to check
   * @returns Object containing provider ID and connection status
   */
  async isToolConnected({
    userId,
    toolName,
  }: {
    userId: string;
    toolName: string;
  }): Promise<{
    providerId: string;
    connected: boolean;
  }> {
    assertUserId(userId);

    let response: Response;
    let lastError: SuperfaceError | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        response = await fetch(`${this.superfaceUrl}/api/hub/tools/${toolName}`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'x-superface-user-id': userId,
          },
        });

        if (!response.ok) {
          if ([400, 401, 404, 422].includes(response.status)) {
            const body = (await response.json()) as {
              title: string;
              detail: string;
            };

            throw new SuperfaceError(`${body.title}. ${body.detail}`);
          }

          lastError = new SuperfaceError(
            `Failed to check tool connection. HTTP status ${response.status}`
          );
          await delay(attempt);
          continue;
        }

        const body = await response.json();
        return {
          providerId: body.providerId,
          connected: body.connected ?? false
        };

      } catch (err) {
        lastError = new SuperfaceError(
          `Unable to check tool connection state`,
          err
        );
        await delay(attempt);
      }
    }

    throw (
      lastError ??
      new SuperfaceError(
        `Failed to check tool connection. Maximum retries reached.`
      )
    );
  }
}

export default Superface;

/**
 * Exponential backoff delay
 */
function delay(attempt: number) {
  const waitTime = Math.pow(4, attempt) * 100; // 100ms, 400ms, 1600ms
  return new Promise((resolve) => setTimeout(resolve, waitTime));
}
