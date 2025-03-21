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

  describe('isToolConnected', () => {
    let fetchSpy: jest.SpyInstance;

    beforeEach(() => {
      fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            provider: 'test-provider',
            connected: true
          }),
      } as Response);
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    it('returns connection status for a tool', async () => {
      const client = new Superface({ apiKey: 'stub' });
      
      const result = await client.isToolConnected({ 
        userId: 'example_user', 
        toolName: 'test-tool' 
      });
      
      expect(result).toEqual({
        provider: 'test-provider',
        connected: true
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://pod.superface.ai/api/hub/tools/test-tool',
        {
          headers: {
            'Authorization': 'Bearer stub',
            'x-superface-user-id': 'example_user'
          }
        }
      );
    });

    it('handles disconnected tools correctly', async () => {
      fetchSpy.mockReset().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            provider: 'test-provider',
            connected: false
          }),
      } as Response);

      const client = new Superface({ apiKey: 'stub' });
      
      const result = await client.isToolConnected({ 
        userId: 'example_user', 
        toolName: 'test-tool' 
      });
      
      expect(result).toEqual({
        provider: 'test-provider',  
        connected: false
      });
    });

    it('defaults connected to false if not provided', async () => {
      fetchSpy.mockReset().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            provider: 'test-provider'
            // connected is not provided
          }),
      } as Response);

      const client = new Superface({ apiKey: 'stub' });
      
      const result = await client.isToolConnected({ 
        userId: 'example_user', 
        toolName: 'test-tool' 
      });
      
      expect(result).toEqual({
        provider: 'test-provider',
        connected: false
      });
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
        client.isToolConnected({ userId: 'example_user', toolName: 'test-tool' })
      ).rejects.toThrow(SuperfaceError);
    });

    it('throws when tool is not found', async () => {
      fetchSpy.mockReset().mockResolvedValue({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            title: 'Not Found',
            detail: 'Tool not found',
          }),
      } as Response);

      const client = new Superface({ apiKey: 'stub' });

      expect(
        client.isToolConnected({ userId: 'example_user', toolName: 'nonexistent-tool' })
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
