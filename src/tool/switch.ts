/**
 * @webcomponent gs-switch
 * Switches between different views depending on the value.
 *
 * To use this, add views this component switches between as children. Add `slot` attribute with the
 * expected value.
 *
 * @attr {string} value Current value of the switch.
 */

import { eventDetails, monad } from 'external/gs_tools/src/event';
import { ImmutableList, Vector2d } from 'external/gs_tools/src/immutable';
import { inject } from 'external/gs_tools/src/inject';
import { StringParser } from 'external/gs_tools/src/parse';
import { assertUnreachable } from 'external/gs_tools/src/typescript';
import {
  Animation,
  AnimationEasing,
  AnimationEventDetail,
  customElement,
  dom,
  onDom} from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common/base-themed-element2';
import { ThemeService } from '../theming/theme-service';
import { Action, ActionTracker } from '../tool/action-tracker';

export const NULL_ID = '_gs_null';
const ROOT_EL = '#root';
const VALUE_ATTRIBUTE = {name: 'value', parser: StringParser, selector: null};

export const ANIMATE_SLOT_ID = Symbol('animateSlot');
export const ANIMATE_CONTAINER_ID = Symbol('animateContainer');

/**
 * Switches the content depending on the value.
 */
@customElement({
  tag: 'gs-switch',
  templateKey: 'src/tool/switch',
})
export class Switch extends BaseThemedElement2 {
  constructor(
      @inject('theming.ThemeService') themeService: ThemeService,
      @inject('x.dom.document') private readonly document_: Document,
      @inject('x.dom.window') private readonly window_: Window) {
    super(themeService);
  }

  private applyKeyframe_(element: HTMLElement, keyframe: AnimationKeyframe): void {
    for (const key in keyframe) {
      element.style[key] = keyframe[key];
    }
  }

  private computeAnimations_(
      targetClientRect: ClientRect,
      circleCenter: Vector2d): {container: Animation, slot: Animation} {
    const corners = [
      Vector2d.of(targetClientRect.left, targetClientRect.top),
      Vector2d.of(targetClientRect.left, targetClientRect.top + targetClientRect.height),
      Vector2d.of(targetClientRect.left + targetClientRect.width, targetClientRect.top),
      Vector2d.of(
          targetClientRect.left + targetClientRect.width,
          targetClientRect.top + targetClientRect.height),
    ];
    const distances = corners
        .map((corner: Vector2d) => {
          return corner.add(circleCenter.mult(-1)).getLengthSquared();
        });
    const relativeCenter = circleCenter
        .add(Vector2d.of(targetClientRect.left, targetClientRect.top).mult(-1));
    const maxLength = Math.sqrt(Math.max(...distances));
    const minLength = Math.sqrt(Math.min(...distances));

    const containerAnimation = Animation.newInstance(
        [
          {
            height: `${2 * minLength}px`,
            left: `${relativeCenter.x - minLength}px`,
            top: `${relativeCenter.y - minLength}px`,
            width: `${2 * minLength}px`,
          },
          {
            height: `${2 * maxLength}px`,
            left: `${relativeCenter.x - maxLength}px`,
            top: `${relativeCenter.y - maxLength}px`,
            width: `${2 * maxLength}px`,
          },
        ],
        {duration: 600, easing: AnimationEasing.EASE_OUT_EXPO},
        ANIMATE_CONTAINER_ID);

    const slotAnimation = Animation.newInstance(
        [
          {
            left: `${minLength - relativeCenter.x}px`,
            top: `${minLength - relativeCenter.y}px`,
          },
          {
            left: `${maxLength - relativeCenter.x}px`,
            top: `${maxLength - relativeCenter.y}px`,
          },
        ],
        {duration: 600, easing: AnimationEasing.EASE_OUT_EXPO},
        ANIMATE_SLOT_ID);
    return {container: containerAnimation, slot: slotAnimation};
  }

