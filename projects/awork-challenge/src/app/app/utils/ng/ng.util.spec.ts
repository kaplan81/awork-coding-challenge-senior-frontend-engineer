import { MockedFunction } from 'vitest';
import { memo } from './ng.util';

describe('NG Utils', () => {
  describe('#memo', () => {
    let mockFunction: MockedFunction<(...args: unknown[]) => unknown>;

    beforeEach(() => {
      mockFunction = vitest.fn();
    });

    it('should return the correct value from the memoized function', () => {
      mockFunction.mockReturnValue(42);
      const memoized = memo(mockFunction);
      expect(memoized()).toBe(42);
    });

    it('should call the original function only once for the same set of primitive arguments', () => {
      const memoized = memo(mockFunction);
      memoized(1, 'a');
      memoized(1, 'a');
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('should call the original function again if primitive arguments change', () => {
      const memoized = memo(mockFunction);
      memoized(1);
      memoized(2);
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });

    it('should work correctly for functions with no arguments', () => {
      const memoized = memo(mockFunction);
      memoized();
      memoized();
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('should call the original function once when called multiple times with no arguments', () => {
      mockFunction.mockReturnValue('no_args_result');
      const memoized = memo(mockFunction);
      expect(memoized()).toBe('no_args_result');
      expect(memoized()).toBe('no_args_result');
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('should differentiate between 0 and -0 as arguments due to Object.is', () => {
      const memoized = memo(mockFunction);
      memoized(0);
      memoized(-0);
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });

    it('should treat NaN arguments as the same due to Object.is', () => {
      const memoized = memo(mockFunction);
      memoized(NaN);
      memoized(NaN);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('should call the original function again for different object references even with same content', () => {
      const memoized = memo(mockFunction);
      memoized({ a: 1 });
      memoized({ a: 1 });
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });

    it('should call the original function only once for the same object reference', () => {
      const memoized = memo(mockFunction);
      const obj = { a: 1 };
      memoized(obj);
      memoized(obj);
      expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('should work with multiple arguments of different types', () => {
      const arg1 = 10;
      const arg2 = 'test';
      const arg3 = { data: 'value' };
      const arg4 = true;
      // c is the arg3 object { data: string } passed in the test assertions below
      mockFunction.mockImplementation(
        (a, b, c, d) => `${a}-${b}-${(c as { data: string }).data}-${d}`,
      );
      const memoized = memo(mockFunction);
      const result1 = memoized(arg1, arg2, arg3, arg4);
      expect(result1).toBe('10-test-value-true');
      expect(mockFunction).toHaveBeenCalledTimes(1);
      const result2 = memoized(arg1, arg2, arg3, arg4);
      expect(result2).toBe('10-test-value-true');
      expect(mockFunction).toHaveBeenCalledTimes(1);
      const arg3Changed = { data: 'newValue' };
      const result3 = memoized(arg1, arg2, arg3Changed, arg4);
      expect(result3).toBe('10-test-newValue-true');
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });

    it('should memoize functions that return undefined', () => {
      mockFunction.mockReturnValue(undefined);
      const memoized = memo(mockFunction);
      expect(memoized('arg1')).toBeUndefined();
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(memoized('arg1')).toBeUndefined();
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(memoized('arg2')).toBeUndefined();
      expect(mockFunction).toHaveBeenCalledTimes(2);
    });

    it('should handle initial call correctly (prevArgs initialized to [{}])', () => {
      mockFunction.mockReturnValue('initial_call');
      const memoized = memo(mockFunction);
      expect(memoized('first')).toBe('initial_call');
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledWith('first');
    });
  });
});
