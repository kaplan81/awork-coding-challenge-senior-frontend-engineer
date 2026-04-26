import { InferObjProps } from '../../models/ts.model';

export function isObject(val: unknown): boolean {
  return Object.prototype.toString.call(val) === '[object Object]';
}

export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number';
}

export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean';
}

export function isEmptyObject(val: unknown): boolean {
  return isObject(val) && Object.keys(val as object).length === 0;
}

export function sortObjectKeys(
  obj: Record<string | number, unknown>,
): Record<string | number, unknown> {
  return Object.keys(obj)
    .sort()
    .reduce((acc: Record<string | number, unknown>, key: string | number) => {
      const value: unknown = obj[key];
      if (isObject(value)) {
        acc[key] = sortObjectKeys(value as Record<string | number, unknown>);
      } else if (Array.isArray(value)) {
        acc[key] = value.sort();
      } else {
        acc[key] = value;
      }
      return acc;
    }, {});
}

export function areObjectsEqual<T = Record<string | number, unknown>>(
  obj1: T | null | undefined,
  obj2: T | null | undefined,
  nullishAccepted: boolean = true,
): boolean {
  if (!nullishAccepted && (!isObject(obj1) || !isObject(obj2))) {
    throw Error('Params must be an object');
  }
  if (nullishAccepted) {
    if ((!isObject(obj1) && obj1 != null) || (!isObject(obj2) && obj2 != null)) {
      throw Error('Params must be an object, null or undefined.');
    }
    if (obj1 == null || obj2 == null) {
      return false;
    }
  }
  const firstObj: T = sortObjectKeys(obj1 as Record<string | number, unknown>) as T;
  const secondObj: T = sortObjectKeys(obj2 as Record<string | number, unknown>) as T;
  return JSON.stringify(firstObj) === JSON.stringify(secondObj);
}

/**
 * ENUMS
 */
/**
 * Returns keys of the enum.
 * This is useful when the enum is numeric.
 *
 * @example
 * ```ts
 * enum FlattenEnum {
 *   type,
 *   sort,
 *   page,
 * }
 *
 * getEnumKeys(FlattenEnum); // ['type', 'sort', 'page']
 * ```
 *
 * But it can also get you the keys of a string enum.
 */
// @ts-ignore-error
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getEnumKeys<T extends string = string>(dict): T[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const allValues: string[] = Object.keys(dict);
  return (allValues[0] === '0' ? allValues.slice(allValues.length / 2) : allValues) as T[];
}

/**
 * Returns values of the enum.
 *
 * @example
 * ```ts
 * export enum FooBar {
 *   Foo = 'foo',
 *   Bar = 'bar',
 * }
 *
 * export enum FlattenFooBar {
 *   Foo,
 *   Bar,
 * }
 *
 * getEnumValues(FooBar); // ['foo', 'bar']
 * getEnumValues(FlattenFooBar); // [0, 1]
 * ```
 */
export function getEnumValues<T extends Record<string, unknown>>(dict: T): InferObjProps<T>[] {
  const isStringEnum: boolean = Object.keys(dict).every(
    (key: string) => typeof dict[key] === 'string',
  );
  if (isStringEnum) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.values(dict) as InferObjProps<T>[];
  }
  const allValues: unknown[] = Object.values(dict);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return allValues.slice(allValues.length / 2) as InferObjProps<T>[];
}
