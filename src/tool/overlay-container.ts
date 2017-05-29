import { DomEvent, ListenableDom } from 'external/gs_tools/src/event';
import { inject } from 'external/gs_tools/src/inject';
import { FloatParser } from 'external/gs_tools/src/parse';
import {
  Animation,
  AnimationEasing,
  BaseElement,
  customElement,
  handle } from 'external/gs_tools/src/webc';

import { AnchorLocation } from '../tool/anchor-location';
import { AnchorLocationParser } from '../tool/anchor-location-parser';
import { Anchors } from '../tool/anchors';


@customElement({
  attributes: {
    'gsAnchorPoint': AnchorLocationParser,
    'gsAnchorTargetX': FloatParser,
    'gsAnchorTargetY': FloatParser,
  },
  tag: 'gs-overlay-container',
  templateKey: 'src/tool/overlay-container',
})
export class OverlayContainer extends BaseElement {
  static HIDE_EVENT: string = 'gs-hide';
  static SHOW_EVENT: string = 'gs-show';

  private static BASE_SHOW_ANIMATION_: Animation = Animation.newInstance(
      [
        {height: '0px', opacity: 0, width: '0px'},
      ],
      {duration: 300, easing: AnimationEasing.EASE_OUT_EXPO});
  private static HIDE_ANIMATION_: Animation = Animation.newInstance(
      [
        {opacity: 1},
        {opacity: 0},
      ],
      {duration: 200, easing: AnimationEasing.LINEAR});


  private static SHOW_CLASS_: string = 'show';

  private backdropEl_: ListenableDom<HTMLElement>;
  private containerEl_: ListenableDom<HTMLElement>;
  private contentEl_: ListenableDom<HTMLElement>;
  private document_: ListenableDom<Document>;
  private rootEl_: ListenableDom<HTMLElement>;
  private windowEl_: ListenableDom<Window>;

  constructor(
      @inject('x.dom.window') windowEl: Window = window) {
    super();
    this.windowEl_ = ListenableDom.of(windowEl);
    this.addDisposable(this.windowEl_);
  }

  /**
   * Returns the anchor point.
   *
   * This tries to use the anchor point set in the element. If it is set to AUTO, it recalculates
   * the anchor point based on the anchor target position on the screen.
   *
   * @return The anchor point based on the attribute set in the element.
   */
  private getAnchorPoint_(): AnchorLocation {
    const element = this.getElement();
    if (element === null) {
      throw Error('No element found');
    }
    const elementTarget = element.getEventTarget();
    const anchorPoint = elementTarget['gsAnchorPoint'];
    if (elementTarget['gsAnchorPoint'] !== AnchorLocation.AUTO) {
      return anchorPoint;
    } else {
      return Anchors.resolveAutoLocation(
          elementTarget['gsAnchorTargetX'],
          elementTarget['gsAnchorTargetY'],
          this.windowEl_.getEventTarget());
    }
  }

  /**
   * Hides the menu container.
   */
  private hide_(): void {
    const animate = OverlayContainer.HIDE_ANIMATION_.applyTo(this.containerEl_.getEventTarget());
    const listenableAnimate = ListenableDom.of(animate);
    this.addDisposable(listenableAnimate);

    this.addDisposable(listenableAnimate.once(DomEvent.FINISH, this.onFinishAnimate_, this));
  }

  /**
   * Handles the event when backdrop is clicked.
   */
  private onBackdropClick_(): void {
    this.hide_();
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    const shadowRoot = element.shadowRoot;
    if (shadowRoot === null) {
      throw new Error('Shadow root not found');
    }
    this.backdropEl_ = ListenableDom.of(shadowRoot.querySelector('.backdrop') as HTMLElement);
    this.containerEl_ = ListenableDom.of(shadowRoot.querySelector('.container') as HTMLElement);
    this.contentEl_ = ListenableDom.of(shadowRoot.querySelector('content') as HTMLElement);
    this.document_ = ListenableDom.of(element.ownerDocument);
    this.rootEl_ = ListenableDom.of(shadowRoot.querySelector('.root') as HTMLElement);

    this.addDisposable(
        this.backdropEl_,
        this.containerEl_,
        this.contentEl_,
        this.document_,
        this.rootEl_);

    element['hide'] = this.hide_.bind(this);
    element['show'] = this.show_.bind(this);

    if (element['gsAnchorPoint'] === null) {
      element['gsAnchorPoint'] = AnchorLocation.AUTO;
    }
  }

