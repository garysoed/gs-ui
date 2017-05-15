import { Arrays } from 'external/gs_tools/src/collection';
import { BaseListenableListener } from 'external/gs_tools/src/event';
import { bind, inject } from 'external/gs_tools/src/inject';
import { LocationService, LocationServiceEvents } from 'external/gs_tools/src/ui';
import { Reflect } from 'external/gs_tools/src/util';

import { AbstractRouteFactory } from './abstract-route-factory';
import { IRouteFactoryService } from './i-route-factory-service';
import { Route } from './route';
import { RouteServiceEvents } from './route-service-events';


@bind(
    'gs.routing.RouteService',
    [
      LocationService,
    ])
export class RouteService<T> extends BaseListenableListener<RouteServiceEvents> {
  private readonly locationService_: LocationService;
  private readonly routeFactoryMap_: Map<T, AbstractRouteFactory<T, any, any, any>>;
  private readonly routeFactoryService_: IRouteFactoryService<T>;

  constructor(
      @inject('gs.LocationService') locationService: LocationService,
      @inject('x.gs_ui.routeFactoryService') routeFactoryService: IRouteFactoryService<T>) {
    super();
    this.locationService_ = locationService;
    this.routeFactoryService_ = routeFactoryService;
    this.routeFactoryMap_ = new Map();
  }

  /**
   * Called during initialization.
   */
  [Reflect.__initialize](): void {
    this.listenTo(
        this.locationService_,
        LocationServiceEvents.CHANGED,
        this.onLocationChanged_);

    Arrays
        .of(this.routeFactoryService_.getFactories())
        .forEach((factory: AbstractRouteFactory<T, any, any, any>) => {
          this.routeFactoryMap_.set(factory.getType(), factory);
        });
  }

  /**
   * @param routeFactory Route factory to use to retrieve the params.
   * @return The params for the current path, or null if it does not match the given route factory.
   */
  getParams<CR>(routeFactory: AbstractRouteFactory<T, any, CR, any>): CR | null {
    const route = routeFactory.createFromPath(this.getPath());
    if (route === null) {
      return null;
    }

    return route.getParams();
  }

  /**
   * @return The current path.
   */
  getPath(): string {
    return this.locationService_.getPath();
  }

  /**
   * @return The currently matching route, or null if there are none.
   */
  getRoute(): Route<T, any> | null {
    const path = this.getPath();
    let route: Route<T, any> | null = null;
    Arrays
        .of(this.routeFactoryService_.getFactories())
        .forOf((
            factory: AbstractRouteFactory<T, any, any, any>,
            index: number,
            breakFn: () => void) => {
          route = factory.createFromPath(path);
          if (route !== null) {
            breakFn();
          }
        });
    return route;
  }

  /**
   * @param type Type of RouteFactory to return.
   * @return The RouteFactory matching the given type, or null if there are none.
   */
  getRouteFactory(type: T): AbstractRouteFactory<T, any, any, any> | null {
    return this.routeFactoryMap_.get(type) || null;
  }

  /**
   * Go to the given route object.
   * @param routeFactory Factory to generate the route.
   * @param params Parameters to generate the route.
   */
  goTo<CR>(routeFactory: AbstractRouteFactory<T, any, CR, any>, params: CR): void {
    this.goToPath(routeFactory.create(params).getPath());
  }

  /**
   * Navigate to the given path.
   * @param path The path to navigate to.
   */
  goToPath(path: string): void {
    this.locationService_.goTo(path);
  }

  /**
   * Handles event when the location has changed.
   */
  private onLocationChanged_(): void {
    this.dispatch(RouteServiceEvents.CHANGED);
  }
}
// TODO: Mutable
