/**
 * To be introduced into Angular CDK's
 * BreakpointObserver.observe() method
 * as an array of media queries as strings.
 *
 * Our abstraction is encapsultated in the BreakpointStateService.
 *
 * https://material.angular.io/cdk/layout/overview
 *
 * https://getbootstrap.com/docs/5.0/layout/breakpoints/
 */
export enum BootstrapBreakpointMediaQuery {
  xs = '(max-width: 575.98px)',
  sm = '(min-width: 576px) and (max-width: 767.98px)',
  md = '(min-width: 768px) and (max-width: 991.98px)',
  lg = '(min-width: 992px) and (max-width: 1199.98px)',
  xl = '(min-width: 1200px) and (max-width: 1399.98px)',
  xxl = '(min-width: 1400px)',
}
