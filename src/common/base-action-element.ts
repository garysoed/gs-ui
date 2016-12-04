import {DomEvent} from 'external/gs_tools/src/event';
import {handle} from 'external/gs_tools/src/webc';

import {BaseThemedElement} from '../common/base-themed-element';
import {Event} from '../const/event';


export class BaseActionElement extends BaseThemedElement {
  /**
   * Handler called when the element is clicked.
   */
  @handle.host.event(null, DomEvent.CLICK)
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
}
