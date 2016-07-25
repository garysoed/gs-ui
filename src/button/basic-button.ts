import {BaseElement, CustomElement} from '../../external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';
import {Event} from '../const/event';


@CustomElement({
  tag: 'gs-basic-button',
  templateKey: 'src/button/basic-button',
})
export class BasicButton extends BaseElement {
  private onElementClick_(listenableElement: ListenableDom<HTMLElement>): void {
    if (listenableElement.eventTarget.getAttribute('disabled') === null) {
      listenableElement.dispatch(Event.ACTION, () => {});
    }
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    element.classList.add('gs-action');

    let listenableElement = ListenableDom.of(element);
    this.addDisposable(listenableElement);
    this.addDisposable(listenableElement.on(
        DomEvent.CLICK,
        this.onElementClick_.bind(this, listenableElement)));
  }
}
