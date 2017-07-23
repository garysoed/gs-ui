/**
 * @webcomponent gs-overlay-container
 * Container for overlays.
 *
 * Do not use this directly. Instead, use tool.OverlayService or tool.Menu.
 *
 * @attr {enum<AnchorLocation>} anchor-point Location to anchor the overlay content to. This
 *    affects the expanding animation. For example, if this is left to BOTTOM_RIGHT, the content
 *    will expand towards the top left.
 * @attr {float} anchor-target-x X coordinate of the left edge of the content, in px.
 * @attr {float} anchor-target-y Y coordinate of the top edge of the content, in px.
 * @attr {boolean} visible True iff the container should be visible.
 *
 * @slot _ Content of the overlay.
 *
 * @event {} gs-hide The overlay is hidden.
 * @event {} gs-show The overlay is shown.
 */
import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { eventDetails } from 'external/gs_tools/src/event';
import { on } from 'external/gs_tools/src/event/on';
import { ImmutableList } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { DispatchFn, MonadSetter } from 'external/gs_tools/src/interfaces';
import { BooleanParser, EnumParser, FloatParser } from 'external/gs_tools/src/parse';
import {
  Animation,
  AnimationEasing,
  AnimationEventDetail,
  customElement,
  dom,
  domOut,
  onDom} from 'external/gs_tools/src/webc';
import { onLifecycle } from 'external/gs_tools/src/webc/on-lifecycle';

import { WINDOW_BUS } from '../common';
import { AnchorLocation } from '../const';
import { Anchors } from '../tool';


const BACKDROP_EL = '#backdrop';
const CONTAINER_EL = '#container';
const ROOT_EL = '#root';
const SLOT_EL = 'slot';

const ANCHOR_POINT_ATTR = {
  name: 'anchor-point',
  parser: EnumParser(AnchorLocation),
  selector: null,
};
const ANCHOR_TARGET_X_ATTR = {
  name: 'anchor-target-x',
  parser: FloatParser,
  selector: null,
};
const ANCHOR_TARGET_Y_ATTR = {
  name: 'anchor-target-y',
  parser: FloatParser,
  selector: null,
};
const VISIBLE_ATTR = {name: 'visible', parser: BooleanParser, selector: null};

const HIDE_EVENT: string = 'gs-hide';
const SHOW_EVENT: string = 'gs-show';

const SHOW_ANIM = Symbol('show');
export const HIDE_ANIM = Symbol('hide');

@customElement({
  tag: 'gs-overlay-container',
  templateKey: 'src/tool/overlay-container',
})
export class OverlayContainer extends BaseDisposable {

  private static readonly BASE_SHOW_ANIMATION_: Animation = Animation.newInstance(
      [
        {height: '0px', opacity: 0, width: '0px'},
      ],
      {duration: 300, easing: AnimationEasing.EASE_OUT_EXPO},
      SHOW_ANIM);
  private static readonly HIDE_ANIMATION_: Animation = Animation.newInstance(
      [
        {opacity: 1},
        {opacity: 0},
      ],
      {duration: 200, easing: AnimationEasing.LINEAR},
      HIDE_ANIM);


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
  private getAnchorPoint_(
      anchorPoint: AnchorLocation,
      anchorTargetX: number,
      anchorTargetY: number): AnchorLocation {
    if (anchorPoint !== AnchorLocation.AUTO) {
      return anchorPoint;
    } else {
      return Anchors.resolveAutoLocation(anchorTargetX, anchorTargetY, this.windowEl_);
    }
  }

  /**
   * Hides the menu container.
   */
  private hide_(): void {
    OverlayContainer.HIDE_ANIMATION_.start(this, CONTAINER_EL);
  }

