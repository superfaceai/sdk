export type ToolRunAsistantHint = { assistant_hint: string };

export type ToolRunSuccess<TResult> = ToolRunAsistantHint & {
  status: 'success';
  result: TResult;
};

export type ToolRunError = ToolRunAsistantHint & {
  status: 'error';
  error: string;
};

export type ToolRunActionRequired = ToolRunAsistantHint & {
  status: 'requires_action';
  action_type: string;
  action_url: string | null;
};

export type ToolRun<TResult = unknown> =
  | ToolRunSuccess<TResult>
  | ToolRunError
  | ToolRunActionRequired;

export type CreateSessionResponse = {
  status: 'success';
  configuration_url: string;
  assistant_hint: string;
};

export type ToolDefinition = {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type SuperfaceOptions = {
  apiKey?: string;
  applicationReturnLink?: ApplicationReturnLink;
  cacheTimeout?: number; // ms
};

export type ApplicationReturnLink = {
  appName: string;
  appUrl: string;
};

export class SuperfaceError extends Error {
  originalError?: unknown;

  constructor(message: string, error?: unknown) {
    super(message);
    this.name = 'SuperfaceError';
    this.originalError = error;
  }
}

const USER_ID_REGEX = /^[a-zA-Z0-9-_|]{1,100}$/;
export function isUserIdValid(userId: string): boolean {
  return new RegExp(USER_ID_REGEX).test(userId);
}

/**
 * Superface intelligent tools client
 */
export class Superface {
  private hubUrl: string;
  private apiKey: string;
  private returnLink?: ApplicationReturnLink;
  private cacheTimeout: number;
  private toolsCache?: { timestamp: number; body: ToolDefinition[] };

  constructor(opts: SuperfaceOptions = {}) {
    this.hubUrl =
      (process.env.SUPERFACE_URL as string) || 'https://pod.superface.ai';
    this.apiKey = opts.apiKey ?? (process.env.SUPERFACE_API_KEY as string);
    this.returnLink = opts.applicationReturnLink;
    this.cacheTimeout =
      opts.cacheTimeout ??
      parseInt(process.env.SUPERFACE_CACHE_TIMEOUT || '60000', 10);

    if (!this.apiKey) {
      throw new SuperfaceError(`
        The SUPERFACE_API_KEY environment variable is missing or empty; either provide it, or instantiate the SuperfaceClient with an apiKey option, like new SuperfaceClient({ apiKey: 'My API Key' })`);
    }
  }

  /**
   * List installed tool definitions available on the Hub
   *
   * @returns List of tool definitions
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
    try {
      response = await fetch(`${this.hubUrl}/api/hub/fd`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
    } catch (err: unknown) {
      throw new SuperfaceError(`Unable to fetch function descriptors`, err);
    }

    let body: ToolDefinition[];
    try {
      body = await response.json(); // TODO assert
    } catch (err: unknown) {
      throw new SuperfaceError(`Unable to parse function descriptors`, err);
    }

    this.toolsCache = { timestamp: now, body };
    return body;
  }

  /**
   * Tool call
   *
   * @returns Result of the tool call
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
    if (!isUserIdValid(userId)) {
      throw new SuperfaceError(
        `Invalid user ID: ${userId}. Must match ${USER_ID_REGEX}`
      );
    }

    const maxRetries = 3;
    let response: Response;
    let lastErrorResult: ToolRun | undefined;

    const delay = (duration: number) =>
      new Promise((resolve) => setTimeout(resolve, duration));

    for (let attempt = 0; attempt < maxRetries; attempt++) {
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

        response = await fetch(`${this.hubUrl}/api/hub/perform/${name}`, {
          method: 'POST',
          body: JSON.stringify(args),
          headers,
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const body = await response.json();
            return body as ToolRun<TResult>;
          } catch (err) {
            return {
              status: 'error',
              error: 'Failed to parse response from Hub ' + err,
              assistant_hint: 'Please try again.',
            };
          }
        } else {
          lastErrorResult = {
            status: 'error',
            error: `Failed to connect to Hub: Wrong content type ${contentType} received`,
            assistant_hint: 'Please try again.',
          };
        }
      } catch (err) {
        lastErrorResult = {
          status: 'error',
          error: `Failed to connect to Hub (attempt ${attempt + 1}): ${err}`,
          assistant_hint: 'Please try again.',
        };
      }

      const waitTime = Math.pow(4, attempt) * 100; // 100ms, 400ms, 1600ms
      await delay(waitTime);
    }

    return (
      lastErrorResult ?? {
        status: 'error',
        error: 'Failed to connect to Hub. Maximum retries reached.',
        assistant_hint: 'Please try again.',
      }
    );
  }

  /**
   * Get configuration link for the user.
   * User should be redirected to this link to configure tools.
   *
   * @returns URL to the configuration page
   */
  async configurationLink({ userId }: { userId: string }): Promise<string> {
    if (!isUserIdValid(userId)) {
      throw new SuperfaceError(
        `Invalid user ID: ${userId}. Must match ${USER_ID_REGEX}`
      );
    }

    let response: Response;
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

      response = await fetch(`${this.hubUrl}/api/hub/session`, {
        method: 'POST',
        headers,
      });
    } catch (err) {
      throw new SuperfaceError(`Unable to fetch configuration link`, err);
    }

    try {
      const body: CreateSessionResponse = await response.json();
      return body.configuration_url;
    } catch (err) {
      throw new SuperfaceError(`Unable to fetch configuration link`, err);
    }
  }
}

export default Superface;
