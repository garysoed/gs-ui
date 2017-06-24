/**
 * @webcomponent gs-breadcrumb
 * Displays breadcrumb for the current path.
 *
 * This component works closely with the gs-ui.routing.RouteService to come up with the segments
 * for the current path, as well as the name and link for each segment.
 */
import { MonadSetter, on } from 'external/gs_tools/src/event';
import { ImmutableList, ImmutableMap, ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { customElement, domOut, onLifecycle } from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common/base-themed-element2';
import { RouteService } from '../routing/route-service';
import { RouteServiceEvents } from '../routing/route-service-events';
import { ThemeService } from '../theming/theme-service';

export const __FULL_PATH = Symbol('fullPath');

export type CrumbData = {name: string, url: string};

const CONTAINER_EL = '#container';
export const CRUMB_CHILDREN_CONFIG = {
  bridge: {
    create(document: Document): Element {
      const rootCrumb = document.createElement('div');
      rootCrumb.classList.add('crumb');
      rootCrumb.setAttribute('layout', 'row');
      rootCrumb.setAttribute('flex-align', 'center');

      const link = document.createElement('a');
      const arrow = document.createElement('gs-icon');
      arrow.textContent = 'keyboard_arrow_right';
      rootCrumb.appendChild(link);
      rootCrumb.appendChild(arrow);
      return rootCrumb;
    },

    get(element: Element): CrumbData | null {
      const linkEl = element.querySelector('a');
      if (linkEl === null) {
        return null;
      }

      const href = linkEl.href;
      if (!href.startsWith('#')) {
        return null;
      }

      const name = linkEl.textContent;
      if (name === null) {
        return null;
      }

      return {
        name,
        url: href.substr(1),
      };
    },

    set(data: CrumbData, element: Element): void {
      const linkEl = element.querySelector('a');
      if (linkEl === null) {
        throw new Error('Link element not found');
      }
      linkEl.href = `#${data.url}`;
      linkEl.textContent = data.name;
    },
  },

  selector: CONTAINER_EL,
};

@customElement({
  dependencies: ImmutableSet.of([
    RouteService,
  ]),
  tag: 'gs-breadcrumb',
  templateKey: 'src/routing/breadcrumb',
})
export class Breadcrumb<T> extends BaseThemedElement2 {
  private readonly routeService_: RouteService<T>;

  /**
   * @param routeService
   * @param themeService
   */
  constructor(
      @inject('gs.routing.RouteService') routeService: RouteService<T>,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.routeService_ = routeService;
  }

  /**
   * @override
   */
  @onLifecycle('insert')
  onInserted(
      @domOut.childElements(CRUMB_CHILDREN_CONFIG)
          monadSetter: MonadSetter<ImmutableList<CrumbData>>): Promise<ImmutableMap<string, any>> {
    return this.onRouteChanged_(monadSetter);
  }

  /**
   * Handles event when the route is changed.
   */
  @on((instance: Breadcrumb<any>) => instance.routeService_, RouteServiceEvents.CHANGED)
  async onRouteChanged_(
      @domOut.childElements(CRUMB_CHILDREN_CONFIG)
          {id: crumbId}: MonadSetter<ImmutableList<CrumbData>>):
      Promise<ImmutableMap<string, any>> {
    const route = this.routeService_.getRoute();
    if (route === null) {
      return Promise.resolve(ImmutableMap.of<string, any>([]));
    }

    const params = route.getParams();
    const routeFactory = this.routeService_.getRouteFactory(route.getType());

    if (!routeFactory) {
      return Promise.resolve(ImmutableMap.of<string, any>([]));
    }

    const names = routeFactory.getCascadeNames(params);
    const paths = routeFactory.getCascadePaths(params);

    const promises = ImmutableList
        .of(names)
        .map((promise: Promise<string>, index: number) => {
          return Promise.all([promise, paths[index]]);
        })
        .toArray();
    const data = await Promise.all(promises);
    const crumbData = ImmutableList
        .of(data)
        .map(([name, url]: [string, string]) => {
          return {
            name: name,
            url: url,
          };
        });
    return ImmutableMap.of([[crumbId, crumbData]]);
  }
}
