import { LocationService } from 'external/gs_tools/src/ui';

import { Route } from '../routing/route';
import { RouteNavigator } from '../routing/route-navigator';

export class FakeRouteNavigator<T> extends RouteNavigator<T> {
  constructor(private readonly matches_: Iterable<[RegExp, Route<T, any>]> = []) {
    super([], null);
  }

  getMatch(): Route<T, any> | null {
    const path = LocationService.getPath();
    for (const [regexp, match] of this.matches_) {
      if (regexp.test(path)) {
        return match;
      }
    }

    return null;
  }
}
