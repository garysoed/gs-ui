import { Arrays } from 'external/gs_tools/src/collection';
import { inject } from 'external/gs_tools/src/inject';
import { bind, ChildElementDataHelper, customElement, DomHook } from 'external/gs_tools/src/webc';

import { BaseThemedElement } from '../common/base-themed-element';
import { ThemeService } from '../theming/theme-service';
import { RouteService } from './route-service';

import { RouteServiceEvents } from './route-service-events';


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
    linkEl.href = `#${data.url}`;
    linkEl.textContent = data.name;
  },
};

@customElement({
  dependencies: [
    RouteService,
  ],
  tag: 'gs-breadcrumb',
  templateKey: 'src/routing/breadcrumb',
})
export class Breadcrumb<T> extends BaseThemedElement {
  @bind('#container').childrenElements<CrumbData>(CRUMB_DATA_HELPER)
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

    const promises = Arrays
        .of(names)
        .zip(paths)
        .mapElement((pair: [Promise<string>, string]) => {
          return Promise.all(pair);
        })
        .asArray();
    const data = await Promise.all(promises);
    const crumbData = Arrays
        .of(data)
        .map(([name, url]: [string, string]) => {
          return {
            name: name,
            url: url,
          };
        })
        .asArray();
    this.crumbHook_.set(crumbData);
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.addDisposable(this.routeService_.on(
        RouteServiceEvents.CHANGED,
        this.onRouteChanged_,
        this));
  }

  /**
   * @override
   */
  onInserted(element: HTMLElement): void {
    super.onInserted(element);
    this.onRouteChanged_();
  }
}
