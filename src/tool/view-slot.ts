import { Arrays } from 'external/gs_tools/src/collection';
import { Iterables } from 'external/gs_tools/src/collection';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import { Doms, LocationService, LocationServiceEvents } from 'external/gs_tools/src/ui';
import { customElement, DomHook, hook } from 'external/gs_tools/src/webc';

import { BaseThemedElement } from '../common/base-themed-element';
import { ThemeService } from '../theming/theme-service';

export const __FULL_PATH = Symbol('fullPath');

@customElement({
  attributes: {
    'gsFullPath': StringParser,
  },
  tag: 'gs-view-slot',
  templateKey: 'src/tool/view-slot',
})
export class ViewSlot extends BaseThemedElement {
  @hook('#root').property('classList')
  readonly rootElClassListHook_: DomHook<DOMTokenList>;

  private readonly locationService_: LocationService;
  private path_: string | null;

  /**
   * @param locationService
   */
  constructor(
      @inject('theming.ThemeService') themeService: ThemeService,
      @inject('gs.LocationService') locationService: LocationService) {
    super(themeService);
    this.locationService_ = locationService;
    this.path_ = null;
    this.rootElClassListHook_ = DomHook.of<DOMTokenList>();
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.listenTo(
        this.locationService_,
        LocationServiceEvents.CHANGED,
        this.onLocationChanged_);
  }

  /**
   * @override
   */
  onInserted(element: HTMLElement): void {
    super.onInserted(element);

    // Update the path.
    let rootPath: string = '';
    let currentPath: string = '';
    Iterables
        .of(Doms.parentIterable(element, true /* bustShadow */))
        .iterate((currentElement: HTMLElement, breakFn: () => void) => {
          if (currentElement !== element && currentElement.nodeName === 'GS-VIEW-SLOT') {
            rootPath = currentElement[__FULL_PATH];
            breakFn();
          } else if (!!currentElement.getAttribute('gs-view-path')) {
            currentPath = currentElement.getAttribute('gs-view-path') || '';
          }
        });

    element[__FULL_PATH] = LocationService.appendParts(ImmutableList.of([rootPath, currentPath]));

    this.updateActiveView_();
  }

  /**
   * Handles event when the location was changed.
   */
  private onLocationChanged_(): void {
    this.updateActiveView_();
  }

  /**
   * @param targetEl The element to be set as the active element, if any. If null, this will
   *    deactivate all elements.
   */
  setActiveElement_(targetEl: Element | null): void {
    const listenableElement = this.getElement();
    if (listenableElement !== null) {
      const element = listenableElement.getEventTarget();
      const currentActive = element
          .querySelector(`[gs-view-active="${BooleanParser.stringify(true)}"]`);
      if (currentActive !== null) {
        currentActive.setAttribute('gs-view-active', BooleanParser.stringify(false));
      }
    }

    if (targetEl !== null) {
      targetEl.setAttribute('gs-view-active', BooleanParser.stringify(true));
    }
  }

  /**
   * Sets the root element to be visible.
   *
   * @param visible True iff the root element should be visible.
   */
  private setRootElVisible_(visible: boolean): void {
    const classList = this.rootElClassListHook_.get();
    if (classList !== null) {
      classList.toggle('hidden', !visible);
    }
  }

  /**
   * Updates the selector.
   */
  private updateActiveView_(): void {
    const listenableElement = this.getElement();
    if (listenableElement !== null) {
      const element = listenableElement.getEventTarget();
      const targetEl = Arrays
          .fromItemList(element.children)
          .find((child: Element) => {
            const path = child.getAttribute('gs-view-path');
            if (!path) {
              return false;
            }
            const joinedParts = LocationService.appendParts(
                ImmutableList.of<string>([element[__FULL_PATH], path]));
            return this.locationService_.hasMatch(joinedParts);
          });
      this.setActiveElement_(targetEl);
      this.setRootElVisible_(targetEl !== null);
    }
  }
}
// TODO: Mutable
