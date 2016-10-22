import {BaseActionElement} from '../common/base-action-element';
import {
  BooleanParser,
  customElement,
  StringParser} from '../../external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from '../../external/gs_tools/src/event';


@customElement({
  attributes: {
    'disabled': BooleanParser,
    'gsPlaceHolder': StringParser,
    'gsValue': StringParser,
  },
  tag: 'gs-text-input',
  templateKey: 'src/input/text-input',
})
export class TextInput extends BaseActionElement {
  private listenableInputEl_: ListenableDom<HTMLInputElement> | null = null;

  constructor() {
    super();
  }

  /**
   * @override
   */
  protected onClick_(): void {
    super.onClick_();
    if (this.listenableInputEl_ !== null && !this.isDisabled()) {
      this.listenableInputEl_.getEventTarget().click();
      this.listenableInputEl_.getEventTarget().focus();
    }
  }

  /**
   * Handler called when the input element fires a change event.
   */
  protected onInputChange_(): void {
    if (this.listenableInputEl_ !== null) {
      this.setAttribute('gsValue', this.listenableInputEl_.getEventTarget().value);
    }

    let element = this.getElement();
    if (element !== null) {
      element.dispatch(DomEvent.CHANGE);
    }
  }

  /**
   * @override
   */
  onAttributeChanged(attrName: string, oldValue: string, newValue: string): void {
    super.onAttributeChanged(attrName, oldValue, newValue);
    switch (attrName) {
      case 'disabled':
        if (this.listenableInputEl_ !== null) {
          this.listenableInputEl_.getEventTarget().disabled = this.isDisabled();
        }
        break;
      case 'gsValue':
        if (this.listenableInputEl_ !== null) {
          this.listenableInputEl_.getEventTarget().value = newValue;
        }
        break;
    }
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.listenableInputEl_ = ListenableDom.of(
        element.shadowRoot.querySelector('input'));
    this.addDisposable(this.listenableInputEl_);
    this.addDisposable(
        this.listenableInputEl_.on(DomEvent.CHANGE, this.onInputChange_.bind(this)));

    // TODO: Move this to utility.
    this.onAttributeChanged('gsValue', '', element.getAttribute('gs-value') || '');
    this.onAttributeChanged('disabled', '', element.getAttribute('disabled') || '');
  }
}
