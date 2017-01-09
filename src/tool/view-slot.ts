import {Arrays} from 'external/gs_tools/src/collection';
import {Iterables} from 'external/gs_tools/src/collection';
import {inject} from 'external/gs_tools/src/inject';
import {Doms, LocationService, LocationServiceEvents} from 'external/gs_tools/src/ui';
import {BooleanParser, customElement, StringParser} from 'external/gs_tools/src/webc';

import {BaseThemedElement} from '../common/base-themed-element';
import {ThemeService} from '../theming/theme-service';

export const __FULL_PATH = Symbol('fullPath');

@customElement({
  attributes: {
    'gsFullPath': StringParser,
  },
  tag: 'gs-view-slot',
  templateKey: 'src/tool/view-slot',
})
export class ViewSlot extends BaseThemedElement {
  private readonly locationService_: LocationService;

  private rootEl_: HTMLElement | null;
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
    this.rootEl_ = null;
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
    let listenableElement = this.getElement();
    if (listenableElement !== null) {
      let element = listenableElement.getEventTarget();
      let currentActive = element
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
    if (this.rootEl_ !== null) {
      // TODO: Use dom bridge for property
      this.rootEl_.classList.toggle('hidden', !visible);
    }
  }

  /**
   * Updates the selector.
   */
  private updateActiveView_(): void {
    let listenableElement = this.getElement();
    if (listenableElement !== null) {
      let element = listenableElement.getEventTarget();
      let targetEl = Arrays
          .fromItemList(element.children)
          .find((child: Element) => {
            let path = child.getAttribute('gs-view-path');
            return !!path && this.locationService_
                .hasMatch(LocationService.appendParts([element[__FULL_PATH], path]));
          });
      this.setActiveElement_(targetEl);
      this.setRootElVisible_(targetEl !== null);
    }
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.rootEl_ = <HTMLElement> element.shadowRoot.querySelector('#root');
    this.addDisposable(this.locationService_.on(
        LocationServiceEvents.CHANGED,
        this.onLocationChanged_,
        this));
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

    element[__FULL_PATH] = LocationService.appendParts([rootPath, currentPath]);

    this.updateActiveView_();
  }
}