  /**
   * Handles the event when animate is done.
   */
  private onFinishAnimate_(): void {
    this.rootEl_.getEventTarget().classList.remove(OverlayContainer.SHOW_CLASS_);

    const element = this.getElement();
    if (element !== null) {
      element.dispatch(OverlayContainer.HIDE_EVENT, () => {});
    }
  }

  /**
   * @override
   */
  onInserted(element: HTMLElement): void {
    super.onInserted(element);
    this.listenTo(this.windowEl_, DomEvent.RESIZE, this.onWindowResize_);
    this.listenTo(this.backdropEl_, DomEvent.CLICK, this.onBackdropClick_);
    this.updateContent_();
  }

  /**
   * Handler called when the window is resized.
   */
  private onWindowResize_(): void {
    this.updateContent_();
  }

  /**
   * Shows the menu content.
   */
  private show_(): void {
    let contentHeight = 0;
    let contentWidth = 0;
    const distributedNodes = this.contentEl_.getEventTarget().getDistributedNodes();
    if (distributedNodes.length <= 0) {
      return;
    }
    const distributedElement = distributedNodes[0];

    // Temporarily displays the root element for measurement.

    const eventTarget = this.rootEl_.getEventTarget();
    const origDisplay = eventTarget.style.display;
    const origVisibility = eventTarget.style.visibility;
    eventTarget.style.display = 'block';
    eventTarget.style.visibility = 'hidden';
    contentHeight = distributedElement.clientHeight;
    contentWidth = distributedElement.clientWidth;
    eventTarget.style.display = origDisplay;
    eventTarget.style.visibility = origVisibility;

    const element = this.getElement();
    if (element !== null) {
      element.dispatch(
          OverlayContainer.SHOW_EVENT,
          () => {
            OverlayContainer.BASE_SHOW_ANIMATION_
                .appendKeyframe({
                  height: `${contentHeight}px`,
                  opacity: 1,
                  width: `${contentWidth}px`,
                })
                .applyTo(this.containerEl_.getEventTarget());

            this.rootEl_.getEventTarget().classList.add(OverlayContainer.SHOW_CLASS_);
          });
    }
  }

  /**
   * Resets the location of the container element based on the anchor point and the anchor target.
   */
  @handle(null).attributeChange('gs-anchor-point')
  @handle(null).attributeChange('gs-anchor-target-x')
  @handle(null).attributeChange('gs-anchor-target-y')
  private updateContent_(): void {
    const element = this.getElement();
    if (element === null) {
      return;
    }

    const anchorTargetX = element.getEventTarget()['gsAnchorTargetX'];
    const anchorTargetY = element.getEventTarget()['gsAnchorTargetY'];

    if (anchorTargetX === null || anchorTargetY === null) {
      // Do nothing if the anchor target is not defined.
      return;
    }

    // Resets the location of the container.
    const containerEl = this.containerEl_.getEventTarget();
    containerEl.style.top = '';
    containerEl.style.right = '';
    containerEl.style.bottom = '';
    containerEl.style.left = '';

    const windowEl = this.windowEl_.getEventTarget();
    const viewportHeight = windowEl.innerHeight;
    const viewportWidth = windowEl.innerWidth;
    const anchorPoint = this.getAnchorPoint_();

    // Vertical offset
    switch (anchorPoint) {
      case AnchorLocation.BOTTOM_LEFT:
      case AnchorLocation.BOTTOM_RIGHT:
        containerEl.style.bottom = `${Math.max(viewportHeight - anchorTargetY, 0)}px`;
        break;
      case AnchorLocation.TOP_LEFT:
      case AnchorLocation.TOP_RIGHT:
        containerEl.style.top = `${Math.max(anchorTargetY, 0)}px`;
        break;
    }

    // Horizontal offset
    switch (anchorPoint) {
      case AnchorLocation.BOTTOM_LEFT:
      case AnchorLocation.TOP_LEFT:
        containerEl.style.left = `${Math.max(anchorTargetX, 0)}px`;
        break;
      case AnchorLocation.BOTTOM_RIGHT:
      case AnchorLocation.TOP_RIGHT:
        containerEl.style.right = `${Math.max(viewportWidth - anchorTargetX, 0)}px`;
        break;
    }
  }
}
// TODO: Mutable
