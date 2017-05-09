import { Interval } from 'external/gs_tools/src/async';
import { ListenableDom } from 'external/gs_tools/src/event';
import { BaseListener } from 'external/gs_tools/src/event';
import { bind, inject } from 'external/gs_tools/src/inject';

import { AnchorLocation } from '../tool/anchor-location';
import { Anchors } from '../tool/anchors';
import { OverlayContainer } from '../tool/overlay-container';


@bind('gs.tool.OverlayService', [OverlayContainer])
export class OverlayService extends BaseListener {
  private static ANCHOR_TARGET_INTERVAL_: number = 500;

  private overlayContainerEl_: ListenableDom<HTMLElement> | null = null;

  constructor(
      @inject('x.dom.document') private document_: Document,
      @inject('x.dom.window') private window_: Window) {
    super();
  }

  private getOverlayContainerEl_(): ListenableDom<HTMLElement> {
    // Checks if there is a gs-overlay-container element.
    if (this.overlayContainerEl_ === null) {
      let overlayContainerEl = this.document_.querySelector('gs-overlay-container');
      if (overlayContainerEl === null) {
        overlayContainerEl = this.document_.createElement('gs-overlay-container');
        this.document_.body.appendChild(overlayContainerEl);
      }
      this.overlayContainerEl_ = ListenableDom.of(overlayContainerEl as HTMLElement);
      this.addDisposable(this.overlayContainerEl_);
    }

    return this.overlayContainerEl_;
  }

  private onTick_(
      overlayContainerEl: HTMLElement,
      anchorTarget: AnchorLocation,
      anchorElement: HTMLElement): void {
    this.setAnchorTarget_(overlayContainerEl, anchorTarget, anchorElement);
  }

  private setAnchorTarget_(
      overlayContainerEl: HTMLElement,
      anchorTarget: AnchorLocation,
      parentElement: HTMLElement): void {
    const boundingRect = parentElement.getBoundingClientRect();
    const parentScreenLeft = boundingRect.left;
    const parentScreenTop = boundingRect.top;

    const resolvedAnchorTarget = anchorTarget === AnchorLocation.AUTO ?
        Anchors.resolveAutoLocation(
            parentScreenLeft + boundingRect.width / 2,
            parentScreenTop + boundingRect.height / 2,
            this.window_) :
        anchorTarget;

    switch (resolvedAnchorTarget) {
      case AnchorLocation.BOTTOM_LEFT:
      case AnchorLocation.TOP_LEFT:
        overlayContainerEl['gsAnchorTargetX'] = parentScreenLeft;
        break;
      case AnchorLocation.BOTTOM_RIGHT:
      case AnchorLocation.TOP_RIGHT:
        overlayContainerEl['gsAnchorTargetX'] = parentScreenLeft + boundingRect.width;
        break;
    }

    switch (resolvedAnchorTarget) {
      case AnchorLocation.BOTTOM_LEFT:
      case AnchorLocation.BOTTOM_RIGHT:
        overlayContainerEl['gsAnchorTargetY'] = parentScreenTop + boundingRect.height;
        break;
      case AnchorLocation.TOP_LEFT:
      case AnchorLocation.TOP_RIGHT:
        overlayContainerEl['gsAnchorTargetY'] = parentScreenTop;
        break;
    }
  }

  /**
   * Hides the overlay.
   */
  hideOverlay(): void {
    this.getOverlayContainerEl_().getEventTarget()['hide']();
  }

  /**
   * Shows the overlay.
   *
   * @param overlayContent The overlay content to be shown.
   * @param anchorElement The element for the overlay to anchor to.
   * @param anchorTarget The position of the anchor in the anchor element to anchor on.
   * @param anchorPoint The position of the anchor on the overlay to anchor on.
   * @return Promise that will be resolved when the overlay is hidden.
   */
  showOverlay(
      overlayParent: Element,
      overlayContent: Element | null,
      anchorElement: HTMLElement,
      anchorTarget: AnchorLocation,
      anchorPoint: AnchorLocation): Promise<void> {
    if (overlayContent === null) {
      return Promise.resolve();
    }

    const overlayContainerEl = this.getOverlayContainerEl_();
    const anchorTargetWatcher = Interval.newInstance(OverlayService.ANCHOR_TARGET_INTERVAL_);
    this.listenTo(
        anchorTargetWatcher,
        Interval.TICK_EVENT,
        this.onTick_.bind(this, overlayContainerEl.getEventTarget(), anchorTarget, anchorElement));
    anchorTargetWatcher.start();

    overlayContainerEl.getEventTarget().appendChild(overlayContent);
    overlayContainerEl.getEventTarget()['gsAnchorPoint'] = anchorPoint;
    this.setAnchorTarget_(overlayContainerEl.getEventTarget(), anchorTarget, anchorElement);

    return new Promise<void>((resolve: () => void, reject: () => void): void => {
      this.addDisposable(overlayContainerEl.once(
          OverlayContainer.HIDE_EVENT,
          () => {
            anchorTargetWatcher.dispose();
            overlayParent.appendChild(overlayContent);
            resolve();
          },
          false));
      overlayContainerEl.getEventTarget()['show']();
    });
  }
}
// TODO: Mutable
