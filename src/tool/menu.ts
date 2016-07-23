import {BaseElement, CustomElement} from '../../external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';


@CustomElement({
  tag: 'gs-menu',
  templateKey: 'src/tool/menu',
})
export class Menu extends BaseElement {
  private menuRoot_: HTMLElement;

  private onClick_(): void {
  }

  onCreated(element: HTMLElement): void {
    this.menuRoot_ = <HTMLElement> element.shadowRoot.querySelector('.root');
    this.addDisposable(
        ListenableDom.of(element.parentElement).on(DomEvent.CLICK, this.onClick_.bind(this)));
    // TODO: Watch for disabled attribute.
  }
}
