/**
 * @todo provide unit test
 * and include this utility function
 * in a NavigatorService which can return
 * other properties such as userAgent, appVersion, etc.
 *
 * But before that we need to create a WindowService :)
 */
export function isUiTest(): boolean {
  return window.navigator.webdriver;
}
