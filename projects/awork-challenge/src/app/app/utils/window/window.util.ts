export function isWindow(element: typeof globalThis | Window | HTMLElement | null): boolean {
  return (
    element !== null &&
    typeof window !== 'undefined' &&
    Object.prototype.hasOwnProperty.call(element, 'self')
  );
}
