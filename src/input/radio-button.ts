import {BaseActionElement} from '../common/base-action-element';
import {
  bind,
  BooleanParser,
  customElement,
  DomBridge,
  handle,
  StringParser} from '../../external/gs_tools/src/webc';
import {inject} from '../../external/gs_tools/src/inject';
import {RadioButtonService} from './radio-button-service';


@customElement({
  attributes: {
    'gsChecked': BooleanParser,
    'gsGroup': StringParser,
  },
  dependencies: [RadioButtonService],
  tag: 'gs-radio-button',
  templateKey: 'src/input/radio-button',
})
export class RadioButton extends BaseActionElement {
  @bind.host.attribute(null, 'gs-checked')
  private gsCheckedBridge_: DomBridge<boolean>;

  constructor(
      @inject('input.RadioButtonService') protected radioButtonService_: RadioButtonService) {
    super();
    this.gsCheckedBridge_ = DomBridge.of(BooleanParser, false /* deleteOnFalsy */);
  }

  /**
   * @override
   */
  protected onClick_(): void {
    super.onClick_();
    let element = this.getElement();
    if (!this.isDisabled() && element !== null) {
      this.radioButtonService_.setSelected(element.getEventTarget(), true);
    }
  }

  /**
   * Handles event when gs-checked attribute is changed.
   *
   * @param newValue The new value of gs-checked.
   * @param oldValue The old value of gs-checked.
   */
  @handle.host.attributeChange(null, 'gs-checked', BooleanParser)
  protected onGsCheckedChanged_(newValue: boolean, oldValue: boolean): void {
    if (newValue !== oldValue) {
      this.updateService_(newValue);
    }
  }

  /**
   * Handles event when gs-group attribute is changed.
   */
  @handle.host.attributeChange(null, 'gs-group', StringParser)
  protected onGsGroupChanged_(): void {
    this.updateService_(this.gsCheckedBridge_.get() || false);
  }

  /**
   * Updates the radio button service.
   *
   * @param isChecked True iff the element should be checked.
   */
  protected updateService_(isChecked: boolean): void {
    let element = this.getElement();
    if (element !== null) {
      this.radioButtonService_.setSelected(element.getEventTarget(), isChecked);
    }
  }
}