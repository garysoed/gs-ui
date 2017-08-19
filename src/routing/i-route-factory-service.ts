import { AbstractRouteFactory } from '../routing/abstract-route-factory';


export interface IRouteFactoryService<T> {
  /**
   * @return The route factories handled by the app, from the most specific matcher to the least
   *    specific matcher.
   */
  getFactories(): Iterable<AbstractRouteFactory<T, any, any, any>>;
}
