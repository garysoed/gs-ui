/**
 * @webcomponent gs-breadcrumb
 * Displays breadcrumb for the current path.
 *
 * This component works closely with the gs-ui.routing.RouteService to come up with the segments
 * for the current path, as well as the name and link for each segment.
 *
 * @attr <{name: string, url: string}[]> crumb
 */
import {
  HasPropertiesType,
  InstanceofType,
  IterableOfType,
  StringType } from 'external/gs_tools/src/check';
import { nodeIn } from 'external/gs_tools/src/graph';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { ListParser, ObjectParser, StringParser } from 'external/gs_tools/src/parse';
import {
  attributeSelector,
  childrenSelector,
  component,
  elementSelector,
  render,
  resolveSelectors,
  shadowHostSelector,
  slotSelector } from 'external/gs_tools/src/persona';

import { BaseThemedElement2 } from '../common';
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

export const $ = resolveSelectors({
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
  host: {
    crumb: attributeSelector(
        elementSelector('host.el'),
        'crumb',
        ListParser(ObjectParser({name: StringParser, url: StringParser})),
        IterableOfType<CrumbData, ImmutableList<CrumbData>>(
            HasPropertiesType({name: StringType, url: StringType})),
        ImmutableList.of([])),
    el: shadowHostSelector,
  },
});

@component({
  dependencies: [
    RouteService,
  ],
  inputs: [$.host.crumb],
  tag: 'gs-breadcrumb',
  templateKey: 'src/routing/breadcrumb',
})
export class Breadcrumb extends BaseThemedElement2 {
  /**
   * @param themeService
   */
  constructor(
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  @render.children($.container.children)
  renderChildren_(
      @nodeIn($.host.crumb.getId()) crumbs: ImmutableList<CrumbData>): ImmutableList<CrumbData> {
    return crumbs;
  }
}
