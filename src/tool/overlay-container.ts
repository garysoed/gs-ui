import { Jsons } from 'external/gs_tools/src/collection';
import { DomEvent, ListenableDom } from 'external/gs_tools/src/event';
import { inject } from 'external/gs_tools/src/inject';
import {
  Animation,
  AnimationEasing,
  BaseElement,
  customElement,
  FloatParser,
  handle } from 'external/gs_tools/src/webc';

import { AnchorLocation } from './anchor-location';
import { AnchorLocationParser } from './anchor-location-parser';
import { Anchors } from './anchors';


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
    let element = this.getElement();
    if (element === null) {
      throw Error('No element found');
    }
    let elementTarget = element.getEventTarget();
    let anchorPoint = elementTarget['gsAnchorPoint'];
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
    let animate = OverlayContainer.HIDE_ANIMATION_.applyTo(this.containerEl_.getEventTarget());
    let listenableAnimate = ListenableDom.of(animate);
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
   * Handles the event when animate is done.
   */
  private onFinishAnimate_(): void {
    this.rootEl_.getEventTarget().classList.remove(OverlayContainer.SHOW_CLASS_);

    let element = this.getElement();
    if (element !== null) {
      element.dispatch(OverlayContainer.HIDE_EVENT, () => {});
    }
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
    let distributedNodes = this.contentEl_.getEventTarget().getDistributedNodes();
    if (distributedNodes.length <= 0) {
      return;
    }
    let distributedElement = distributedNodes[0];

    // Temporarily displays the root element for measurement.
    Jsons.setTemporaryValue(
        this.rootEl_.getEventTarget(),
        {
          'style.display': 'block',
          'style.visibility': 'hidden',
        },
        () => {
          contentHeight = distributedElement.clientHeight;
          contentWidth = distributedElement.clientWidth;
        });

    let element = this.getElement();
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
  @handle(null).attributeChange('gs-anchor-point', AnchorLocationParser)
  @handle(null).attributeChange('gs-anchor-target-x', FloatParser)
  @handle(null).attributeChange('gs-anchor-target-y', FloatParser)
  private updateContent_(): void {
    let element = this.getElement();
    if (element === null) {
      return;
    }

    let anchorTargetX = element.getEventTarget()['gsAnchorTargetX'];
    let anchorTargetY = element.getEventTarget()['gsAnchorTargetY'];

    if (anchorTargetX === null || anchorTargetY === null) {
      // Do nothing if the anchor target is not defined.
      return;
    }

    // Resets the location of the container.
    let containerEl = this.containerEl_.getEventTarget();
    containerEl.style.top = '';
    containerEl.style.right = '';
    containerEl.style.bottom = '';
    containerEl.style.left = '';

    let windowEl = this.windowEl_.getEventTarget();
    let viewportHeight = windowEl.innerHeight;
    let viewportWidth = windowEl.innerWidth;
    let anchorPoint = this.getAnchorPoint_();

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

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.backdropEl_ = ListenableDom.of(
        <HTMLElement> element.shadowRoot.querySelector('.backdrop'));
    this.containerEl_ = ListenableDom.of(
        <HTMLElement> element.shadowRoot.querySelector('.container'));
    this.contentEl_ = ListenableDom.of(
        <HTMLElement> element.shadowRoot.querySelector('content'));
    this.document_ = ListenableDom.of(element.ownerDocument);
    this.rootEl_ = ListenableDom.of(<HTMLElement> element.shadowRoot.querySelector('.root'));

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
   * @override
   */
  onInserted(element: HTMLElement): void {
    super.onInserted(element);
    this.addDisposable(this.windowEl_.on(DomEvent.RESIZE, this.onWindowResize_, this));
    this.addDisposable(this.backdropEl_.on(DomEvent.CLICK, this.onBackdropClick_, this));
    this.updateContent_();
  }
}
