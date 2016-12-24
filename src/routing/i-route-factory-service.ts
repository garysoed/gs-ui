import {AbstractRouteFactory} from './abstract-route-factory';


export interface IRouteFactoryService<T> {
  /**
   * @return The route factories handled by the app, from the most specific matcher to the least
   *    specific matcher.
   */
  getFactories(): AbstractRouteFactory<T, any, any>[];
}
