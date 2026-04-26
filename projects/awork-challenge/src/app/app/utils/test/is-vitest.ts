export function isVitest(): boolean {
  return '__vitest_worker__' in globalThis;
}
