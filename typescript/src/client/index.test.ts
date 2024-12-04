import Superface, { SuperfaceError } from '.';

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
