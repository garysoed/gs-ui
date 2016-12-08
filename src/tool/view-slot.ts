import {Arrays} from 'external/gs_tools/src/collection';
import {
    bind,
    customElement,
    DomBridge,
    StringParser} from 'external/gs_tools/src/webc';
import {Doms, LocationService, LocationServiceEvents} from 'external/gs_tools/src/ui';
import {inject} from 'external/gs_tools/src/inject';
import {Iterables} from 'external/gs_tools/src/collection';

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
  @bind('content').attribute('select', StringParser)
  private readonly contentSelectBridge_: DomBridge<string>;

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
    this.contentSelectBridge_ = DomBridge.of<string>();
    this.locationService_ = locationService;
    this.path_ = null;
    this.rootEl_ = null;

    // TODO: Move this to Reflect.initialize
    this.addDisposable(locationService.on(
        LocationServiceEvents.CHANGED,
        this.onLocationChanged_.bind(this)));
  }

  /**
   * Handles event when the location was changed.
   */
  private onLocationChanged_(): void {
    this.updateSelector_();
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
  private updateSelector_(): void {
    let listenableElement = this.getElement();
    if (listenableElement !== null) {
      let element = listenableElement.getEventTarget();
      let targetEl = Arrays
          .fromHtmlCollection(element.children)
          .find((child: Element) => {
            let path = child.getAttribute('gs-view-path');
            return !!path && this.locationService_
                .hasMatch(LocationService.appendParts([element[__FULL_PATH], path]));
          });
      if (targetEl !== null) {
        this.contentSelectBridge_.set(`[gs-view-path="${targetEl.getAttribute('gs-view-path')}"]`);
      } else {
        this.contentSelectBridge_.delete();
      }

      this.setRootElVisible_(targetEl !== null);
    }
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.rootEl_ = <HTMLElement> element.shadowRoot.querySelector('#root');
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

    this.updateSelector_();
  }
}
