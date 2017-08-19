import { Bus } from 'external/gs_tools/src/event';
import { bind, inject } from 'external/gs_tools/src/inject';
import { Monad } from 'external/gs_tools/src/interfaces';
import { LocationService, LocationServiceEvents } from 'external/gs_tools/src/ui';
import { Log, Reflect } from 'external/gs_tools/src/util';

import { RouteServiceEvents } from '../const';
import { AbstractRouteFactory } from '../routing/abstract-route-factory';
import { IRouteFactoryService } from '../routing/i-route-factory-service';
import { RouteNavigator } from '../routing/route-navigator';

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
   * @param type Type of RouteFactory to return.
   * @return The RouteFactory matching the given type, or null if there are none.
   */
  getRouteFactory(type: T): AbstractRouteFactory<T, any, any, any> | null {
    return this.routeFactoryMap_.get(type) || null;
  }

  monad(): Monad<RouteNavigator<T>> {
    return {
      get: () => {
        return new RouteNavigator(this.routeFactoryService_.getFactories(), null);
      },
      set: (routeNavigator: RouteNavigator<T>) => {
        const destination = routeNavigator.getDestination();
        if (destination) {
          LocationService.goTo(destination.path);
        }
      },
    };
  }

  /**
   * Handles event when the location has changed.
   */
  private onLocationChanged_(): void {
    this.dispatch({type: RouteServiceEvents.CHANGED});
  }
}
