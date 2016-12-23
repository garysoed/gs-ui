import {Arrays} from 'external/gs_tools/src/collection';
import {bind, customElement, DomBridge} from 'external/gs_tools/src/webc';
import {inject} from 'external/gs_tools/src/inject';

import {BaseThemedElement} from '../common/base-themed-element';
import {RouteService} from './route-service';
import {RouteServiceEvents} from './route-service-events';
import {ThemeService} from '../theming/theme-service';

export const __FULL_PATH = Symbol('fullPath');


type CrumbData = {name: string, url: string};


/**
 * Creates an element that represents a crumb.
 * @param document The owner document.
 * @return Element representing a crumb.
 */
export function crumbGenerator(document: Document): Element {
  let rootCrumb = document.createElement('div');
  rootCrumb.classList.add('crumb');
  rootCrumb.setAttribute('layout', 'row');
  rootCrumb.setAttribute('flex-align', 'center');

  let link = document.createElement('a');
  let arrow = document.createElement('gs-icon');
  arrow.textContent = 'keyboard_arrow_right';
  rootCrumb.appendChild(link);
  rootCrumb.appendChild(arrow);
  return rootCrumb;
}

/**
 * Sets the data to the crumb element.
 * @param data Data to set.
 * @param element The crumb element.
 */
export function crumbDataSetter(data: CrumbData, element: Element): void {
  let linkEl = element.querySelector('a');
  linkEl.href = `#${data.url}`;
  linkEl.textContent = data.name;
}

@customElement({
  dependencies: [
    RouteService,
  ],
  tag: 'gs-breadcrumb',
  templateKey: 'src/routing/breadcrumb',
})
export class Breadcrumb<T> extends BaseThemedElement {
  @bind('#container').childrenElements<CrumbData>(crumbGenerator, crumbDataSetter)
  private readonly crumbBridge_: DomBridge<CrumbData[]>;

  private readonly routeService_: RouteService<T>;

  /**
   * @param routeService
   * @param themeService
   */
  constructor(
      @inject('gs.routing.RouteService') routeService: RouteService<T>,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.crumbBridge_ = DomBridge.of<CrumbData[]>();
    this.routeService_ = routeService;
  }

  /**
   * Handles event when the route is changed.
   */
  private onRouteChanged_(): Promise<void> {
    let route = this.routeService_.getRoute();
    if (route === null) {
      return Promise.resolve();
    }

    let params = route.getParams();
    let routeFactory = this.routeService_.getRouteFactory(route.getType());

    if (!routeFactory) {
      return Promise.resolve();
    }

    let names = routeFactory.getCascadeNames(params);
    let paths = routeFactory.getCascadePaths(params);

    let promises = Arrays
        .of(names)
        .zip(paths)
        .mapElement((pair: [Promise<string>, string]) => {
          return Promise.all(pair);
        })
        .asArray();
    return Promise
        .all(promises)
        .then((data: [string, string][]) => {
          return Arrays
              .of(data)
              .map(([name, url]: [string, string]) => {
                return {
                  name: name,
                  url: url,
                };
              })
              .asArray();
        })
        .then((crumbData: CrumbData[]) => {
          this.crumbBridge_.set(crumbData);
        });
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
