/**
 * Infer properties type of an object.
 *
 * @example
 * ```ts
 * const obj = {
 *   prop1: 1,
 *   prop2: 'foo',
 *   prop3: [2, 3, 'foo'],
 * };
 *
 * // Inferred type: { [key: string]: string | number | (string | number)[] };
 * const newObj: { [key: string]: InferObjProps<typeof obj> } = {
 *   prop1: 4,
 *   prop2: 'bar',
 *   prop3: [5, 6, 'hello'],
 * };
 * ```
 */
export type InferObjProps<T, K extends keyof T = keyof T> = T extends { [P in K]: infer D }
  ? D
  : never;

export type RequiredBy<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

export type Nullable<T> = T | null;

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type CamelizeString<T extends PropertyKey> = T extends string
  ? string extends T
    ? string
    : T extends `${infer F}_${infer R}`
      ? `${F}${Capitalize<CamelizeString<R>>}`
      : T
  : T;

export type Camelize<T> = { [K in keyof T as CamelizeString<K>]: T[K] };

export type RenameProperties<T, R extends Record<keyof R, PropertyKey>> = {
  [K in keyof T as K extends keyof R ? R[K] : K]: T[K];
};
