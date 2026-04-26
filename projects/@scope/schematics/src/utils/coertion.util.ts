/**
 * Coerces a value to a boolean
 */
export function coerceBooleanProperty(value: unknown): boolean {
  return value != null && `${value}` !== 'false' && `${value}` !== '0';
}
