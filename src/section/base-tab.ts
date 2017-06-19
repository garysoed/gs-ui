import { Interval } from 'external/gs_tools/src/async';
import { event, on } from 'external/gs_tools/src/event';
import { DispatchFn } from 'external/gs_tools/src/interfaces';
import { StringParser } from 'external/gs_tools/src/parse';
import {
  Animation,
  AnimationEasing,
  dom,
  onDom,
  onLifecycle} from 'external/gs_tools/src/webc';

import { BaseThemedElement2 } from '../common/base-themed-element2';
import { ThemeService } from '../theming/theme-service';

const HIGHLIGHT_MOVE_ANIMATION = Symbol('move');

export const HIGHLIGHT_EL = '#highlight';
const SELECTED_TAB_ATTR = {name: 'gs-selected-tab', parser: StringParser, selector: null};

export abstract class BaseTab extends BaseThemedElement2 {
  static CHANGE_EVENT: string = 'gs-tab-change';

  private readonly interval_: Interval;

  constructor(themeService: ThemeService) {
    super(themeService);
    this.interval_ = Interval.newInstance(500);
    this.addDisposable(this.interval_);
  }

  /**
   * @param start The start position of the element.
   * @param length The length of the element.
   * @return Animation keyframe object with the start and length of the animated element.
   */
  protected abstract getAnimationKeyframe(start: number, length: number): AnimationKeyframe;

  /**
   * @param element Element whose length should be returned.
   * @return Length of the given element.
   */
  protected abstract getLength(element: HTMLElement): number;

  /**
   * @param element Element whose start position should be returned.
   * @return The start position of the given element.
   */
  protected abstract getStartPosition(element: HTMLElement): number;

  @onDom.animate(HIGHLIGHT_EL, 'finish', HIGHLIGHT_MOVE_ANIMATION)
  onAnimationFinish_(
      @event() {keyframes}: {keyframes: AnimationKeyframe[]},
      @dom.element(HIGHLIGHT_EL) highlightEl: HTMLElement): void {
    const {start, length} = this.parseAnimationKeyframe(keyframes[keyframes.length - 1]);
    this.setHighlightEl(start, length, highlightEl);
  }

  @onLifecycle('create')
  onCreated(): void {
    this.interval_.start();
  }

  @onDom.attributeChange(SELECTED_TAB_ATTR)
  onSelectedTabChanged_(@dom.eventDispatcher() dispatcher: DispatchFn<{}>): void {
    dispatcher(BaseTab.CHANGE_EVENT, {});
  }

  protected abstract parseAnimationKeyframe(keyframe: AnimationKeyframe):
      {length: number, start: number};

  /**
   * Sets the highlight to move to the given position and length.
   * @param start Start position to move the highlight element to.
   * @param length Length to stretch the highlight element to.
   * @return Promise that will be resolved when the animation is compconsted.
   */
  private setHighlight_(
      targetStart: number,
      targetLength: number,
      highlightStart: number,
      highlightLength: number): void {
    if (targetStart === highlightStart && targetLength === highlightLength) {
      return;
    }

    if (highlightLength === 0) {
      highlightStart = targetStart + targetLength / 2;
    }
    const animation = Animation.newInstance(
        [
          this.getAnimationKeyframe(highlightStart, highlightLength),
          this.getAnimationKeyframe(targetStart, targetLength),
        ],
        {duration: 300, easing: AnimationEasing.EASE_OUT_EXPO},
        HIGHLIGHT_MOVE_ANIMATION);
    animation.start(this, HIGHLIGHT_EL);
  }

  /**
   * Updates the given highlight element with the start position and length.
   *
   * @param start Start position to set the highlight element to.
   * @param length Length to set the highlight element to.
   * @param highlightEl Element to update.
   */
  protected abstract setHighlightEl(start: number, length: number, highlightEl: HTMLElement): void;

  @on((instance: BaseTab) => instance.interval_, 'tick')
  @onDom.childListChange(null)
  @onDom.attributeChange(SELECTED_TAB_ATTR)
  updateHighlight_(
      @dom.attribute(SELECTED_TAB_ATTR) selectedId: string | null,
      @dom.element(null) element: HTMLElement,
      @dom.element(HIGHLIGHT_EL) highlightEl: HTMLElement): void {
    let targetStart;
    let targetLength;
    const highlightStart = this.getStartPosition(highlightEl);
    const highlightLength = this.getLength(highlightEl);

    if (selectedId !== null) {
      const selectedTab =
          element.querySelector(`[gs-tab-id="${selectedId}"]`) as HTMLElement | null;
      if (!selectedTab) {
        return;
      }

      targetStart = this.getStartPosition(selectedTab);
      targetLength = this.getLength(selectedTab);
    } else {
      targetStart = highlightStart + highlightLength / 2;
      targetLength = highlightLength;
    }

    this.setHighlight_(targetStart, targetLength, highlightStart, highlightLength);
  }
}
