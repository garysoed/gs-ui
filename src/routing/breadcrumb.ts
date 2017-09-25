/**
 * @webcomponent gs-breadcrumb
 * Displays breadcrumb for the current path.
 *
 * This component works closely with the gs-ui.routing.RouteService to come up with the segments
 * for the current path, as well as the name and link for each segment.
 */
import {
  HasPropertiesType,
  InstanceofType,
  StringType} from 'external/gs_tools/src/check';
import { nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList, ImmutableMap } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import {
  childrenSelector,
  component,
  elementSelector,
  render,
  resolveSelectors,
  slotSelector} from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from '../common';
import { AbstractRouteFactory } from '../routing/abstract-route-factory';
import { Route } from '../routing/route';
import { $route } from '../routing/route-graph';
import { RouteService } from '../routing/route-service';
import { ThemeService } from '../theming';

export const __FULL_PATH = Symbol('fullPath');

export type CrumbData = {name: string, url: string};

export function crumbFactory(document: Document): Element {
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
}

export function crumbGetter(element: Element): CrumbData | null {
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
}

export function crumbSetter(data: CrumbData, element: Element): void {
  const linkEl = element.querySelector('a');
  if (linkEl === null) {
    throw new Error('Link element not found');
  }
  linkEl.href = `#${data.url}`;
  linkEl.textContent = data.name;
}

const $ = resolveSelectors({
  container: {
    children: childrenSelector(
        slotSelector(elementSelector('container.el'), 'crumbs'),
        crumbFactory,
        crumbGetter,
        crumbSetter,
        HasPropertiesType({
          name: StringType,
          url: StringType,
        }),
        InstanceofType(HTMLDivElement)),
    el: elementSelector('#container', InstanceofType(HTMLDivElement)),
  },
});

@component({
  dependencies: [
    RouteService,
  ],
  tag: 'gs-breadcrumb',
  templateKey: 'src/routing/breadcrumb',
})
export class Breadcrumb<T> extends BaseThemedElement2 {
  /**
   * @param themeService
   */
  constructor(
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @render.children($.container.children)
  async renderChildren_(
      @nodeIn($route.match) match: Route<T, any> | null,
      @nodeIn($route.routeFactoryMap)
          routeFactoryMap: ImmutableMap<T, AbstractRouteFactory<T, any, any, any>>):
      Promise<ImmutableList<CrumbData>> {
    if (match === null) {
      return ImmutableList.of([]);
    }

    const {params, type} = match;
    const routeFactory = routeFactoryMap.get(type);

    if (!routeFactory) {
      return ImmutableList.of([]);
    }
    const names = routeFactory.getCascadeNames(params);
    const paths = routeFactory.getCascadePaths(params);
    const promises = ImmutableList
        .of(names)
        .map((promise: Promise<string>, index: number) => {
          return Promise.all([promise, paths[index]]);
        });
    return ImmutableList.of(await Promise.all(promises))
        .map(([name, url]: [string, string]) => ({name, url}));
  }
}
