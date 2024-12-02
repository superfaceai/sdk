import { SuperfaceClient } from '.';

describe('SuperfaceClient', () => {
  describe('constructor', () => {
    it('throws when apiKey isnt available', () => {
      expect(() => new SuperfaceClient()).toThrow();
    });
  });
});
