import {
  bind,
  BooleanParser,
  customElement,
  DomBridge,
  handle,
  StringParser} from 'external/gs_tools/src/webc';
import {DomEvent, ListenableDom} from 'external/gs_tools/src/event';

import {BaseActionElement} from '../common/base-action-element';


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
  @bind.host.attribute(null, 'gs-value')
  private gsValueBridge_: DomBridge<string>;

  @bind.shadow.attribute('input[type="text"]', 'disabled')
  private inputDisabledBridge_: DomBridge<boolean>;

  private inputEl_: HTMLInputElement | null = null;

  constructor() {
    super();
    this.gsValueBridge_ = DomBridge.of(StringParser);
    this.inputDisabledBridge_ = DomBridge.of(BooleanParser, true);
  }

  /**
   * @override
   */
  protected onClick_(): void {
    super.onClick_();
    if (this.inputEl_ !== null && !this.isDisabled()) {
      // TODO: Bind element.
      this.inputEl_.click();
      this.inputEl_.focus();
    }
  }

  /**
   * Handles event when the value of gs-value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  @handle.host.attributeChange(null, 'gs-value', StringParser)
  protected onGsValueChange_(newValue: string): void {
    if (this.inputEl_ !== null) {
      // TODO: Make a DOM bridge.
      this.inputEl_.value = newValue;
    }
  }

  /**
   * Handles event when the value of disabled attribute was changed.
   *
   * @param newValue The value of the disabled attribute..
   */
  @handle.host.attributeChange(null, 'disabled', BooleanParser)
  protected onDisabledChange_(newValue: boolean): void {
    this.inputDisabledBridge_.set(newValue);
  }

  /**
   * Handler called when the input element fires a change event.
   */
  @handle.host.event('input', DomEvent.CHANGE)
  protected onInputChange_(): void {
    if (this.inputEl_ !== null) {
      this.gsValueBridge_.set(this.inputEl_.value);
    }

    let element = this.getElement();
    if (element !== null) {
      element.dispatch(DomEvent.CHANGE);
    }
  }

  /**
   * @override
   */
  onCreated(element: HTMLElement): void {
    super.onCreated(element);
    this.inputEl_ = element.shadowRoot.querySelector('input');
  }
}
