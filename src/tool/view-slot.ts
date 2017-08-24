/**
 * @webcomponent gs-view-slot
 * A wrapper around gs-switch that uses gs-tools.ui.LocationService to decide what to display.
 *
 * To use this, add children to the component. Each child should have a `gs-view-path` attribute
 * with a path matcher. This path matcher is relative to the closest ancestor gs-view-slot child.
 * The component will be displayed if the current URL location matches this path.
 *
 * Children that are currently active will have the 'gs-view-active' set to truthy.
 *
 * Make sure that the children have actual size or `fill-parent` so they can be displayed correctly.
 */
import { on } from 'external/gs_tools/src/event';
import { ImmutableList, ImmutableSet } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import { Doms, LocationService, LocationServiceEvents } from 'external/gs_tools/src/ui';
import { customElement, dom, domOut, onDom, onLifecycle } from 'external/gs_tools/src/webc';

import { MonadSetter, MonadValue } from 'external/gs_tools/src/interfaces';
import { BaseThemedElement2 } from '../common/base-themed-element2';
import { ThemeService } from '../theming/theme-service';
import { Switch } from '../tool/switch';

export const __fullPath = Symbol('fullPath');

const ROOT_EL = '#root';
const SWITCH_EL = '#switch';
const SWITCH_EL_VALUE_ATTR = {name: 'value', parser: StringParser, selector: SWITCH_EL};
const ACTIVE_ATTR = 'gs-view-active';

@customElement({
  dependencies: ImmutableSet.of([Switch]),
  tag: 'gs-view-slot',
  templateKey: 'src/tool/view-slot',
})
export class ViewSlot extends BaseThemedElement2 {
  /**
   * @param locationService
   */
  constructor(
      @inject('x.dom.document') private readonly document_: Document,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
  }

  private getFullPath_(element: HTMLElement): string | null {
    return element[__fullPath] || null;
  }

  @onDom.childListChange(null)
  onChildListChange_(
      @dom.element(null) element: HTMLElement,
      @dom.element(SWITCH_EL) switchEl: HTMLElement): void {
    // Delete all the children of the switch.
    for (const child of ImmutableList.of(switchEl.children)) {
      child.remove();
    }

    for (const child of ImmutableList.of(element.children)) {
      const slotName = child.getAttribute('gs-view-path');
      if (!slotName) {
        continue;
      }
      const slotEl = this.document_.createElement('slot') as HTMLSlotElement;
      slotEl.name = slotName;
      slotEl.setAttribute('slot', slotName);
      switchEl.appendChild(slotEl);
      child.setAttribute('slot', slotName);
    }
  }

  /**
   * @override
   */
  @onLifecycle('insert')
  onInserted(
      @dom.element(null) element: HTMLElement): void {
    // Update the path.
    let rootPath: string = '';
    let currentPath: string = '';
    for (const currentElement of Doms.parentIterable(element, true /* bustShadow */)) {
      if (currentElement !== element && currentElement.nodeName === 'GS-VIEW-SLOT') {
        rootPath = currentElement[__fullPath];
        break;
      } else if (!!currentElement.getAttribute('gs-view-path')) {
        currentPath = currentElement.getAttribute('gs-view-path') || '';
      }
    }

    element[__fullPath] = LocationService.appendParts(ImmutableList.of([rootPath, currentPath]));
  }

  /**
   * Sets the root element to be visible.
   *
   * @param visible True iff the root element should be visible.
   */
  private setRootElVisible_(rootEl: HTMLElement, visible: boolean): void {
    rootEl.classList.toggle('hidden', !visible);
  }

  /**
   * Updates the selector.
   */
  @on(LocationService, LocationServiceEvents.CHANGED)
  @onDom.childListChange(null)
  @onLifecycle('insert')
  updateActiveView_(
      @dom.element(null) element: HTMLElement,
      @dom.element(ROOT_EL) rootEl: HTMLElement,
      @domOut.attribute(SWITCH_EL_VALUE_ATTR) switchValueSetter: MonadSetter<string | null>):
      MonadValue<any>[] {
    const fullPath = this.getFullPath_(element);
    if (!fullPath) {
      return [];
    }
    const childrenList = ImmutableList.of(element.children);
    const currentActive = childrenList.find((element: Element) => {
      return element.hasAttribute(ACTIVE_ATTR);
    });
    const targetEl = childrenList
        .find((child: Element) => {
          const path = child.getAttribute('gs-view-path');
          if (!path) {
            return false;
          }
          const joinedParts = LocationService.appendParts(
              ImmutableList.of<string>([fullPath, path]));
          return LocationService.hasMatch(joinedParts);
        });

    // Update the active attribute;
    if (currentActive) {
      currentActive.removeAttribute(ACTIVE_ATTR);
    }

    if (targetEl) {
      targetEl.setAttribute(ACTIVE_ATTR, BooleanParser.stringify(true));
    }

    const slotName = targetEl ? targetEl.getAttribute('slot') : null;
    this.setRootElVisible_(rootEl, slotName !== null);
    return [switchValueSetter.set(slotName)];
  }
}
