import {BaseDisposable} from 'external/gs_tools/src/dispose';
import {bind, inject} from 'external/gs_tools/src/inject';
import {Interval} from 'external/gs_tools/src/async';
import {ListenableDom} from 'external/gs_tools/src/event';

import {AnchorLocation} from './anchor-location';
import {Anchors} from './anchors';
import {MenuContainer} from './menu-container';


@bind('tool.MenuService', [MenuContainer])
export class MenuService extends BaseDisposable {
  private static ANCHOR_TARGET_INTERVAL_: number = 500;

  private menuContainerEl_: ListenableDom<HTMLElement> | null = null;

  constructor(
      @inject('x.dom.document') private document_: Document,
      @inject('x.dom.window') private window_: Window) {
    super();
  }

  private getMenuContainerEl_(): ListenableDom<HTMLElement> {
    // Checks if there is a menu-element.
    if (this.menuContainerEl_ === null) {
      let menuContainerEl = this.document_.querySelector('gs-menu-container');
      if (menuContainerEl === null) {
        menuContainerEl = this.document_.createElement('gs-menu-container');
        this.document_.body.appendChild(menuContainerEl);
      }
      this.menuContainerEl_ = ListenableDom.of(<HTMLElement> menuContainerEl);
      this.addDisposable(this.menuContainerEl_);
    }

    return this.menuContainerEl_;
  }

  private onTick_(
      menuContainerEl: HTMLElement,
      anchorTarget: AnchorLocation,
      anchorElement: HTMLElement): void {
    this.setAnchorTarget_(menuContainerEl, anchorTarget, anchorElement);
  }

  private setAnchorTarget_(
      menuContainerEl: HTMLElement,
      anchorTarget: AnchorLocation,
      parentElement: HTMLElement): void {
    let boundingRect = parentElement.getBoundingClientRect();
    let parentScreenLeft = boundingRect.left;
    let parentScreenTop = boundingRect.top;

    let resolvedAnchorTarget = anchorTarget === AnchorLocation.AUTO ?
        Anchors.resolveAutoLocation(
            parentScreenLeft + boundingRect.width / 2,
            parentScreenTop + boundingRect.height / 2,
            this.window_) :
        anchorTarget;

    switch (resolvedAnchorTarget) {
      case AnchorLocation.BOTTOM_LEFT:
      case AnchorLocation.TOP_LEFT:
        menuContainerEl['gsAnchorTargetX'] = parentScreenLeft;
        break;
      case AnchorLocation.BOTTOM_RIGHT:
      case AnchorLocation.TOP_RIGHT:
        menuContainerEl['gsAnchorTargetX'] = parentScreenLeft + boundingRect.width;
        break;
    }

    switch (resolvedAnchorTarget) {
      case AnchorLocation.BOTTOM_LEFT:
      case AnchorLocation.BOTTOM_RIGHT:
        menuContainerEl['gsAnchorTargetY'] = parentScreenTop + boundingRect.height;
        break;
      case AnchorLocation.TOP_LEFT:
      case AnchorLocation.TOP_RIGHT:
        menuContainerEl['gsAnchorTargetY'] = parentScreenTop;
        break;
    }
  }

  /**
   * Hides the menu.
   */
  hideMenu(): void {
    this.getMenuContainerEl_().getEventTarget()['hide']();
  }

  /**
   * Shows the menu.
   *
   * @param menu The menu to be shown.
   * @param anchorElement The element for the menu to anchor to.
   * @param anchorTarget The position of the anchor in the anchor element to anchor on.
   * @param anchorPoint The position of the anchor on the menu to anchor on.
   * @return Promise that will be resolved when the menu is hidden.
   */
  showMenu(
      menu: HTMLElement,
      anchorElement: HTMLElement,
      anchorTarget: AnchorLocation,
      anchorPoint: AnchorLocation): Promise<void> {
    let menuContent = menu.querySelector('[gs-content]');
    if (menuContent === null) {
      return Promise.resolve();
    }

    let menuContainerEl = this.getMenuContainerEl_();
    let anchorTargetWatcher = Interval.newInstance(MenuService.ANCHOR_TARGET_INTERVAL_);
    anchorTargetWatcher.on(
        Interval.TICK_EVENT,
        this.onTick_.bind(this, menuContainerEl.getEventTarget(), anchorTarget, anchorElement),
        this);
    anchorTargetWatcher.start();

    menuContainerEl.getEventTarget().appendChild(menuContent);
    menuContainerEl.getEventTarget()['gsAnchorPoint'] = anchorPoint;
    this.setAnchorTarget_(menuContainerEl.getEventTarget(), anchorTarget, anchorElement);

    return new Promise((resolve: () => void, reject: () => void): void => {
      this.addDisposable(menuContainerEl.once(
          MenuContainer.HIDE_EVENT,
          () => {
            anchorTargetWatcher.dispose();
            menu.appendChild(menuContent);
            resolve();
          },
          false));
      menuContainerEl.getEventTarget()['show']();
    });
  }
}
