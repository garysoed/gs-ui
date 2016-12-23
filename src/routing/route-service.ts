import {Arrays, Maps} from 'external/gs_tools/src/collection';
import {BaseListenable} from 'external/gs_tools/src/event';
import {bind, inject} from 'external/gs_tools/src/inject';
import {LocationService, LocationServiceEvents} from 'external/gs_tools/src/ui';
import {Reflect} from 'external/gs_tools/src/util';

import {AbstractRouteFactory} from './abstract-route-factory';
import {Route} from './route';
import {RouteServiceEvents} from './route-service-events';


@bind(
    'gs.routing.RouteService',
    [
      LocationService,
    ])
export class RouteService<T> extends BaseListenable<RouteServiceEvents> {
  private readonly locationService_: LocationService;
  private readonly routeFactories_: AbstractRouteFactory<T, any, any>[];
  private readonly routeFactoryMap_: Map<T, AbstractRouteFactory<T, any, any>>;

  constructor(
      @inject('gs.LocationService') locationService: LocationService,
      @inject('x.gs_ui.routeFactories') routeFactories: AbstractRouteFactory<T, any, any>[]) {
    super();
    this.locationService_ = locationService;
    this.routeFactories_ = routeFactories;
    this.routeFactoryMap_ = new Map();
  }

  /**
   * Handles event when the location has changed.
   */
  private onLocationChanged_(): void {
    this.dispatch(RouteServiceEvents.CHANGED);
  }

  /**
   * Called during initialization.
   */
  [Reflect.__initialize](): void {
    this.addDisposable(this.locationService_.on(
        LocationServiceEvents.CHANGED,
        this.onLocationChanged_,
        this));

    Arrays
        .of(this.routeFactories_)
        .forEach((factory: AbstractRouteFactory<T, any, any>) => {
          this.routeFactoryMap_.set(factory.getType(), factory);
        });
  }

  /**
   * @return The currently matching route, or null if there are none.
   */
  getRoute(): Route<T, any> | null {
    let path = this.locationService_.getPath();
    let route: Route<T, any> | null = null;
    Arrays
        .of(this.routeFactories_)
        .forOf((factory: AbstractRouteFactory<T, any, any>, index: number, breakFn: () => void) => {
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
  getRouteFactory(type: T): AbstractRouteFactory<T, any, any> | null {
    return this.routeFactoryMap_.get(type) || null;
  }

  /**
   * Go to the given route object.
   * @param route The route to go to.
   */
  goTo(route: Route<T, any>): void {
    this.locationService_.goTo(route.getPath());
  }
}
