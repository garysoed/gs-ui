import { BaseDisposable } from 'external/gs_tools/src/dispose';
import { bind, inject } from 'external/gs_tools/src/inject';
import { BooleanParser } from 'external/gs_tools/src/parse';


/**
 * Manages all the radio buttons in the document.
 */
@bind('input.RadioButtonService')
export class RadioButtonService extends BaseDisposable {
  constructor(
      @inject('x.dom.document') private readonly document_: Document) {
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
    const groupName = element.getAttribute('group-id');

    // If checked, uncheck any checked group.
    if (selected) {
      const button = this.document_
          .querySelector(`gs-radio-button[group-id="${groupName}"][checked="true"]`);
      if (button !== null && button !== element) {
        button.setAttribute('checked', BooleanParser.stringify(false));
      }
    }

    const currentChecked = BooleanParser.parse(element.getAttribute('checked'));
    if (currentChecked !== selected) {
      element.setAttribute('checked', BooleanParser.stringify(selected));
    }
  }
}
