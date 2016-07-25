import {AnchorLocation} from './anchor-location';
import {AnchorLocationParser} from './anchor-location-parser';
import {BaseElement, CustomElement} from '../../external/gs_tools/src/webc';
import {Event} from '../const/event';
import {ListenableDom} from '../../external/gs_tools/src/event';
import {Inject} from '../../external/gs_tools/src/inject';
import {MenuService} from './menu-service';


@CustomElement({
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
  private element_: ListenableDom<HTMLElement>;
  private menuRoot_: HTMLElement;

  constructor(@Inject('tool.MenuService') private menuService_: MenuService) {
    super();
  }

  private onAction_(): void {
    let element = this.element_.eventTarget;
    this.menuService_.showMenu(
        element,
        element.parentElement,
        element['gsAnchorTarget'],
        element['gsAnchorPoint']);
  }

  onCreated(element: HTMLElement): void {
    this.element_ = ListenableDom.of(element);
    this.addDisposable(this.element_);

    this.menuRoot_ = <HTMLElement> element.shadowRoot.querySelector('.root');

    let listenableParentElement = ListenableDom.of(element.parentElement);
    this.addDisposable(listenableParentElement);
    this.addDisposable(
        listenableParentElement.on(Event.ACTION, this.onAction_.bind(this)));
    if (element['gsAnchorTarget'] === null || element['gsAnchorTarget'] === undefined) {
      element['gsAnchorTarget'] = AnchorLocation.AUTO;
    }
    if (element['gsAnchorPoint'] === null || element['gsAnchorPoint'] === undefined) {
      element['gsAnchorPoint'] = AnchorLocation.AUTO;
    }
  }
}
