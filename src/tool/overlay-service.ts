import { Interval } from 'external/gs_tools/src/async';
import { BaseListener, ListenableDom } from 'external/gs_tools/src/event';
import { bind, inject } from 'external/gs_tools/src/inject';
import { BooleanParser, EnumParser, FloatParser } from 'external/gs_tools/src/parse';

import { AnchorLocation } from '../const';
import { Anchors, OverlayContainer } from '../tool';
import { OverlayBus } from '../tool/overlay-bus';

export const __shownId = Symbol('shownId');

@bind('gs.tool.OverlayService', [OverlayContainer])
export class OverlayService extends BaseListener {
  private static ANCHOR_TARGET_INTERVAL_: number = 500;

  constructor(
      @inject('x.dom.document') private document_: Document,
      @inject('x.dom.window') private window_: Window) {
    super();
  }

  private getOverlayContainerEl_(): HTMLElement {
    // Checks if there is a gs-overlay-container element.
    const overlayContainerEl =
        this.document_.querySelector('gs-overlay-container') as HTMLElement | null;
    if (overlayContainerEl !== null) {
      return overlayContainerEl;
    }
    const newOverlayContainerEl = this.document_.createElement('gs-overlay-container');
    this.document_.body.appendChild(newOverlayContainerEl);

    return newOverlayContainerEl;
  }

  private getShownId_(): symbol | null {
    return this.getOverlayContainerEl_()[__shownId] || null;
  }

  /**
   * Hides the overlay.
   */
  hideOverlay(id: symbol): void {
    if (this.getShownId_() !== id) {
      return;
    }
    const overlayContainerEl = this.getOverlayContainerEl_();
    OverlayBus.dispatch({id, type: 'hide'}, () => {
      overlayContainerEl.setAttribute('visible', BooleanParser.stringify(false));
      overlayContainerEl[__shownId] = null;
    });
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
        overlayContainerEl.setAttribute(
            'anchor-target-x', FloatParser.stringify(parentScreenLeft));
        break;
      case AnchorLocation.BOTTOM_RIGHT:
      case AnchorLocation.TOP_RIGHT:
        overlayContainerEl.setAttribute(
            'anchor-target-x', FloatParser.stringify(parentScreenLeft + boundingRect.width));
        break;
    }

    switch (resolvedAnchorTarget) {
      case AnchorLocation.BOTTOM_LEFT:
      case AnchorLocation.BOTTOM_RIGHT:
        overlayContainerEl.setAttribute(
            'anchor-target-y', FloatParser.stringify(parentScreenTop + boundingRect.height));
        break;
      case AnchorLocation.TOP_LEFT:
      case AnchorLocation.TOP_RIGHT:
        overlayContainerEl.setAttribute(
            'anchor-target-y', FloatParser.stringify(parentScreenTop));
        break;
    }
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
      id: symbol,
      overlayParent: Element,
      overlayContent: Element | null,
      anchorElement: HTMLElement,
      anchorTarget: AnchorLocation,
      anchorPoint: AnchorLocation): Promise<void> {
    const shownId = this.getShownId_();
    if (shownId === id) {
      // The overlay is already shown.
      return Promise.resolve();
    }

    if (shownId) {
      this.hideOverlay(shownId);
    }

    if (overlayContent === null) {
      return Promise.resolve();
    }

    const overlayContainerEl = this.getOverlayContainerEl_();
    const anchorTargetWatcher = Interval.newInstance(OverlayService.ANCHOR_TARGET_INTERVAL_);
    this.addDisposable(anchorTargetWatcher.on(
        'tick',
        this.onTick_.bind(this, overlayContainerEl, anchorTarget, anchorElement),
        this));
    anchorTargetWatcher.start();

    overlayContainerEl.appendChild(overlayContent);
    overlayContainerEl.setAttribute(
        'anchor-point', EnumParser(AnchorLocation).stringify(anchorPoint));
    this.setAnchorTarget_(overlayContainerEl, anchorTarget, anchorElement);

    const listenableOverlayContainerEl = ListenableDom.of(overlayContainerEl);
    this.addDisposable(listenableOverlayContainerEl);
    return new Promise<void>((resolve: () => void): void => {
      this.addDisposable(listenableOverlayContainerEl.once(
          'gs-hide',
          () => {
            anchorTargetWatcher.dispose();
            overlayParent.appendChild(overlayContent);
            this.hideOverlay(id);
            listenableOverlayContainerEl.dispose();
            resolve();
          },
          false));
      OverlayBus.dispatch({id, type: 'show'}, () => {
        overlayContainerEl.setAttribute('visible', BooleanParser.stringify(true));
        overlayContainerEl[__shownId] = id;
      });
    });
  }
}
