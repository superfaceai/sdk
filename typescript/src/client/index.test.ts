import { SuperfaceClient, SuperfaceClientError } from '.';

describe('SuperfaceClient', () => {
  describe('constructor', () => {
    it('throws when apiKey isnt available', () => {
      expect(() => new SuperfaceClient()).toThrow();
    });
  });
});

describe('SuperfaceClientError', () => {
  it('extends Error', () => {
    expect(new SuperfaceClientError('message')).toBeInstanceOf(Error);
  });

  it('sets originalError', () => {
    const error = new Error('original error');
    const superfaceError = new SuperfaceClientError(
      'Error described from superface client perspective',
      error
    );

    expect(superfaceError.originalError).toBe(error);
  });
});
