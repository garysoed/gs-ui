import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { bind, inject } from 'external/gs_tools/src/inject';


/**
 * Manages all the radio buttons in the document.
 */
@bind('input.RadioButtonService')
export class RadioButtonService extends BaseDisposable {
  constructor(
      @inject('x.dom.document') private document_: Document) {
    super();
  }

  /**
   * Sets the given radio button element to be checked / unchecked.
   * @param element The radio button element to be set as selected / unselected.
   * @param selected True iff the element should be selected.
   */
  setSelected(element: HTMLElement, selected: boolean): void {
    if (element.nodeName.toLocaleLowerCase() !== 'gs-radio-button') {
      throw new Error('element is expected to be named "gs-radio-button"');
    }
    const groupName = element.getAttribute('gs-group');

    // If checked, uncheck any checked group.
    if (selected) {
      const button = this.document_
          .querySelector(`gs-radio-button[gs-group="${groupName}"][gs-checked="true"]`);
      if (button !== null && button !== element) {
        button['gsChecked'] = false;
      }
    }

    if (element['gsChecked'] !== selected) {
      element['gsChecked'] = selected;
    }
  }
}
// TODO: Mutable
