import {
  bind,
  BooleanParser,
  customElement,
  DomBridge,
  handle,
  StringParser} from 'external/gs_tools/src/webc';
import {inject} from 'external/gs_tools/src/inject';

import {BaseActionElement} from '../common/base-action-element';
import {RadioButtonService} from './radio-button-service';
import {ThemeService} from '../theming/theme-service';


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

  protected radioButtonService_: RadioButtonService;

  constructor(
      @inject('input.RadioButtonService') radioButtonService: RadioButtonService,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.gsCheckedBridge_ = DomBridge.of(BooleanParser, false /* deleteOnFalsy */);
    this.radioButtonService_ = radioButtonService;
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
  @handle(null).attributeChange('gs-checked', BooleanParser)
  protected onGsCheckedChanged_(newValue: boolean, oldValue: boolean): void {
    if (newValue !== oldValue) {
      this.updateService_(newValue);
    }
  }

  /**
   * Handles event when gs-group attribute is changed.
   */
  @handle(null).attributeChange('gs-group', StringParser)
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
