import { LocationService } from 'external/gs_tools/src/ui';
import { AbstractRouteFactory } from '../routing/abstract-route-factory';
import { Route } from '../routing/route';

// TODO: DELETE
export class RouteNavigator<T> {
  constructor(
    private readonly routeFactories_: Iterable<AbstractRouteFactory<T, any, any, any>>,
    private readonly destination_: Route<T, any> | null) {
  }

  getDestination(): Route<T, any> | null {
    return this.destination_;
  }

  getMatch(): Route<T, any> | null {
    const path = LocationService.getPath();

    for (const factory of this.routeFactories_) {
      const route = factory.createFromPath(path);
      if (route !== null) {
        return route;
      }
    }

    return null;
  }

  getRoute<CR>(factory: AbstractRouteFactory<T, any, CR, any>): Route<T, CR> | null {
    return factory.createFromPath(LocationService.getPath());
  }

  goTo<CR>(factory: AbstractRouteFactory<T, any, CR, any>, params: CR): RouteNavigator<T> {
    return new RouteNavigator<T>(this.routeFactories_, factory.create(params));
  }
}
