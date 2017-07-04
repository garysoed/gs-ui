import { Bus } from 'external/gs_tools/src/event';
import { bind, inject } from 'external/gs_tools/src/inject';
import { LocationService, LocationServiceEvents } from 'external/gs_tools/src/ui';
import { Log, Reflect } from 'external/gs_tools/src/util';

import { AbstractRouteFactory } from '../routing/abstract-route-factory';
import { IRouteFactoryService } from '../routing/i-route-factory-service';
import { Route } from '../routing/route';
import { RouteServiceEvents } from '../routing/route-service-events';

type RouteServiceEvent = {type: RouteServiceEvents};

const LOGGER = Log.of('gs-ui.routing.RouteService');

@bind(
    'gs.routing.RouteService',
    [
      LocationService,
    ])
export class RouteService<T> extends Bus<RouteServiceEvents, RouteServiceEvent> {
  private readonly routeFactoryMap_: Map<T, AbstractRouteFactory<T, any, any, any>>;
  private readonly routeFactoryService_: IRouteFactoryService<T>;

  constructor(
      @inject('x.gs_ui.routeFactoryService') routeFactoryService: IRouteFactoryService<T>) {
    super(LOGGER);
    this.routeFactoryService_ = routeFactoryService;
    this.routeFactoryMap_ = new Map();
  }

  /**
   * Called during initialization.
   */
  [Reflect.__initialize](): void {
    this.addDisposable(
        LocationService.on(LocationServiceEvents.CHANGED, this.onLocationChanged_, this));

    for (const factory of this.routeFactoryService_.getFactories()) {
      this.routeFactoryMap_.set(factory.getType(), factory);
    }
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
    return LocationService.getPath();
  }

  /**
   * @return The currently matching route, or null if there are none.
   */
  getRoute(): Route<T, any> | null {
    const path = this.getPath();
    let route: Route<T, any> | null = null;
    for (const factory of this.routeFactoryService_.getFactories()) {
      route = factory.createFromPath(path);
      if (route !== null) {
        break;
      }
    }
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
    LocationService.goTo(path);
  }

  /**
   * Handles event when the location has changed.
   */
  private onLocationChanged_(): void {
    this.dispatch({type: RouteServiceEvents.CHANGED});
  }
}
