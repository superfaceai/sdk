import Superface, { isUserIdValid, SuperfaceError } from '.';

describe('SuperfaceClient', () => {
  describe('constructor', () => {
    it('throws when apiKey isnt available', () => {
      expect(() => new Superface()).toThrow();
    });
  });

  describe('getTools', () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve([
            {
              type: 'function',
              function: {
                name: 'stub',
                description: 'description',
                parameters: {},
              },
            },
          ]),
      } as Response);
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('caches server response', async () => {
      const client = new Superface({ apiKey: 'stub' });

      await client.getTools();
      await client.getTools();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('re-fetches after cache timeout', async () => {
      jest.useFakeTimers();
      const client = new Superface({ apiKey: 'stub', cacheTimeout: 50 });

      await client.getTools();
      jest.advanceTimersByTime(100);
      await client.getTools();

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });

    it('throws when user is not authenticated', async () => {
      fetchSpy.mockReset().mockResolvedValue({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            title: 'Unauthorized',
            detail: `Toolhub URL (https://pod.superface.ai) for Function Descriptors is unauthorized`,
          }),
      } as Response);

      const client = new Superface({ apiKey: 'stub', cacheTimeout: 50 });

      expect(client.getTools()).rejects.toThrow(SuperfaceError);
    });
  });

  describe('runTool', () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve([
            {
              type: 'function',
              function: {
                name: 'stub',
                description: 'description',
                parameters: {},
              },
            },
          ]),
      } as Response);
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('throws when user is not authenticated', async () => {
      fetchSpy.mockReset().mockResolvedValue({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            title: 'Unauthorized',
            detail: `Toolhub URL (https://pod.superface.ai) for Function Descriptors is unauthorized`,
          }),
      } as Response);

      const client = new Superface({ apiKey: 'stub' });

      expect(
        client.runTool({ userId: 'example_user', name: 'stub', args: {} })
      ).rejects.toThrow(SuperfaceError);
    });
  });

  describe('linkToUserConnections', () => {
    let fetchSpy: jest.SpyInstance;

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('throws when user is not authenticated', async () => {
      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            title: 'Unauthorized',
            detail: `Toolhub URL (https://pod.superface.ai) for Function Descriptors is unauthorized`,
          }),
      } as Response);

      const client = new Superface({ apiKey: 'stub' });

      expect(
        client.linkToUserConnections({ userId: 'example_user' })
      ).rejects.toThrow(SuperfaceError);
    });
  });
});

describe('SuperfaceClientError', () => {
  it('extends Error', () => {
    expect(new SuperfaceError('message')).toBeInstanceOf(Error);
  });

  it('sets originalError', () => {
    const error = new Error('original error');
    const superfaceError = new SuperfaceError(
      'Error described from superface client perspective',
      error
    );

    expect(superfaceError.originalError).toBe(error);
  });
});

describe('isUserIdValid', () => {
  it('returns true for valid userId', () => {
    expect(isUserIdValid('validUserId')).toBe(true);
    expect(isUserIdValid('user_123456789')).toBe(true);
    expect(isUserIdValid('google-auth|123456789')).toBe(true);
  });

  it('returns false for invalid userId', () => {
    expect(isUserIdValid('invalid user id')).toBe(false);
    expect(isUserIdValid('user@example.com')).toBe(false);
  });
});
