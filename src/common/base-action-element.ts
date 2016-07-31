import {BaseElement} from '../../external/gs_tools/src/webc';
import {Event} from '../const/event';
import {DomEvent} from '../../external/gs_tools/src/event';


export class BaseActionElement extends BaseElement {
  protected onClick_(): void {
    if (!this.isDisabled) {
      this.element.dispatch(Event.ACTION, () => {});
    }
  }

  get isDisabled(): boolean {
    return this.element.eventTarget.getAttribute('disabled') !== null;
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    element.classList.add('gs-action');

    this.addDisposable(this.element.on(DomEvent.CLICK, this.onClick_.bind(this)));
  }
}
