/**
 * HTTP request methods as defined in Mozilla documentation
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods
 */
export const enum HttpMethod {
  connect,
  delete,
  get,
  head,
  options,
  patch,
  post,
  put,
  trace,
}

export type HttpMethodET = Uppercase<keyof typeof HttpMethod>;
