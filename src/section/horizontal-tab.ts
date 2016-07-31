import {
  Animation,
  AnimationEasing,
  BaseElement,
  CustomElement,
  StringParser} from '../../external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';
import {Interval, sequenced} from '../../external/gs_tools/src/async';


@CustomElement({
  attributes: {
    'gsSelectedTab': StringParser,
  },
  tag: 'gs-horizontal-tab',
  templateKey: 'src/section/horizontal-tab',
})
export class HorizontalTab extends BaseElement {
  static CHANGE_EVENT: string = 'gse-tab-change';

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
    this.interval_ = Interval.newInstance(500);
    this.addDisposable(this.interval_);
  }

  private onAction_(event: Event): void {
    let target = <HTMLElement> event.target;
    this.element_.eventTarget['gsSelectedTab'] = target.getAttribute('gs-tab-id');
  }

  private onMutate_(): void {
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
    let highlightEl = this.highlightEl_.eventTarget;
    let animate = ListenableDom.of(animation.applyTo(highlightEl));
    this.addDisposable(animate);
    return new Promise<void>((resolve: () => void) => {
      this.addDisposable(animate.once(DomEvent.FINISH, () => {
        highlightEl.style.left = `${left}px`;
        highlightEl.style.width = `${width}px`;
        this.highlightLeft_ = left;
        this.highlightWidth_ = width;
        resolve();
      }));
    });
  }

  @sequenced()
  private updateHighlight_(): Promise<void> {
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

    return this.setHighlight_(destinationLeft, destinationWidth);
  }

  /**
   * @override
   */
  onAttributeChanged(attrName: string): void {
    switch (attrName) {
      case 'gs-selected-tab':
        this.element_.dispatch(HorizontalTab.CHANGE_EVENT, () => {});
        this.updateHighlight_();
        break;
    }
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

  /**
   * @override
   */
  onInserted(): void {
    this.element_.on('gse-action', this.onAction_.bind(this));
  }
}
