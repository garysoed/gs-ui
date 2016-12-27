
import {inject} from 'external/gs_tools/src/inject';
import {
  bind,
  BooleanParser,
  customElement,
  DomBridge,
  handle,
  StringParser} from 'external/gs_tools/src/webc';

import {ThemeService} from '../theming/theme-service';

import {BaseInput} from './base-input';


@customElement({
  tag: 'gs-text-input',
  templateKey: 'src/input/text-input',
})
export class TextInput extends BaseInput<string> {
  @bind(null).attribute('gs-value', StringParser)
  private readonly boundGsValueBridge_: DomBridge<string>;

  @bind('#input').attribute('disabled', BooleanParser)
  private readonly boundInputDisabledBridge_: DomBridge<boolean>;

  @bind('#input').property('value')
  private readonly boundInputValueBridge_: DomBridge<string>;

  constructor(@inject('theming.ThemeService') themeService: ThemeService) {
    super(
        themeService,
        DomBridge.of<string>(),
        DomBridge.of<string>(),
        StringParser);
    this.boundGsValueBridge_ = this.gsValueBridge_;
    this.boundInputDisabledBridge_ = this.inputDisabledBridge_;
    this.boundInputValueBridge_ = this.inputValueBridge_;
  }

  /**
   * Handles event when the value of gs-value attribute was changed.
   *
   * @param newValue The value it was changed to.
   */
  @handle(null).attributeChange('gs-value', StringParser)
  protected onGsValueChange_(newValue: string): void {
    super.onGsValueChange_(newValue);
  }
}
