import { isWindow } from './window.util';

describe('Window Utils', () => {
  describe('#isWindow', () => {
    it('when param is window should return true', () => {
      expect(isWindow(window)).toBe(true);
    });
    it('when param is html element should return false', () => {
      expect(isWindow(document.createElement('div'))).toBe(false);
    });
    it('when param is null should return true', () => {
      expect(isWindow(null)).toBe(false);
    });
  });
});