  private getAnimationCircleCenter_(recentAction: Action | null): Vector2d {
    if (!recentAction) {
      return Vector2d.of(this.window_.innerWidth / 2, 0);
    }

    const actionType = recentAction.type;

    switch (actionType) {
      case 'click':
        return Vector2d.of(recentAction.x, recentAction.y);
      default:
        throw assertUnreachable(actionType);
    }
  }

  @onDom.event(ROOT_EL, 'gs-animationfinish')
  onAnimateContainerFinish_(@eventDetails() eventDetails: CustomEvent): void {
    const targetEl = eventDetails.target;
    if (!(targetEl instanceof HTMLElement)) {
      throw new Error(`${targetEl} is not an HTMLElement`);
    }

    const {id, keyframes} = eventDetails.detail as AnimationEventDetail;
    if (id !== ANIMATE_CONTAINER_ID) {
      return;
    }

    function *previousSiblings(element: Element): IterableIterator<Element> {
      let currentElement = element.previousElementSibling;
      while (currentElement) {
        yield currentElement;
        currentElement = element.previousElementSibling;
      }
    }

    for (const toRemove of previousSiblings(targetEl)) {
      toRemove.remove();
    }
    this.applyKeyframe_(targetEl, keyframes[keyframes.length - 1]);
  }

  @onDom.event(ROOT_EL, 'gs-animationfinish')
  onAnimateSlotFinish_(@eventDetails() eventDetails: CustomEvent): void {
    const targetEl = eventDetails.target;
    if (!(targetEl instanceof HTMLElement)) {
      throw new Error(`${targetEl} is not an HTMLElement`);
    }

    const {id, keyframes} = eventDetails.detail as AnimationEventDetail;
    if (id !== ANIMATE_SLOT_ID) {
      return;
    }

    this.applyKeyframe_(targetEl, keyframes[keyframes.length - 1]);
  }

  @onDom.dimensionChange(ROOT_EL)
  onRootDimensionChange_(
      @dom.element(ROOT_EL) rootEl: HTMLElement,
      @dom.attribute(VALUE_ATTRIBUTE) value: string | null): void {
    if (value === null) {
      return;
    }

    // Cancel all the animations.
    for (const childEl of ImmutableList.of(rootEl.children)) {
      childEl.remove();
    }

    const slotEl = this.document_.createElement('slot');
    slotEl.setAttribute('name', StringParser.stringify(value));
    rootEl.appendChild(slotEl);
  }

  @onDom.attributeChange(VALUE_ATTRIBUTE)
  onValueChange_(
      @dom.attribute(VALUE_ATTRIBUTE) value: string | null,
      @dom.element(ROOT_EL) rootEl: HTMLElement,
      @monad(ActionTracker) lastAction: Action): void {
    const slotName = value || NULL_ID;
    const id = slotName.replace(/[^a-z0-9A-Z]/g, '_');

    // Delete any animation with the same value.
    for (const oldEl of ImmutableList.of(rootEl.querySelectorAll(`div#${id}`))) {
      oldEl.remove();
    }
    const center = this.getAnimationCircleCenter_(lastAction);

    const boundingRect = rootEl.getBoundingClientRect();
    const {container: containerAnimation, slot: slotAnimation} =
        this.computeAnimations_(boundingRect, center);

    const slotEl = this.document_.createElement('slot');
    slotEl.setAttribute('name', StringParser.stringify(slotName));

    const slotContainerEl = this.document_.createElement('div');
    slotContainerEl.style.height = `${boundingRect.height}px`;
    slotContainerEl.style.width = `${boundingRect.width}px`;
    slotContainerEl.classList.add('slotContainer');
    slotContainerEl.appendChild(slotEl);

    const containerEl = this.document_.createElement('div');
    containerEl.id = id;
    containerEl.classList.add('container');
    containerEl.appendChild(slotContainerEl);
    rootEl.appendChild(containerEl);

    containerAnimation.start(this, `#${id}`);
    slotAnimation.start(this, `#${id} > *`);
  }
}
