import {
  Animation,
  AnimationEasing,
  BaseElement,
  customElement,
  handle,
  StringParser} from 'external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from 'external/gs_tools/src/event';
import {Interval, sequenced} from 'external/gs_tools/src/async';

import {Event} from '../const/event';


@customElement({
  attributes: {
    'gsSelectedTab': StringParser,
  },
  tag: 'gs-horizontal-tab',
  templateKey: 'src/section/horizontal-tab',
})
export class HorizontalTab extends BaseElement {
  static CHANGE_EVENT: string = 'gse-tab-change';

  private highlightContainerEl_: ListenableDom<HTMLElement>;
  private highlightEl_: ListenableDom<HTMLElement>;
  private highlightLeft_: number = 0;
  private highlightWidth_: number = 0;
  private interval_: Interval;
  private mutationObserver_: MutationObserver = new MutationObserver(this.onMutate_.bind(this));
  private tabContainer_: ListenableDom<HTMLElement>;

  constructor() {
    super();
    this.interval_ = Interval.newInstance(500);
    this.addDisposable(this.interval_);
  }

  private onAction_(event: Event): void {
    let target = <HTMLElement> event.target;
    this.setAttribute('gsSelectedTab', target.getAttribute('gs-tab-id') || '');
  }

  private onMutate_(): void {
    this.updateHighlight_();
  }

  /**
   * Handles event when the gs-selected-tab attribute was changed.
   */
  @handle(null).attributeChange('gs-selected-tab', StringParser)
  protected onSelectedTabChanged_(): void {
    let element = this.getElement();
    if (element !== null) {
      element.dispatch(HorizontalTab.CHANGE_EVENT, () => {});
    }
    this.updateHighlight_();
  }

  private onTick_(): void {
    this.updateHighlight_();
  }

  private setHighlight_(left: number, width: number): Promise<void> {
    if (left === this.highlightLeft_ && width === this.highlightWidth_) {
      return Promise.resolve();
    }

    if (this.highlightWidth_ === 0) {
      this.highlightLeft_ = left + width / 2;
    }
    let animation = Animation.newInstance(
        [
          {left: `${this.highlightLeft_}px`, width: `${this.highlightWidth_}px`},
          {left: `${left}px`, width: `${width}px`},
        ],
        {duration: 300, easing: AnimationEasing.EASE_OUT_EXPO});
    let highlightEl = this.highlightEl_.getEventTarget();
    let animate = ListenableDom.of(animation.applyTo(highlightEl));
    this.addDisposable(animate);
    return new Promise<void>((resolve: () => void) => {
      this.addDisposable(animate.once(DomEvent.FINISH, () => {
        highlightEl.style.left = `${left}px`;
        highlightEl.style.width = `${width}px`;
        this.highlightLeft_ = left;
        this.highlightWidth_ = width;
        resolve();
      }, this));
    });
  }

  @sequenced()
  private updateHighlight_(): Promise<void> {
    let selectedId = this.getAttribute('gsSelectedTab');
    let destinationLeft;
    let destinationWidth;
    let element = this.getElement();
    if (element === null) {
      return Promise.reject('No elements are found');
    }

    if (selectedId) {
      let selectedTab = <HTMLElement> element.getEventTarget()
          .querySelector(`[gs-tab-id="${selectedId}"]`);
      destinationLeft = selectedTab.offsetLeft;
      destinationWidth = selectedTab.clientWidth;
    } else {
      destinationLeft = this.highlightLeft_ + this.highlightWidth_ / 2;
      destinationWidth = this.highlightWidth_;
    }

    return this.setHighlight_(destinationLeft, destinationWidth);
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    let shadowRoot = element.shadowRoot;
    this.highlightContainerEl_ = ListenableDom
        .of(<HTMLElement> shadowRoot.querySelector('.highlight-container'));
    this.highlightEl_ = ListenableDom.of(<HTMLElement> shadowRoot.querySelector('.highlight'));
    this.tabContainer_ = ListenableDom.of(<HTMLElement> shadowRoot.querySelector('.tab-container'));

    this.addDisposable(
        this.interval_.on(Interval.TICK_EVENT, this.onTick_, this));
    this.interval_.start();
    this.mutationObserver_.observe(element, {childList: true});

    this.addDisposable(
        this.highlightContainerEl_,
        this.highlightEl_,
        this.tabContainer_);
  }

  /**
   * @override
   */
  onInserted(): void {
    let element = this.getElement();
    if (element !== null) {
      element.on(Event.ACTION, this.onAction_, this);
    }
  }
}
