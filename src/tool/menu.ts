import {ListenableDom} from 'external/gs_tools/src/event';
import {inject} from 'external/gs_tools/src/inject';
import {BaseElement, customElement} from 'external/gs_tools/src/webc';

import {Event} from '../const/event';

import {AnchorLocation} from './anchor-location';
import {AnchorLocationParser} from './anchor-location-parser';
import {MenuService} from './menu-service';


@customElement({
  attributes: {
    'gsAnchorPoint': AnchorLocationParser,
    'gsAnchorTarget': AnchorLocationParser,
  },
  dependencies: [
    MenuService,
  ],
  tag: 'gs-menu',
  templateKey: 'src/tool/menu',
})
export class Menu extends BaseElement {
  private menuRoot_: HTMLElement;

  constructor(@inject('tool.MenuService') private menuService_: MenuService) {
    super();
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
    this.menuService_.showMenu(
        elementTarget,
        elementTarget.parentElement,
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
    this.addDisposable(
        listenableParentElement.on(Event.ACTION, this.onAction_, this));
    if (element['gsAnchorTarget'] === null || element['gsAnchorTarget'] === undefined) {
      element['gsAnchorTarget'] = AnchorLocation.AUTO;
    }
    if (element['gsAnchorPoint'] === null || element['gsAnchorPoint'] === undefined) {
      element['gsAnchorPoint'] = AnchorLocation.AUTO;
    }
  }
}
