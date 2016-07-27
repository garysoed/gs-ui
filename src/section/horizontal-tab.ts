import {
  Animation,
  AnimationEasing,
  BaseElement,
  CustomElement,
  StringParser} from '../../external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';
import {Interval} from '../../external/gs_tools/src/async';


@CustomElement({
  attributes: {
    'gsSelectedTab': StringParser,
  },
  tag: 'gs-horizontal-tab',
  templateKey: 'src/section/horizontal-tab',
})
export class HorizontalTab extends BaseElement {
  private element_: ListenableDom<HTMLElement>;
  private highlightContainerEl_: ListenableDom<HTMLElement>;
  private highlightEl_: ListenableDom<HTMLElement>;
  private highlightLeft_: number = 0;
  private highlightWidth_: number = 0;
  private interval_: Interval;
  private mutationObserver_: MutationObserver = new MutationObserver(this.onMutate_.bind(this));
  private tabContainer_: ListenableDom<HTMLElement>;

  constructor() {
    super();
    this.interval_ = Interval.newInstance(350);
    this.addDisposable(this.interval_);
  }

  private onMutate_(): void {
    this.updateHighlight_();
  }

  private onTick_(): void {
    this.updateHighlight_();
  }

  private setHighlight_(left: number, width: number): void {
    if (left === this.highlightLeft_ && width === this.highlightWidth_) {
      return;
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
    let highlightEl = this.highlightEl_.eventTarget;
    let animate = ListenableDom.of(animation.applyTo(highlightEl));
    this.addDisposable(animate);
    this.addDisposable(animate.once(DomEvent.FINISH, () => {
      highlightEl.style.left = `${left}px`;
      highlightEl.style.width = `${width}px`;
      this.highlightLeft_ = left;
      this.highlightWidth_ = width;
    }));
  }

  private updateHighlight_(): void {
    let selectedId = this.element_.eventTarget['gsSelectedTab'];
    let destinationLeft;
    let destinationWidth;
    if (selectedId) {
      let selectedTab = <HTMLElement> this.element_.eventTarget
          .querySelector(`[gs-tab-id="${selectedId}"]`);
      destinationLeft = selectedTab.offsetLeft;
      destinationWidth = selectedTab.clientWidth;
    } else {
      destinationLeft = this.highlightLeft_ + this.highlightWidth_ / 2;
      destinationWidth = this.highlightWidth_;
    }

    this.setHighlight_(destinationLeft, destinationWidth);
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    let shadowRoot = element.shadowRoot;
    this.element_ = ListenableDom.of(element);
    this.highlightContainerEl_ = ListenableDom
        .of(<HTMLElement> shadowRoot.querySelector('.highlight-container'));
    this.highlightEl_ = ListenableDom.of(<HTMLElement> shadowRoot.querySelector('.highlight'));
    this.tabContainer_ = ListenableDom.of(<HTMLElement> shadowRoot.querySelector('.tab-container'));

    this.addDisposable(
        this.interval_.on(Interval.TICK_EVENT, this.onTick_.bind(this)));
    this.interval_.start();
    this.mutationObserver_.observe(element, {childList: true});

    this.addDisposable(
        this.element_,
        this.highlightContainerEl_,
        this.highlightEl_,
        this.tabContainer_);
  }
}
