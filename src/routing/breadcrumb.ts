import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { ChildElementDataHelper, customElement, DomHook, hook } from 'external/gs_tools/src/webc';

import { BaseThemedElement } from '../common/base-themed-element';
import { RouteService } from '../routing/route-service';
import { RouteServiceEvents } from '../routing/route-service-events';
import { ThemeService } from '../theming/theme-service';


export const __FULL_PATH = Symbol('fullPath');

type CrumbData = {name: string, url: string};


export const CRUMB_DATA_HELPER: ChildElementDataHelper<CrumbData> = {
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
};

@customElement({
  dependencies: ImmutableSet.of([
    RouteService,
  ]),
  tag: 'gs-breadcrumb',
  templateKey: 'src/routing/breadcrumb',
})
export class Breadcrumb<T> extends BaseThemedElement {
  @hook('#container').childrenElements<CrumbData>(CRUMB_DATA_HELPER)
  private readonly crumbHook_: DomHook<CrumbData[]>;

  private readonly routeService_: RouteService<T>;

  /**
   * @param routeService
   * @param themeService
   */
  constructor(
      @inject('gs.routing.RouteService') routeService: RouteService<T>,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.crumbHook_ = DomHook.of<CrumbData[]>();
    this.routeService_ = routeService;
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.listenTo(
        this.routeService_,
        RouteServiceEvents.CHANGED,
        this.onRouteChanged_);
  }

  /**
   * @override
   */
  onInserted(element: HTMLElement): void {
    super.onInserted(element);
    this.onRouteChanged_();
  }

  /**
   * Handles event when the route is changed.
   */
  private async onRouteChanged_(): Promise<void> {
    const route = this.routeService_.getRoute();
    if (route === null) {
      return Promise.resolve();
    }

    const params = route.getParams();
    const routeFactory = this.routeService_.getRouteFactory(route.getType());

    if (!routeFactory) {
      return Promise.resolve();
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
        })
        .toArray();
    this.crumbHook_.set(crumbData);
  }
}
// TODO: Mutable
