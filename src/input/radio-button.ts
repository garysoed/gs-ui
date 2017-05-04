import { inject } from 'external/gs_tools/src/inject';
import { BooleanParser, StringParser } from 'external/gs_tools/src/parse';
import {
  customElement,
  DomHook,
  handle,
  hook } from 'external/gs_tools/src/webc';

import { BaseActionElement } from '../common/base-action-element';
import { RadioButtonService } from '../input/radio-button-service';
import { ThemeService } from '../theming/theme-service';


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
  protected radioButtonService_: RadioButtonService;

  @hook(null).attribute('gs-checked', BooleanParser)
  private gsCheckedHook_: DomHook<boolean>;

  constructor(
      @inject('input.RadioButtonService') radioButtonService: RadioButtonService,
      @inject('theming.ThemeService') themeService: ThemeService) {
    super(themeService);
    this.gsCheckedHook_ = DomHook.of<boolean>(false /* deleteOnFalsy */);
    this.radioButtonService_ = radioButtonService;
  }

  /**
   * @override
   */
  protected onClick_(): void {
    super.onClick_();
    const element = this.getElement();
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
    this.updateService_(this.gsCheckedHook_.get() || false);
  }

  /**
   * Updates the radio button service.
   *
   * @param isChecked True iff the element should be checked.
   */
  protected updateService_(isChecked: boolean): void {
    const element = this.getElement();
    if (element !== null) {
      this.radioButtonService_.setSelected(element.getEventTarget(), isChecked);
    }
  }
}
