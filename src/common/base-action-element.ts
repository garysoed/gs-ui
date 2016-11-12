import {BaseElement} from 'external/gs_tools/src/webc';
import {DomEvent} from 'external/gs_tools/src/event';

import {Event} from '../const/event';


export class BaseActionElement extends BaseElement {
  /**
   * Handler called when the element is clicked.
   */
  protected onClick_(): void {
    let element = this.getElement();
    if (!this.isDisabled() && element !== null) {
      element.dispatch(Event.ACTION, () => {});
    }
  }

  /**
   * @return True iff the element is disabled.
   */
  isDisabled(): boolean {
    let element = this.getElement();
    return element === null || element.getEventTarget().getAttribute('disabled') !== null;
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    element.classList.add('gs-action');

    // TODO: use annotation.
    this.addDisposable(this.getElement()!.on(DomEvent.CLICK, this.onClick_.bind(this)));
  }
}
