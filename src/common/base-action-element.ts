import { DomEvent } from 'external/gs_tools/src/event';
import { handle } from 'external/gs_tools/src/webc';

import { BaseThemedElement } from '../common/base-themed-element';
import { Event } from '../const/event';


export class BaseActionElement extends BaseThemedElement {

  /**
   * @return True iff the element is disabled.
   */
  isDisabled(): boolean {
    const element = this.getElement();
    return element === null || element.getEventTarget().getAttribute('disabled') !== null;
  }

  /**
   * Handler called when the element is clicked.
   * TODO: This makes no sense.
   */
  @handle(null).event(DomEvent.CLICK)
  protected onClick_(): void {
    const element = this.getElement();
    if (!this.isDisabled() && element !== null) {
      element.dispatch(Event.ACTION, () => {});
    }
  }
}
