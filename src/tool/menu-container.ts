import {AnchorLocation} from './anchor-location';
import {AnchorLocationParser} from './anchor-location-parser';
import {
  Animation,
  AnimationEasing,
  BaseElement,
  CustomElement,
  FloatParser} from '../../external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';
import {Inject} from '../../external/gs_tools/src/inject';
import {Jsons} from '../../external/gs_tools/src/collection';


@CustomElement({
  attributes: {
    'gsAnchorTargetX': FloatParser,
    'gsAnchorTargetY': FloatParser,
    'gsAnchorPoint': AnchorLocationParser,
  },
  tag: 'gs-menu-container',
  templateKey: 'src/tool/menu-container',
})
export class MenuContainer extends BaseElement {
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
      {duration: 100, easing: AnimationEasing.LINEAR});


  private static SHOW_CLASS_: string = 'show';

  private containerEl_: HTMLElement;
  private contentEl_: HTMLElement;
  private document_: Document;
  private element_: HTMLElement;
  private rootEl_: HTMLElement;

  constructor(
      @Inject('x.dom.window') private windowEl_: Window = window) {
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
    let anchorPoint = this.element_['gsAnchorPoint'];
    if (this.element_['gsAnchorPoint'] !== AnchorLocation.AUTO) {
      return anchorPoint;
    }

    let normalizedX = this.element_['gsAnchorTargetX'] / this.document_.documentElement.clientWidth;
    let normalizedY = this.element_['gsAnchorTargetY'] /
        this.document_.documentElement.clientHeight;
    if (normalizedX > 0.5) {
      if (normalizedY > 0.5) {
        return AnchorLocation.BOTTOM_RIGHT;
      } else {
        return AnchorLocation.TOP_RIGHT;
      }
    } else {
      if (normalizedY > 0.5) {
        return AnchorLocation.BOTTOM_LEFT;
      } else {
        return AnchorLocation.TOP_LEFT;
      }
    }
  }

  /**
   * Hides the menu container.
   */
  private hide_(): void {
    let animate = MenuContainer.HIDE_ANIMATION_.applyTo(this.containerEl_);
    let listenableAnimate = ListenableDom.of(animate);
    this.addDisposable(listenableAnimate);
    this.addDisposable(listenableAnimate
        .once(
            DomEvent.FINISH,
            () => {
              this.rootEl_.classList.remove(MenuContainer.SHOW_CLASS_);
            }));
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
    let distributedNodes = this.contentEl_.getDistributedNodes();
    if (distributedNodes.length <= 0) {
      return;
    }
    let distributedElement = distributedNodes[0];

    // Temporarily displays the root element for measurement.
    Jsons.setTemporaryValue(
        this.rootEl_,
        {
          'style.display': 'block',
          'style.visibility': 'hidden',
        },
        () => {
          contentHeight = distributedElement.clientHeight;
          contentWidth = distributedElement.clientWidth;
        });
    MenuContainer.BASE_SHOW_ANIMATION_
        .appendKeyframe({height: `${contentHeight}px`, opacity: 1, width: `${contentWidth}px`})
        .applyTo(this.containerEl_);

    this.rootEl_.classList.add(MenuContainer.SHOW_CLASS_);
  }

  /**
   * Resets the location of the container element based on the anchor point and the anchor target.
   */
  private updateContent_(): void {
    let anchorTargetX = this.element_['gsAnchorTargetX'];
    let anchorTargetY = this.element_['gsAnchorTargetY'];

    if (anchorTargetX === null || anchorTargetY === null) {
      // Do nothing if the anchor target is not defined.
      return;
    }

    // Resets the location of the container.
    this.containerEl_.style.top = '';
    this.containerEl_.style.right = '';
    this.containerEl_.style.bottom = '';
    this.containerEl_.style.left = '';

    let viewportHeight = this.windowEl_.innerHeight;
    let viewportWidth = this.windowEl_.innerWidth;
    let anchorPoint = this.getAnchorPoint_();

    // Vertical offset
    switch (anchorPoint) {
      case AnchorLocation.BOTTOM_LEFT:
      case AnchorLocation.BOTTOM_RIGHT:
        this.containerEl_.style.bottom = `${viewportHeight - anchorTargetY}px`;
        break;
      case AnchorLocation.TOP_LEFT:
      case AnchorLocation.TOP_RIGHT:
        this.containerEl_.style.top = `${anchorTargetY}px`;
        break;
    }

    // Horizontal offset
    switch (anchorPoint) {
      case AnchorLocation.BOTTOM_LEFT:
      case AnchorLocation.TOP_LEFT:
        this.containerEl_.style.left = `${anchorTargetX}px`;
        break;
      case AnchorLocation.BOTTOM_RIGHT:
      case AnchorLocation.TOP_RIGHT:
        this.containerEl_.style.right = `${viewportWidth - anchorTargetX}px`;
        break;
    }
  }

  /**
   * @override
   */
  onAttributeChanged(attrName: string, oldValue: string, newValue: string): void {
    switch (attrName) {
      case 'gs-anchor-point':
      case 'gs-anchor-target-x':
      case 'gs-anchor-target-y':
        this.updateContent_();
        break;
    }
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    this.containerEl_ = <HTMLElement> element.shadowRoot.querySelector('.container');
    this.contentEl_ = <HTMLElement> element.shadowRoot.querySelector('content');
    this.document_ = element.ownerDocument;
    this.element_ = element;
    this.rootEl_ = <HTMLElement> element.shadowRoot.querySelector('.root');

    element['hide'] = this.hide_.bind(this);
    element['show'] = this.show_.bind(this);
  }

  /**
   * @override
   */
  onInserted(): void {
    let listenableWindow = ListenableDom.of(this.windowEl_);
    this.addDisposable(listenableWindow);
    this.addDisposable(listenableWindow.on(DomEvent.RESIZE, this.onWindowResize_.bind(this)));
    this.updateContent_();
  }
}
