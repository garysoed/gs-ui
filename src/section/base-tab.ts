import { atomic, Interval } from 'external/gs_tools/src/async';
import { DomEvent, ListenableDom } from 'external/gs_tools/src/event';
import {
  Animation,
  AnimationEasing,
  bind,
  DomHook,
  handle } from 'external/gs_tools/src/webc';

import { StringParser } from 'external/gs_tools/src/parse';
import { BaseThemedElement } from '../common/base-themed-element';
import { Event } from '../const/event';
import { ThemeService } from '../theming/theme-service';


export abstract class BaseTab extends BaseThemedElement {
  static CHANGE_EVENT: string = 'gse-tab-change';

  @bind(null).attribute('gs-selected-tab', StringParser)
  readonly selectedTabHook_: DomHook<string>;

  private highlightContainerEl_: ListenableDom<HTMLElement>;
  private highlightEl_: HTMLElement;
  private highlightStart_: number = 0;
  private highlightLength_: number = 0;
  private interval_: Interval;
  private mutationObserver_: MutationObserver = new MutationObserver(this.onMutate_.bind(this));
  private tabContainer_: ListenableDom<HTMLElement>;

  constructor(themeService: ThemeService) {
    super(themeService);
    this.interval_ = Interval.newInstance(500);
    this.selectedTabHook_ = DomHook.of<string>();
    this.addDisposable(this.interval_);
  }

  private onAction_(event: Event): void {
    const target = <HTMLElement> event.target;
    this.selectedTabHook_.set(target.getAttribute('gs-tab-id') || '');
  }

  private onMutate_(): void {
    this.updateHighlight_();
  }

  /**
   * Handles event when the gs-selected-tab attribute was changed.
   */
  @handle(null).attributeChange('gs-selected-tab', StringParser)
  protected onSelectedTabChanged_(): void {
    const element = this.getElement();
    if (element !== null) {
      element.dispatch(BaseTab.CHANGE_EVENT, () => {});
    }
    this.updateHighlight_();
  }

  private onTick_(): void {
    this.updateHighlight_();
  }

  /**
   * Sets the highlight to move to the given position and length.
   * @param start Start position to move the highlight element to.
   * @param length Length to stretch the highlight element to.
   * @return Promise that will be resolved when the animation is compconsted.
   */
  private setHighlight_(start: number, length: number): Promise<void> {
    if (start === this.highlightStart_ && length === this.highlightLength_) {
      return Promise.resolve();
    }

    if (this.highlightLength_ === 0) {
      this.highlightStart_ = start + length / 2;
    }
    const animation = Animation.newInstance(
        [
          this.getAnimationKeyframe(this.highlightStart_, this.highlightLength_),
          this.getAnimationKeyframe(start, length),
        ],
        {duration: 300, easing: AnimationEasing.EASE_OUT_EXPO});
    const animate = ListenableDom.of(animation.applyTo(this.highlightEl_));
    this.addDisposable(animate);
    return new Promise<void>((resolve: () => void) => {
      this.addDisposable(animate.once(DomEvent.FINISH, () => {
        this.setHighlightEl(start, length, this.highlightEl_);
        this.highlightStart_ = start;
        this.highlightLength_ = length;
        resolve();
      }, this));
    });
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

  /**
   * Updates the given highlight element with the start position and length.
   *
   * @param start Start position to set the highlight element to.
   * @param length Length to set the highlight element to.
   * @param highlightEl Element to update.
   */
  protected abstract setHighlightEl(start: number, length: number, highlightEl: HTMLElement): void;

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    const shadowRoot = element.shadowRoot;
    this.highlightContainerEl_ = ListenableDom
        .of(<HTMLElement> shadowRoot.querySelector('.highlight-container'));
    this.highlightEl_ = <HTMLElement> shadowRoot.querySelector('.highlight');
    this.tabContainer_ = ListenableDom.of(<HTMLElement> shadowRoot.querySelector('.tab-container'));

    this.listenTo(this.interval_, Interval.TICK_EVENT, this.onTick_);
    this.interval_.start();
    this.mutationObserver_.observe(element, {childList: true});

    this.addDisposable(
        this.highlightContainerEl_,
        this.tabContainer_);
  }

  /**
   * @override
   */
  onInserted(): void {
    const element = this.getElement();
    if (element !== null) {
      this.listenTo(element, Event.ACTION, this.onAction_);
    }
  }

  @atomic()
  private updateHighlight_(): Promise<void> {
    const selectedId = this.selectedTabHook_.get();
    let destinationStart;
    let destinationHeight;
    const element = this.getElement();
    if (element === null) {
      return Promise.reject('No elements are found');
    }

    if (selectedId !== null) {
      const selectedTab = element.getEventTarget()
          .querySelector(`[gs-tab-id="${selectedId}"]`) as HTMLElement;
      destinationStart = this.getStartPosition(selectedTab);
      destinationHeight = this.getLength(selectedTab);
    } else {
      destinationStart = this.highlightStart_ + this.highlightLength_ / 2;
      destinationHeight = this.highlightLength_;
    }

    return this.setHighlight_(destinationStart, destinationHeight);
  }
}
