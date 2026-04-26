import {
  areObjectsEqual,
  isBoolean,
  isEmptyObject,
  isNumber,
  isObject,
  isString,
  sortObjectKeys,
} from './ts.util';

const str = '';
const num = 0;
const arr = [
  {
    label: 'Label 1',
    order: 1,
  },
  {
    label: 'Label 2',
    order: 2,
  },
  {
    label: 'Label 3',
    order: 3,
  },
];
const objWithoutKey1 = {
  key2: 2,
  key3: ['value3'],
  key4: {
    value4: 'value4',
  },
};
const obj = {
  ...objWithoutKey1,
  key1: 'value1',
};
const numberObj: Record<number, unknown> = {
  1: 'value1',
  2: 'value2',
  3: 'value3',
};

describe('TS Utils', () => {
  describe('#isObject', () => {
    it('should tell if value is an object or not', () => {
      expect(isObject(str)).toBe(false);
      expect(isObject(num)).toBe(false);
      expect(isObject(arr)).toBe(false);
      expect(isObject(obj)).toBe(true);
    });
  });

  describe('#isString', () => {
    it('should tell if value is a string or not', () => {
      expect(isString(str)).toBe(true);
      expect(isString(num)).toBe(false);
      expect(isString(arr)).toBe(false);
      expect(isString(obj)).toBe(false);
    });
  });

  describe('#isNumber', () => {
    it('should tell if value is a number or not', () => {
      expect(isNumber(str)).toBe(false);
      expect(isNumber(num)).toBe(true);
      expect(isNumber(arr)).toBe(false);
      expect(isNumber(obj)).toBe(false);
    });
  });

  describe('#isBoolean', () => {
    it('should tell if value is a boolean or not', () => {
      expect(isBoolean(str)).toBe(false);
      expect(isBoolean(num)).toBe(false);
      expect(isBoolean(arr)).toBe(false);
      expect(isBoolean(obj)).toBe(false);
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });
  });

  describe('#isEmptyObject', () => {
    it('should tell if value is an empty object or not', () => {
      expect(isEmptyObject(str)).toBe(false);
      expect(isEmptyObject(num)).toBe(false);
      expect(isEmptyObject(arr)).toBe(false);
      expect(isEmptyObject({})).toBe(true);
    });
  });

  describe('#sortObjectKeys', () => {
    it('should sort object string keys and return new object accordingly', () => {
      expect(
        sortObjectKeys({
          key4: 4,
          // eslint-disable-next-line sort-keys
          key2: 2,
          // eslint-disable-next-line sort-keys
          key1: 1,
          key3: 3,
        }),
      ).toStrictEqual({
        key1: 1,
        key2: 2,
        key3: 3,
        key4: 4,
      });
    });
    it('should sort object number keys and return new object accordingly', () => {
      expect(
        sortObjectKeys({
          1: 'value1',
          3: 'value3',
          // eslint-disable-next-line sort-keys
          2: 'value2',
        }),
      ).toStrictEqual(numberObj);
    });
  });

  describe('#areObjectsEqual', () => {
    it('should tell if 2 objet literals are deeply equal', () => {
      expect(() => areObjectsEqual(null, numberObj, false)).toThrow();
      expect(() => areObjectsEqual(undefined, numberObj, false)).toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => areObjectsEqual(numberObj, [] as any)).toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => areObjectsEqual(numberObj, 0 as any)).toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => areObjectsEqual(numberObj, '' as any)).toThrow();
      expect(areObjectsEqual(numberObj, null)).toBe(false);
      expect(areObjectsEqual(undefined, numberObj)).toBe(false);
      expect(areObjectsEqual({ a: 'b', b: 'b' }, { a: 'a', b: 'b' })).toBe(false);
      // eslint-disable-next-line sort-keys
      expect(areObjectsEqual({ b: 'b', a: 'a' }, { a: 'a', b: 'b' })).toBe(true);
      expect(areObjectsEqual(numberObj, numberObj)).toBe(true);
    });
  });
});
