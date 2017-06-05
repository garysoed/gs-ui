import { DomEvent, ListenableDom, MonadSetter } from 'external/gs_tools/src/event';
import { listener } from 'external/gs_tools/src/event/listener';
import { on } from 'external/gs_tools/src/event/on';
import { ImmutableMap } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, FloatParser } from 'external/gs_tools/src/parse';
import {
  Animation,
  AnimationEasing,
  BaseElement,
  customElement,
  dom,
  domOut,
  handle,
  onDom} from 'external/gs_tools/src/webc';
import { onLifecycle } from 'external/gs_tools/src/webc/on-lifecycle';

import { WINDOW_BUS } from '../common/window-bus';
import { AnchorLocation } from '../tool/anchor-location';
import { AnchorLocationParser } from '../tool/anchor-location-parser';
import { Anchors } from '../tool/anchors';


const BACKDROP_CLICK_EVENT = {name: 'click', selector: '#backdrop'};
const CONTAINER_EL = {selector: '#container'};
const ROOT_EL = {selector: '#root'};
const SLOT_EL = {selector: 'slot'};
const VISIBLE_ATTR = {name: 'visible', parser: BooleanParser, selector: null};


@customElement({
  tag: 'gs-overlay-container',
  templateKey: 'src/tool/overlay-container',
})
export class OverlayContainer extends BaseElement {
  static readonly HIDE_EVENT: string = 'gs-hide';
  static readonly SHOW_EVENT: string = 'gs-show';

  private static readonly BASE_SHOW_ANIMATION_: Animation = Animation.newInstance(
      [
        {height: '0px', opacity: 0, width: '0px'},
      ],
      {duration: 300, easing: AnimationEasing.EASE_OUT_EXPO});
  private static readonly HIDE_ANIMATION_: Animation = Animation.newInstance(
      [
        {opacity: 1},
        {opacity: 0},
      ],
      {duration: 200, easing: AnimationEasing.LINEAR});


  private static SHOW_CLASS_: string = 'show';

  constructor(@inject('x.dom.window') private windowEl_: Window = window) {
    super();
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
          this.windowEl_);
    }
  }

  /**
   * Hides the menu container.
   */
  private hide_(containerEl: HTMLElement, rootEl: HTMLElement): void {
    const animate = OverlayContainer.HIDE_ANIMATION_.applyTo(containerEl);
    const listenableAnimate = ListenableDom.of(animate);
    this.addDisposable(listenableAnimate);

    this.addDisposable(listenableAnimate.once(
        DomEvent.FINISH,
        this.onFinishAnimate_.bind(this, rootEl),
        this));
  }

  @handle(null).attributeChange('gs-anchor-point')
  @handle(null).attributeChange('gs-anchor-target-x')
  @handle(null).attributeChange('gs-anchor-target-y')
  onAttributesChanged_(@dom.element(CONTAINER_EL) containerEl: HTMLElement): void {
    this.updateContent_(containerEl);
  }

  /**
   * Handles the event when backdrop is clicked.
   */
  @onDom.event(BACKDROP_CLICK_EVENT)
  onBackdropClick_(
      @domOut.attribute(VISIBLE_ATTR) {id, value: isVisible}: MonadSetter<boolean>):
      ImmutableMap<any, any> {
    return ImmutableMap.of([[id, false]]);
  }

  /**
   * @override
   * TODO: Use onLifecycle
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);

    if (element['gsAnchorPoint'] === null) {
      element['gsAnchorPoint'] = AnchorLocation.AUTO;
    }
  }

  /**
   * Handles the event when animate is done.
   */
  private onFinishAnimate_(rootEl: HTMLElement): void {
    rootEl.classList.remove(OverlayContainer.SHOW_CLASS_);

    const element = this.getElement();
    if (element !== null) {
      element.dispatch(OverlayContainer.HIDE_EVENT, () => {});
    }
  }

  /**
   * @override
   */
  @onLifecycle('insert')
  onInserted(@dom.element(CONTAINER_EL) containerEl: HTMLElement): void {
    this.updateContent_(containerEl);
  }

  @onDom.attributeChange(VISIBLE_ATTR)
  onVisibilityChange_(
      @dom.attribute(VISIBLE_ATTR) isVisible: boolean | null,
      @dom.element(CONTAINER_EL) containerEl: HTMLElement,
      @dom.element(ROOT_EL) rootEl: HTMLElement,
      @dom.element(SLOT_EL) slotEl: HTMLSlotElement): void {
    if (isVisible === null) {
      return;
    }

    if (isVisible) {
      this.show_(containerEl, rootEl, slotEl);
    } else {
      this.hide_(containerEl, rootEl);
    }
  }

  /**
   * Handler called when the window is resized.
   */
  @on(WINDOW_BUS, 'resize')
  private onWindowResize_(@dom.element(CONTAINER_EL) containerEl: HTMLElement): void {
    this.updateContent_(containerEl);
  }

  /**
   * Shows the menu content.
   */
  private show_(containerEl: HTMLElement, rootEl: HTMLElement, slotEl: HTMLSlotElement): void {
    let contentHeight = 0;
    let contentWidth = 0;
    const distributedNodes = slotEl.assignedNodes();
    if (distributedNodes.length <= 0) {
      return;
    }
    const distributedElement = distributedNodes[0] as HTMLElement;

    // Temporarily displays the root element for measurement.

    const origDisplay = rootEl.style.display;
    const origVisibility = rootEl.style.visibility;
    rootEl.style.display = 'block';
    rootEl.style.visibility = 'hidden';
    contentHeight = distributedElement.clientHeight;
    contentWidth = distributedElement.clientWidth;
    rootEl.style.display = origDisplay;
    rootEl.style.visibility = origVisibility;

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
                .applyTo(containerEl);

            rootEl.classList.add(OverlayContainer.SHOW_CLASS_);
          });
    }
  }

  /**
   * Resets the location of the container element based on the anchor point and the anchor target.
   */
  private updateContent_(containerEl: HTMLElement): void {
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
    containerEl.style.top = '';
    containerEl.style.right = '';
    containerEl.style.bottom = '';
    containerEl.style.left = '';

    const viewportHeight = this.windowEl_.innerHeight;
    const viewportWidth = this.windowEl_.innerWidth;
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
