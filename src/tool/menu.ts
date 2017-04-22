import { ListenableDom } from 'external/gs_tools/src/event';
import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser } from 'external/gs_tools/src/parse';
import {
  BaseElement,
  customElement,
  DomHook,
  hook } from 'external/gs_tools/src/webc';

import { Event } from '../const/event';

import { AnchorLocation } from './anchor-location';
import { AnchorLocationParser } from './anchor-location-parser';
import { OverlayService } from './overlay-service';


@customElement({
  attributes: {
    'gsAnchorPoint': AnchorLocationParser,
    'gsAnchorTarget': AnchorLocationParser,
  },
  dependencies: [
    OverlayService,
  ],
  tag: 'gs-menu',
  templateKey: 'src/tool/menu',
})
export class Menu extends BaseElement {
  @hook(null).attribute('gs-fit-parent-width', BooleanParser)
  private readonly gsFitParentWidthHook_: DomHook<boolean>;

  private readonly overlayService_: OverlayService;
  private menuRoot_: HTMLElement;

  constructor(@inject('gs.tool.OverlayService') overlayService: OverlayService) {
    super();
    this.overlayService_ = overlayService;
    this.gsFitParentWidthHook_ = DomHook.of<boolean>();
  }

  /**
   * Handler called when there is an action.
   */
  private onAction_(): void {
    let element = this.getElement();
    if (element === null) {
      return;
    }

    let elementTarget = element.getEventTarget();
    let parentElement = elementTarget.parentElement;
    let menuContent = <HTMLElement> elementTarget.querySelector('[gs-content]');

    if (!!this.gsFitParentWidthHook_.get()) {
      menuContent.style.width = `${parentElement.clientWidth}px`;
    }

    this.overlayService_.showOverlay(
        elementTarget,
        menuContent,
        parentElement,
        elementTarget['gsAnchorTarget'],
        elementTarget['gsAnchorPoint']);
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.menuRoot_ = <HTMLElement> element.shadowRoot.querySelector('.root');

    let listenableParentElement = ListenableDom.of(element.parentElement);
    this.addDisposable(listenableParentElement);
    this.listenTo(listenableParentElement, Event.ACTION, this.onAction_);
    if (element['gsAnchorTarget'] === null || element['gsAnchorTarget'] === undefined) {
      element['gsAnchorTarget'] = AnchorLocation.AUTO;
    }
    if (element['gsAnchorPoint'] === null || element['gsAnchorPoint'] === undefined) {
      element['gsAnchorPoint'] = AnchorLocation.AUTO;
    }
  }
}
