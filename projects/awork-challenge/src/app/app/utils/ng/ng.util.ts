export function memo<T extends (...args: unknown[]) => ReturnType<T> | undefined>(
  fnToMemoize: (...args: unknown[]) => unknown,
): T {
  let prevArgs: unknown[] = [{}];
  let result: ReturnType<T> | undefined;

  return function (...newArgs: unknown[]): ReturnType<T> | undefined {
    if (hasFnToMemoizeDifferentArgs(prevArgs, newArgs)) {
      result = fnToMemoize(...newArgs) as ReturnType<T>;
      prevArgs = newArgs;
    }
    return result;
  } as T;
}

function hasFnToMemoizeDifferentArgs(prev: unknown[], next: unknown[]): boolean {
  if (prev.length !== next.length) {
    return true;
  }
  for (let i = 0; i < prev.length; i++) {
    if (!Object.is(prev[i], next[i])) {
      return true;
    }
  }

  return false;
}