  @onDom.attributeChange(ANCHOR_POINT_ATTR)
  @onDom.attributeChange(ANCHOR_TARGET_X_ATTR)
  @onDom.attributeChange(ANCHOR_TARGET_Y_ATTR)
  @onDom.attributeChange(VISIBLE_ATTR)
  @on(WINDOW_BUS, 'resize')
  @onLifecycle('insert')
  onAttributesChanged_(
      @dom.attribute(ANCHOR_POINT_ATTR) anchorPoint: AnchorLocation | null,
      @dom.attribute(ANCHOR_TARGET_X_ATTR) anchorTargetX: number | null,
      @dom.attribute(ANCHOR_TARGET_Y_ATTR) anchorTargetY: number | null,
      @dom.element(CONTAINER_EL) containerEl: HTMLElement): void {
    this.updateContent_(anchorPoint, anchorTargetX, anchorTargetY, containerEl);
  }

  /**
   * Handles the event when backdrop is clicked.
   */
  @onDom.event(BACKDROP_EL, 'click')
  onBackdropClick_(
      @domOut.attribute(VISIBLE_ATTR) visibleSetter: MonadSetter<boolean>):
      ImmutableList<MonadSetter<any>> {
    visibleSetter.value = false;
    return ImmutableList.of([visibleSetter]);
  }

  /**
   * @override
   * TODO: Use onLifecycle
   */
  @onLifecycle('create')
  onCreated(
      @domOut.attribute(ANCHOR_POINT_ATTR) anchorPointSetter: MonadSetter<AnchorLocation | null>):
      ImmutableList<MonadSetter<any>> {
    if (anchorPointSetter.value === null) {
      anchorPointSetter.value = AnchorLocation.AUTO;
      return ImmutableList.of([anchorPointSetter]);
    } else {
      return ImmutableList.of([]);
    }
  }

  /**
   * Handles the event when animate is done.
   */
  @onDom.event(CONTAINER_EL, 'gs-animationfinish')
  onFinishAnimate_(
      @eventDetails() {detail}: {detail: AnimationEventDetail},
      @dom.element(ROOT_EL) rootEl: HTMLElement,
      @dom.eventDispatcher() dispatcher: DispatchFn<{}>): void {
    if (detail.id !== HIDE_ANIM) {
      return;
    }
    rootEl.classList.remove(OverlayContainer.SHOW_CLASS_);
    dispatcher(HIDE_EVENT, {});
  }

  @onDom.attributeChange(VISIBLE_ATTR)
  onVisibilityChange_(
      @dom.attribute(VISIBLE_ATTR) isVisible: boolean | null,
      @dom.element(ROOT_EL) rootEl: HTMLElement,
      @dom.element(SLOT_EL) slotEl: HTMLSlotElement,
      @dom.eventDispatcher() dispatcher: DispatchFn<{}>): void {
    if (isVisible) {
      this.show_(rootEl, slotEl, dispatcher);
    } else {
      this.hide_();
    }
  }

  /**
   * Shows the menu content.
   */
  private show_(rootEl: HTMLElement, slotEl: HTMLSlotElement, dispatcher: DispatchFn<{}>): void {
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

    dispatcher(SHOW_EVENT, {});
    OverlayContainer.BASE_SHOW_ANIMATION_
        .appendKeyframe({
          height: `${contentHeight}px`,
          opacity: 1,
          width: `${contentWidth}px`,
        })
        .start(this, CONTAINER_EL);

    rootEl.classList.add(OverlayContainer.SHOW_CLASS_);
  }

  /**
   * Resets the location of the container element based on the anchor point and the anchor target.
   */
  private updateContent_(
      anchorPointAttr: AnchorLocation | null,
      anchorTargetX: number | null,
      anchorTargetY: number | null,
      containerEl: HTMLElement): void {
    if (anchorTargetX === null || anchorTargetY === null) {
      // Do nothing if the anchor target is not defined.
      return;
    }

    if (anchorPointAttr === null) {
      return;
    }

    // Resets the location of the container.
    containerEl.style.top = '';
    containerEl.style.right = '';
    containerEl.style.bottom = '';
    containerEl.style.left = '';

    const viewportHeight = this.windowEl_.innerHeight;
    const viewportWidth = this.windowEl_.innerWidth;
    const anchorPoint = this.getAnchorPoint_(anchorPointAttr, anchorTargetX, anchorTargetY);

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
